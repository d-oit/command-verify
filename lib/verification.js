import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

import { extractCommandsFromMarkdown } from './command-extraction.js';
import { categorizeCommand } from './command-categorization.js';
import { loadConfiguration, ensureConfigReady, ConfigurationError } from './config.js';
import { findMatchingFiles } from './file-discovery.js';
import { loadCacheEntry, saveCacheEntry, clearCache, ensureCacheStructure } from './cache-manager.js';
import { buildValidationMessage } from './messages.js';

function toPosix(p) {
  return p.split(path.sep).join('/');
}

function createLogger(base = console, { silent = false } = {}) {
  const noop = () => {};
  const info = base.info ?? base.log ?? console.log;
  const warn = base.warn ?? base.error ?? base.log ?? console.warn;
  const error = base.error ?? base.warn ?? base.log ?? console.error;

  return {
    info: silent ? noop : message => info.call(base, message),
    warn: message => warn.call(base, message),
    error: message => error.call(base, message),
  };
}

export function parseCliArgs(argv = []) {
  return {
    force: argv.includes('--force'),
    stats: argv.includes('--stats'),
    silent: argv.includes('--silent'),
    json: argv.includes('--json'),
  };
}

function globToRegExp(pattern) {
  const escaped = pattern
    .replace(/[-/\\^$+?.()|[\]{}]/g, '\\$&')
    .replace(/\*\*/g, '.*')
    .replace(/\*/g, '[^/]*')
    .replace(/\?/g, '[^/]');

  return new RegExp(`^${escaped}$`);
}

function matchesPattern(file, pattern) {
  const target = toPosix(file);
  const normalizedPattern = pattern.replace(/\\/g, '/');

  if (normalizedPattern === '**/*.md' || normalizedPattern === '*.md') {
    return target.endsWith('.md');
  }

  if (normalizedPattern.endsWith('/**')) {
    const prefix = normalizedPattern.slice(0, -3);
    if (target === prefix) return true;
    return target.startsWith(`${prefix}/`);
  }

  return globToRegExp(normalizedPattern).test(target);
}

async function loadKnowledgeBase(config, logger) {
  if (!config.knowledgeBasePath) {
    return null;
  }

  try {
    const raw = await fs.readFile(config.knowledgeBasePath, 'utf-8');
    const parsed = JSON.parse(raw);
    logger.info(`🧠 Loaded knowledge base (${path.relative(config.cwd, config.knowledgeBasePath)})`);
    return parsed;
  } catch (error) {
    if (error.code === 'ENOENT') {
      if (config.failOnMissingKnowledgeBase) {
        throw new ConfigurationError(`Knowledge base not found at ${config.knowledgeBasePath}`, [
          'Create the file or disable it by setting knowledgeBasePath to null',
        ]);
      }
      logger.warn('⚠️  Knowledge base not found. Continuing with built-in rules.');
      return null;
    }

    if (error instanceof SyntaxError) {
      logger.warn(`⚠️  Knowledge base contains invalid JSON (${error.message}). Ignoring file.`);
      return null;
    }

    logger.warn(`⚠️  Failed to load knowledge base: ${error.message}`);
    if (config.failOnMissingKnowledgeBase) {
      throw error;
    }
    return null;
  }
}

async function discoverCommands(config, logger) {
  logger.info('📚 PHASE 1: Command Discovery');
  logger.info('============================================================');

  const markdownFiles = await findMatchingFiles(config.include, {
    cwd: config.cwd,
    ignore: config.ignore,
    fallback: config.fallbackFileDiscovery,
    logger,
  });

  logger.info(`📄 Found ${markdownFiles.length} markdown files`);

  const unique = new Map();

  for (const relativeFile of markdownFiles) {
    const absolutePath = path.resolve(config.cwd, relativeFile);
    const displayPath = path.normalize(relativeFile);
    const content = await fs.readFile(absolutePath, 'utf-8');
    const extracted = extractCommandsFromMarkdown(content, toPosix(displayPath));

    for (const match of extracted) {
      const commandText = match.command;
      const location = {
        file: match.file,
        line: match.line,
        type: match.type,
        language: match.language ?? null,
      };

      if (!unique.has(commandText)) {
        unique.set(commandText, {
          command: commandText,
          locations: [location],
        });
      } else {
        unique.get(commandText).locations.push(location);
      }
    }
  }

  const commands = [...unique.values()];
  logger.info(`✓ Discovered ${commands.length} unique commands`);
  return { commands, markdownFiles };
}

function getCurrentCommit(cwd, logger) {
  try {
    return execSync('git rev-parse HEAD', { cwd, encoding: 'utf-8' }).trim();
  } catch {
    logger.warn('⚠️  Not a git repository. Full validation will run.');
    return null;
  }
}

function getChangedFiles(sinceCommit, cwd, logger) {
  if (!sinceCommit) return new Set();

  try {
    const diff = execSync(`git diff --name-only ${sinceCommit} HEAD`, { cwd, encoding: 'utf-8' });
    const files = diff.split('\n').filter(Boolean);
    return new Set(files.map(file => path.normalize(file)));
  } catch (error) {
    logger.warn(`⚠️  git diff failed (${error.message}). Revalidating all commands.`);
    return new Set();
  }
}

function buildInvalidationRules(knowledgeBase) {
  const rules = [
    {
      pattern: file => file.endsWith('.md'),
      invalidate: (file, commands, affected) => {
        const normalized = toPosix(file);
        for (const cmd of commands) {
          if (cmd.locations.some(loc => toPosix(loc.file) === normalized)) {
            affected.add(cmd.command);
          }
        }
      },
    },
    {
      pattern: file => path.normalize(file) === 'package.json',
      invalidate: (file, commands, affected) => {
        for (const cmd of commands) {
          if (/^(npm|yarn|pnpm|node|npx)\s/.test(cmd.command)) {
            affected.add(cmd.command);
          }
        }
      },
    },
    {
      pattern: file => path.normalize(file) === 'tsconfig.json',
      invalidate: (file, commands, affected) => {
        for (const cmd of commands) {
          if (/\b(build|test|typecheck)\b/.test(cmd.command)) {
            affected.add(cmd.command);
          }
        }
      },
    },
    {
      pattern: file => file.startsWith('src' + path.sep),
      invalidate: (file, commands, affected) => {
        for (const cmd of commands) {
          if (cmd.command.includes('test')) {
            affected.add(cmd.command);
          }
        }
      },
    },
    {
      pattern: file => ['requirements.txt', 'setup.py', 'pyproject.toml'].includes(path.normalize(file)),
      invalidate: (file, commands, affected) => {
        for (const cmd of commands) {
          if (/^(pip|python)\s/.test(cmd.command)) {
            affected.add(cmd.command);
          }
        }
      },
    },
  ];

  const kbRules = knowledgeBase?.filePatterns?.rules ?? [];
  for (const rule of kbRules) {
    if (!rule.filePattern || !rule.invalidates) continue;
    const matcher = file => matchesPattern(file, rule.filePattern);
    rules.push({
      pattern: matcher,
      invalidate: (file, commands, affected) => {
        for (const target of rule.invalidates) {
          if (target === '*') {
            commands.forEach(cmd => affected.add(cmd.command));
            continue;
          }
          if (target === 'commands-in-same-file') {
            const normalized = toPosix(file);
            for (const cmd of commands) {
              if (cmd.locations.some(loc => toPosix(loc.file) === normalized)) {
                affected.add(cmd.command);
              }
            }
            continue;
          }
          for (const cmd of commands) {
            if (cmd.command.startsWith(target)) {
              affected.add(cmd.command);
            }
          }
        }
      },
    });
  }

  return rules;
}

function analyzeImpact(changedFiles, commands, knowledgeBase, logger) {
  logger.info('\n🔄 PHASE 2: Cache Analysis');
  logger.info('============================================================');

  if (!changedFiles || changedFiles.size === 0) {
    logger.info('ℹ️  No changed files detected. Attempting to reuse cache.');
    return new Set();
  }

  logger.info(`📝 Detected ${changedFiles.size} changed files since last validation`);

  const affected = new Set();
  const rules = buildInvalidationRules(knowledgeBase);

  for (const file of changedFiles) {
    for (const rule of rules) {
      try {
        if (rule.pattern(file)) {
          rule.invalidate(file, commands, affected);
        }
      } catch (error) {
        logger.warn(`⚠️  Failed to apply invalidation rule for ${file}: ${error.message}`);
      }
    }
  }

  logger.info(`⚡ ${affected.size} commands require revalidation`);
  return affected;
}

async function readLastValidatedCommit(config) {
  try {
    const raw = await fs.readFile(config.lastCommitFile, 'utf-8');
    return raw.trim();
  } catch {
    return null;
  }
}

async function writeLastValidatedCommit(config, commit) {
  if (!commit) return;
  await fs.mkdir(config.cacheDir, { recursive: true });
  await fs.writeFile(config.lastCommitFile, commit, 'utf-8');
}

async function testCommandAvailability(command) {
  const commandName = command.command.trim().split(/\s+/)[0];
  const lookupCommand = process.platform === 'win32' ? 'where' : 'which';

  try {
    execSync(`${lookupCommand} ${commandName}`, {
      encoding: 'utf-8',
      stdio: 'pipe',
      timeout: 2000,
    });
    return { available: true };
  } catch (error) {
    const detail = error && typeof error.message === 'string' ? `: ${error.message}` : '';
    return {
      available: false,
      error: `Command "${commandName}" not found on PATH${detail}`,
    };
  }
}

async function validateCommandEntry(commandEntry, context) {
  const { knowledgeBase, config, currentCommit } = context;
  const classification = categorizeCommand(commandEntry, knowledgeBase);
  const now = new Date().toISOString();

  if (classification.category === 'skip') {
    const message = buildValidationMessage({
      command: commandEntry.command,
      category: 'skip',
      available: true,
      locations: commandEntry.locations,
      treatUnknownAsWarnings: config.treatUnknownAsWarnings,
    });

    return {
      command: commandEntry.command,
      category: 'skip',
      confidence: classification.confidence,
      validated: true,
      available: true,
      success: true,
      duration: 0,
      message: message.message,
      suggestion: message.suggestion,
      severity: message.severity,
      validatedAt: now,
      commit: currentCommit,
    };
  }

  const availability = await testCommandAvailability(commandEntry);
  const message = buildValidationMessage({
    command: commandEntry.command,
    category: classification.category,
    available: availability.available,
    locations: commandEntry.locations,
    treatUnknownAsWarnings: config.treatUnknownAsWarnings,
  });

  let success = false;
  if (classification.category === 'safe') {
    success = availability.available;
  } else if (classification.category === 'conditional') {
    success = availability.available;
  } else if (classification.category === 'unknown') {
    success = availability.available && config.treatUnknownAsWarnings;
  } else if (classification.category === 'dangerous') {
    success = false;
  }

  if (!availability.available && classification.category !== 'skip') {
    success = false;
  }

  return {
    command: commandEntry.command,
    category: classification.category,
    confidence: classification.confidence,
    validated: true,
    available: availability.available,
    success,
    duration: 0,
    message: availability.available ? message.message : availability.error ?? message.message,
    suggestion: message.suggestion,
    severity: message.severity,
    validatedAt: now,
    commit: currentCommit,
  };
}

async function validateCommands(commands, affectedCommands, context, cacheStats, logger) {
  logger.info('\n✅ PHASE 3: Validation');
  logger.info('============================================================');

  const results = [];

  for (const commandEntry of commands) {
    const commandText = commandEntry.command;
    const needsRevalidation = affectedCommands.size === 0 ? false : affectedCommands.has(commandText);

    if (!needsRevalidation) {
      const { entry, repaired } = await loadCacheEntry(commandText, context.config, logger, cacheStats);
      if (entry) {
        cacheStats.hits += 1;
        results.push({ ...commandEntry, validation: entry });
        continue;
      }
      if (repaired) {
        cacheStats.repaired += 1;
      }
    }

    const validation = await validateCommandEntry(commandEntry, context);
    cacheStats.misses += 1;
    if (needsRevalidation) {
      cacheStats.revalidated += 1;
    }

    await saveCacheEntry(commandText, validation, context.config);
    results.push({ ...commandEntry, validation });
  }

  const fromCache = cacheStats.hits;
  const validated = results.length - fromCache;
  logger.info(`✓ Validated ${validated} commands (${fromCache} from cache)`);

  return results;
}

function generateSummary(commands, results, startTime, changedFiles, cacheStats, logger) {
  const durationMs = Date.now() - startTime;
  const total = commands.length;
  const safe = results.filter(r => r.validation.category === 'safe').length;
  const conditional = results.filter(r => r.validation.category === 'conditional').length;
  const dangerous = results.filter(r => r.validation.category === 'dangerous').length;
  const unknown = results.filter(r => r.validation.category === 'unknown').length;
  const skipped = results.filter(r => r.validation.category === 'skip').length;
  const available = results.filter(r => r.validation.available).length;
  const unavailable = total - available;

  const cacheHitRate = total > 0 ? Math.round((cacheStats.hits / total) * 100) : 0;

  logger.info('\n📊 PHASE 4: Summary');
  logger.info('============================================================');
  logger.info(`Total commands: ${total}`);
  logger.info(`Cache hit rate: ${cacheHitRate}% (${cacheStats.hits}/${total})`);
  logger.info(`Duration: ${(durationMs / 1000).toFixed(1)}s`);

  if (changedFiles.size > 0) {
    logger.info('\n📝 Changed files:');
    for (const file of changedFiles) {
      logger.info(`   ${file}`);
    }
  }

  logger.info('\n📋 Command breakdown:');
  logger.info(`   ✓ Safe: ${safe}`);
  logger.info(`   ⚠️  Conditional: ${conditional}`);
  logger.info(`   ⊝ Dangerous: ${dangerous}`);
  logger.info(`   ❓ Unknown: ${unknown}`);
  if (skipped > 0) {
    logger.info(`   ⏭️  Skipped: ${skipped}`);
  }

  logger.info('\n🖥️  System availability:');
  logger.info(`   ✓ Available: ${available}`);
  logger.info(`   ✗ Not available: ${unavailable}`);

  logger.info('\n🗄️  Cache stats:');
  logger.info(`   Hits: ${cacheStats.hits}`);
  logger.info(`   Misses: ${cacheStats.misses}`);
  logger.info(`   Revalidated after changes: ${cacheStats.revalidated}`);
  if (cacheStats.corrupted > 0 || cacheStats.repaired > 0) {
    logger.info(`   Corrupted entries repaired: ${cacheStats.corrupted}`);
    logger.info(`   Rebuilt after repair: ${cacheStats.repaired}`);
  }

  const unavailableCommands = results.filter(r => !r.validation.available && r.validation.category !== 'skip');
  if (unavailableCommands.length > 0) {
    logger.info('\n⚠️  Commands not found on this system:');
    for (const item of unavailableCommands) {
      logger.info(`   ✗ ${item.command}`);
    }
  }

  return {
    total,
    durationMs,
    safe,
    conditional,
    dangerous,
    unknown,
    skipped,
    available,
    unavailable,
    cache: { ...cacheStats, hitRate: cacheHitRate },
    changedFiles: [...changedFiles],
  };
}

export async function runVerification(options = {}) {
  const args = options.args ?? process.argv.slice(2);
  const cliArgs = parseCliArgs(args);
  const cwd = options.cwd ?? process.cwd();
  const logger = createLogger(options.logger ?? console, { silent: options.silent || cliArgs.silent });

  let config;
  try {
    config = await loadConfiguration(cwd);
    await ensureConfigReady(config);
  } catch (error) {
    if (error instanceof ConfigurationError) {
      logger.error(`Configuration error: ${error.message}`);
      if (error.hints?.length) {
        for (const hint of error.hints) {
          logger.error(`↳ Hint: ${hint}`);
        }
      }
      throw error;
    }
    throw error;
  }

  if (cliArgs.force || options.force) {
    logger.warn('🧹 Force mode: clearing cache');
    await clearCache(config);
  }

  await ensureCacheStructure(config);

  const knowledgeBase = await loadKnowledgeBase(config, logger);

  const startTime = Date.now();
  const { commands, markdownFiles } = await discoverCommands(config, logger);

  const lastCommit = await readLastValidatedCommit(config);
  const currentCommit = getCurrentCommit(config.cwd, logger);

  let changedFiles = new Set();
  let affectedCommands = new Set(commands.map(c => c.command));

  if (lastCommit && currentCommit && lastCommit !== currentCommit) {
    changedFiles = getChangedFiles(lastCommit, config.cwd, logger);
    affectedCommands = analyzeImpact(changedFiles, commands, knowledgeBase, logger);
    if (affectedCommands.size === 0) {
      affectedCommands = new Set();
    }
    logger.info(`ℹ️  Last validation commit: ${lastCommit}`);
    logger.info(`ℹ️  Current commit: ${currentCommit}`);
  } else if (lastCommit && currentCommit && lastCommit === currentCommit) {
    logger.info('ℹ️  No new commits since last validation.');
    affectedCommands = new Set();
  } else {
    logger.info('ℹ️  First run detected. Validating all commands.');
    affectedCommands = new Set(commands.map(c => c.command));
  }

  const cacheStats = { hits: 0, misses: 0, revalidated: 0, repaired: 0, corrupted: 0 };
  const results = await validateCommands(commands, affectedCommands, {
    knowledgeBase,
    config,
    currentCommit,
  }, cacheStats, logger);

  const summary = generateSummary(commands, results, startTime, changedFiles, cacheStats, logger);

  if (currentCommit) {
    await writeLastValidatedCommit(config, currentCommit);
  }

  logger.info('\n✅ Command verification complete!');

  return {
    commands,
    markdownFiles,
    results,
    summary,
    config,
    knowledgeBase,
  };
}

export { ConfigurationError } from './config.js';
