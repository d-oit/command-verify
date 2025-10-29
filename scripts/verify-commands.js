#!/usr/bin/env node

/**
 * Universal Command Verifier
 *
 * A git diff-based intelligent cache invalidation system for command verification
 * in documentation. Zero tokens after initial setup, 90%+ cache hit rate.
 */

import fs from 'fs/promises';
import path from 'path';
import { execSync, spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { glob } from 'glob';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const CACHE_DIR = '.cache/command-validations';
const COMMANDS_CACHE_DIR = path.join(CACHE_DIR, 'commands');
const LAST_COMMIT_FILE = path.join(CACHE_DIR, 'last-validation-commit.txt');
const KNOWLEDGE_BASE_FILE = '.claude/knowledge.json';

// Global knowledge base (loaded at startup)
let knowledgeBase = null;

// Command patterns for discovery
const COMMAND_PATTERNS = {
  // Code blocks with language hints
  codeBlock: /^\s*```(bash|shell|console|sh|terminal|cmd|powershell)\s*$([\s\S]*?)^```$/gm,

  // Inline code that looks like commands
  inlineCode: /`([^`\n]+)`/g,

  // Multi-line code blocks without language hint (fallback)
  genericCodeBlock: /^\s*```\s*$([\s\S]*?)^```$/gm,
};

// Common command prefixes - used as hints, not requirements
// The system will also detect commands generically by pattern
const COMMON_COMMAND_PREFIXES = [
  'npm', 'yarn', 'pnpm', 'node', 'npx',
  'python', 'python3', 'pip', 'pip3',
  'cargo', 'rustc', 'rustup',
  'go', 'gofmt', 'golangci-lint',
  'docker', 'docker-compose',
  'git', 'make',
  'curl', 'wget',
  'ls', 'cat', 'find', 'grep',
  'mkdir', 'rm', 'cp', 'mv',
  'echo', 'printf',
  'cd', 'pwd',
  // NOTE: Don't hardcode specific tools like "claude-code"
  // The system detects them generically
];

/**
 * Check if text looks like a command
 */
function looksLikeCommand(text) {
  if (!text || text.length < 2) return false;

  const trimmed = text.trim();

  // Filter out obvious non-commands
  if (trimmed.startsWith('-')) return false; // Markdown list items
  if (trimmed.startsWith('*')) return false; // Markdown list items
  if (trimmed.startsWith('#')) return false; // Markdown headers or comments
  if (trimmed.startsWith('>')) return false; // Markdown quotes
  if (trimmed.startsWith('//')) return false; // Code comments
  if (/^[0-9]+\./.test(trimmed)) return false; // Numbered lists
  if (/:\s*[0-9]/.test(trimmed)) return false; // Text with statistics (e.g., "rate: 91.3%")
  if (/[A-Z][a-z]+:/.test(trimmed)) return false; // Prose with colons (e.g., "Summary:")
  if (trimmed.endsWith(':')) return false; // Text ending with colon (prose)
  if (trimmed.includes('...')) return false; // Ellipsis indicates prose
  if (trimmed.match(/\b(the|a|an|is|are|was|were|be|been|being)\b/i)) return false; // Common English words
  if (trimmed.length > 100) return false; // Commands are typically shorter

  // Filter out file paths and URLs
  if (trimmed.includes('.md') || trimmed.includes('.json') || trimmed.includes('.js') || trimmed.includes('.ts')) return false;
  if (trimmed.startsWith('.')) return false; // Hidden folders like .claude/
  if (trimmed.includes('<') || trimmed.includes('>')) return false; // HTML/XML tags or placeholders
  if (trimmed.match(/^\[.*\]$/)) return false; // Array literals in code
  if (trimmed.includes(' = ')) return false; // Variable assignments

  // Filter out dates and version strings
  if (/^\d{4}.*Q[1-4]/.test(trimmed)) return false; // Dates like "2025 Q3"
  if (/^v\d+\.\d+/.test(trimmed)) return false; // Version strings like "v0.4.0"

  // Filter out code snippets
  if (trimmed.startsWith('const ') || trimmed.startsWith('let ') || trimmed.startsWith('var ')) return false;
  if (trimmed.startsWith('function ') || trimmed.startsWith('class ')) return false;

  // Check for known command prefixes as a hint
  if (COMMON_COMMAND_PREFIXES.some(prefix => trimmed.startsWith(prefix + ' ') || trimmed === prefix)) {
    return true;
  }

  // Check for common command patterns
  if (/^(sudo|su)\s+/.test(trimmed)) return true;
  if (/^[./]/.test(trimmed)) return true; // Relative paths like ./script.sh

  // Detect hyphenated CLI tools (common pattern: word-word, e.g., any-tool-name)
  // Matches patterns like: tool-name, word-word, etc.
  if (/^[a-z]+(-[a-z]+)+(\s|$)/.test(trimmed)) return true;

  // Allow simple command patterns that look like actual commands
  // Must start with lowercase word, followed by space and args
  // No commas or parentheses (which suggest prose)
  if (/^[a-z][a-z0-9_-]*\s+/.test(trimmed) && !trimmed.includes(',') && !trimmed.includes('(')) {
    return true;
  }

  return false;
}

/**
 * Extract commands from markdown content
 */
function extractCommandsFromMarkdown(content, filePath) {
  const commands = [];
  const lines = content.split('\n');

  // Extract from code blocks with language hints
  let match;
  while ((match = COMMAND_PATTERNS.codeBlock.exec(content)) !== null) {
    const blockContent = match[2];
    const blockLines = blockContent.split('\n');

    blockLines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (looksLikeCommand(trimmed)) {
        const lineNumber = content.substring(0, match.index).split('\n').length + idx + 1;
        commands.push({
          command: trimmed,
          file: filePath,
          line: lineNumber,
          type: 'code-block',
          language: match[1]
        });
      }
    });
  }

  // Extract from inline code
  let inlineMatch;
  while ((inlineMatch = COMMAND_PATTERNS.inlineCode.exec(content)) !== null) {
    const command = inlineMatch[1].trim();
    if (looksLikeCommand(command)) {
      const beforeMatch = content.substring(0, inlineMatch.index);
      const lineNumber = beforeMatch.split('\n').length;
      commands.push({
        command,
        file: filePath,
        line: lineNumber,
        type: 'inline'
      });
    }
  }

  // Extract from generic code blocks (fallback)
  let genericMatch;
  while ((genericMatch = COMMAND_PATTERNS.genericCodeBlock.exec(content)) !== null) {
    const blockContent = genericMatch[1];
    const blockLines = blockContent.split('\n');

    blockLines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (looksLikeCommand(trimmed)) {
        const lineNumber = content.substring(0, genericMatch.index).split('\n').length + idx + 1;
        commands.push({
          command: trimmed,
          file: filePath,
          line: lineNumber,
          type: 'code-block',
          language: 'unknown'
        });
      }
    });
  }

  return commands;
}

/**
 * Discover all commands in all markdown files
 */
async function discoverCommands() {
  console.log('📄 Finding markdown files...');

  const markdownFiles = await glob('**/*.md', {
    ignore: [
      'node_modules/**',
      '.git/**',
      'dist/**',
      'build/**',
      '.cache/**'
    ]
  });

  console.log(`📄 Found ${markdownFiles.length} markdown files`);

  const allCommands = [];

  for (const file of markdownFiles) {
    const content = await fs.readFile(file, 'utf-8');
    const commands = extractCommandsFromMarkdown(content, file);
    allCommands.push(...commands);
  }

  // Remove duplicates based on command text
  const uniqueCommands = [];
  const seen = new Set();

  for (const cmd of allCommands) {
    if (!seen.has(cmd.command)) {
      seen.add(cmd.command);
      uniqueCommands.push(cmd);
    } else {
      // Add location to existing command
      const existing = uniqueCommands.find(c => c.command === cmd.command);
      if (existing) {
        if (!existing.locations) {
          existing.locations = [existing];
          delete existing.file;
          delete existing.line;
          delete existing.type;
        }
        existing.locations.push({
          file: cmd.file,
          line: cmd.line,
          type: cmd.type
        });
      }
    }
  }

  console.log(`✓ Discovered ${uniqueCommands.length} unique commands`);
  return uniqueCommands;
}

/**
 * Get current git commit
 */
function getCurrentCommit() {
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
  } catch (e) {
    console.warn('⚠️  Not a git repository, treating as first run');
    return null;
  }
}

/**
 * Get git diff since last validation
 */
function getChangedFiles(sinceCommit) {
  if (!sinceCommit) return new Set();

  try {
    const diff = execSync(`git diff --name-only ${sinceCommit} HEAD`, { encoding: 'utf-8' });
    const files = diff.split('\n').filter(f => f.trim());
    return new Set(files);
  } catch (e) {
    console.warn('⚠️  Could not get git diff, validating all commands');
    return new Set();
  }
}

/**
 * Analyze which commands are affected by file changes
 */
function analyzeImpact(changedFiles, allCommands) {
  console.log('🔍 Analyzing which commands need revalidation...');

  const affectedCommands = new Set();
  const changedFileSet = new Set(changedFiles);

  // Rules for invalidation
  const invalidationRules = [
    // Markdown files directly affect their commands
    {
      pattern: /\.md$/,
      action: (file, commands) => {
        for (const cmd of commands) {
          if (cmd.locations) {
            if (cmd.locations.some(loc => loc.file === file)) {
              affectedCommands.add(cmd.command);
            }
          } else if (cmd.file === file) {
            affectedCommands.add(cmd.command);
          }
        }
      }
    },

    // package.json changes affect npm commands
    {
      pattern: /^package\.json$/,
      action: (file, commands) => {
        for (const cmd of commands) {
          if (cmd.command.startsWith('npm ') || cmd.command.startsWith('yarn ') || cmd.command.startsWith('pnpm ')) {
            affectedCommands.add(cmd.command);
          }
        }
      }
    },

    // TypeScript config affects build/test commands
    {
      pattern: /^tsconfig\.json$/,
      action: (file, commands) => {
        for (const cmd of commands) {
          if (cmd.command.includes('build') || cmd.command.includes('test') || cmd.command.includes('typecheck')) {
            affectedCommands.add(cmd.command);
          }
        }
      }
    },

    // Cargo.toml affects Rust commands
    {
      pattern: /^Cargo\.toml$/,
      action: (file, commands) => {
        for (const cmd of commands) {
          if (cmd.command.startsWith('cargo ')) {
            affectedCommands.add(cmd.command);
          }
        }
      }
    },

    // Source code changes affect test commands
    {
      pattern: /^src\//,
      action: (file, commands) => {
        for (const cmd of commands) {
          if (cmd.command.includes('test')) {
            affectedCommands.add(cmd.command);
          }
        }
      }
    },

    // Requirements files affect Python commands
    {
      pattern: /^(requirements\.txt|setup\.py|pyproject\.toml)$/,
      action: (file, commands) => {
        for (const cmd of commands) {
          if (cmd.command.startsWith('pip ') || cmd.command.startsWith('python ')) {
            affectedCommands.add(cmd.command);
          }
        }
      }
    }
  ];

  // Apply rules
  for (const file of changedFiles) {
    for (const rule of invalidationRules) {
      if (rule.pattern.test(file)) {
        rule.action(file, allCommands);
      }
    }
  }

  console.log(`⚡ ${affectedCommands.size} commands need revalidation`);
  return affectedCommands;
}

/**
 * Load cached validation for a command
 */
async function loadCommandCache(command) {
  const hash = crypto.createHash('md5').update(command).digest('hex');
  const cacheFile = path.join(COMMANDS_CACHE_DIR, `${hash}.json`);

  try {
    const data = await fs.readFile(cacheFile, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}

/**
 * Save command validation to cache
 */
async function saveCommandCache(command, data) {
  const hash = crypto.createHash('md5').update(command).digest('hex');
  const cacheFile = path.join(COMMANDS_CACHE_DIR, `${hash}.json`);

  await fs.mkdir(COMMANDS_CACHE_DIR, { recursive: true });
  await fs.writeFile(cacheFile, JSON.stringify(data, null, 2));
}

/**
 * Load knowledge base from .claude/knowledge.json
 */
async function loadKnowledgeBase() {
  try {
    const content = await fs.readFile(KNOWLEDGE_BASE_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    // Knowledge base doesn't exist or is invalid - use hardcoded patterns only
    return null;
  }
}

/**
 * Check if command should be skipped (documentation example, not a real command)
 */
function shouldSkipCommand(cmd, knowledge) {
  if (!knowledge?.validationRules?.skip) return false;

  const { patterns = [], exactMatches = [] } = knowledge.validationRules.skip;

  // Check exact matches first
  if (exactMatches.includes(cmd)) return true;

  // Check patterns
  for (const pattern of patterns) {
    try {
      if (new RegExp(pattern).test(cmd)) return true;
    } catch (e) {
      // Invalid regex, skip
    }
  }

  return false;
}

/**
 * Check knowledge base for command categorization
 * Returns: { category: string, confidence: number } or null if not found
 */
function checkKnowledgeBase(cmd, knowledge) {
  if (!knowledge?.validationRules) return null;

  const categories = ['dangerous', 'safe', 'conditional']; // Check dangerous first

  for (const category of categories) {
    const rules = knowledge.validationRules[category];
    if (!rules) continue;

    const { patterns = [], exactMatches = [] } = rules;

    // Check exact matches first
    if (exactMatches.includes(cmd)) {
      return { category, confidence: 1.0 };
    }

    // Check patterns
    for (const pattern of patterns) {
      try {
        if (new RegExp(pattern).test(cmd)) {
          return { category, confidence: 0.95 };
        }
      } catch (e) {
        // Invalid regex, skip
      }
    }
  }

  return null; // Not found in knowledge base
}

/**
 * Categorize command safety
 */
function categorizeCommand(command) {
  const cmd = command.command || command;

  // Check if this command should be skipped entirely
  if (knowledgeBase && shouldSkipCommand(cmd, knowledgeBase)) {
    return { category: 'skip', confidence: 1.0 };
  }

  // Check knowledge base first (takes precedence over hardcoded patterns)
  if (knowledgeBase) {
    const kbResult = checkKnowledgeBase(cmd, knowledgeBase);
    if (kbResult) return kbResult;
  }

  // Fall back to hardcoded patterns
  // Dangerous commands - never execute
  const dangerous = [
    /rm\s+-rf/,
    /git push.*--force/,
    /npm run.*(?:clean|clear|reset)/,
    /npm run.*:(?:force|clean|clear|reset)/,  // Force operations via npm scripts
    /drop database/,
    /truncate/,
    /delete.*--force/,
    /--force/,
    /sudo.*rm/,
    /format.*--yes/,
    /:clean/
  ];

  // Conditional commands - ask before running
  const conditional = [
    /npm install/,
    /yarn add/,
    /pip install/,
    /cargo add/,
    /go mod/,
    /docker build/,
    /docker run.*-p/,
    /git commit/,
    /git push(?!.*--force)/,  // git push without --force
    /git add/,
    /git init/,
    /git clone/,
    /git checkout -b/,
    /npm run format/,
    /prettier.*--write/,
    /npx husky/,  // Git hooks modification
    /npx rimraf/  // Cross-platform rm -rf
  ];

  // Safe commands - auto-execute
  const safe = [
    /^npm run (build|test|lint|typecheck|dev|verify)$/,
    /^yarn (build|test|lint|typecheck|dev)$/,
    /^pnpm (build|test|lint|typecheck|dev)$/,
    /^cargo (build|test|check)$/,
    /^go (build|test|vet)$/,
    /^git (status|log|diff|show|branch)$/,
    /^git diff/,  // Git diff with args is also safe (read-only)
    /^docker ps$/,
    /^docker images$/,
    /^node --version$/,
    /^python --version$/,
    /^npm --version$/,
    /^git --version$/,
    /^cd /,  // Change directory (safe to execute)
    /^ls/,
    /^cat/,
    /^find/,
    /^grep.*--help/,
    /^echo/,
    /^pwd$/
  ];

  // Check dangerous first
  for (const pattern of dangerous) {
    if (pattern.test(cmd)) {
      return { category: 'dangerous', confidence: 0.95 };
    }
  }

  // Check safe
  for (const pattern of safe) {
    if (pattern.test(cmd)) {
      return { category: 'safe', confidence: 0.95 };
    }
  }

  // Check conditional
  for (const pattern of conditional) {
    if (pattern.test(cmd)) {
      return { category: 'conditional', confidence: 0.90 };
    }
  }

  // Unknown - low confidence
  return { category: 'unknown', confidence: 0.50 };
}

/**
 * Test if a command is available on the system
 * Returns { available: boolean, error: string|null }
 */
async function testCommandAvailability(command) {
  const cmd = command.command || command;

  // Extract just the command name (first word)
  const commandName = cmd.split(/\s+/)[0];

  // Test using 'which' (Unix) or 'where' (Windows)
  const testCmd = process.platform === 'win32' ? 'where' : 'which';

  try {
    execSync(`${testCmd} ${commandName}`, {
      encoding: 'utf-8',
      stdio: 'pipe',
      timeout: 2000  // 2 second timeout
    });
    return { available: true, error: null };
  } catch (error) {
    return {
      available: false,
      error: `Command '${commandName}' not found on system`
    };
  }
}

/**
 * Validate a command (categorize + test availability)
 */
async function validateCommand(command) {
  const categorization = categorizeCommand(command);

  // Test if command is available on the system
  const availability = await testCommandAvailability(command);

  const result = {
    command: command.command || command,
    category: categorization.category,
    confidence: categorization.confidence,
    validated: true,
    available: availability.available,  // NEW: Is it on this system?
    success: categorization.category !== 'unknown' && availability.available,
    duration: 0,
    message: !availability.available ?
      availability.error :
      (categorization.category === 'unknown' ?
        'Unknown command pattern but available on system' :
        `Categorized as ${categorization.category}, available on system`),
    validatedAt: new Date().toISOString(),
    commit: getCurrentCommit()
  };

  return result;
}

/**
 * Validate all commands
 */
async function validateCommands(commands, affectedCommands) {
  console.log('✅ Validating commands...');

  const results = [];
  let validated = 0;

  for (const command of commands) {
    const isAffected = affectedCommands.has(command.command);

    if (!isAffected) {
      // Load from cache
      const cached = await loadCommandCache(command.command);
      if (cached) {
        results.push({ ...command, validation: cached });
        continue;
      }
    }

    // Validate
    const validation = await validateCommand(command);
    results.push({ ...command, validation });

    // Save to cache
    await saveCommandCache(command.command, validation);

    validated++;
  }

  console.log(`✓ Validated ${validated} commands (${commands.length - validated} from cache)`);
  return results;
}

/**
 * Generate summary report
 */
function generateSummary(commands, results, startTime, changedFiles) {
  const totalCommands = commands.length;
  const cached = results.filter(r => !r.validation.validatedAt || r.validation.validatedAt !== new Date().toISOString()).length;
  const validated = totalCommands - cached;
  const cacheHitRate = totalCommands > 0 ? Math.round((cached / totalCommands) * 100) : 0;

  const safe = results.filter(r => r.validation.category === 'safe').length;
  const conditional = results.filter(r => r.validation.category === 'conditional').length;
  const dangerous = results.filter(r => r.validation.category === 'dangerous').length;
  const unknown = results.filter(r => r.validation.category === 'unknown').length;
  const skipped = results.filter(r => r.validation.category === 'skip').length;

  // NEW: Track system availability
  const available = results.filter(r => r.validation.available === true).length;
  const notAvailable = results.filter(r => r.validation.available === false).length;

  const duration = Date.now() - startTime;

  console.log('\n📊 PHASE 4: Summary');
  console.log('============================================================');
  console.log(`Total: ${totalCommands} commands`);
  console.log(`Cache hit rate: ${cacheHitRate}% (${cached}/${totalCommands} from cache)`);
  console.log(`Token usage: 0 (all deterministic)`);
  console.log(`Time: ${(duration / 1000).toFixed(1)}s`);

  if (changedFiles && changedFiles.size > 0) {
    console.log(`\n📝 Changed files since last validation:`);
    for (const file of changedFiles) {
      console.log(`   ${file}`);
    }
  }

  console.log('\n📋 Command breakdown:');
  console.log(`   ✓ ${safe} safe commands`);
  console.log(`   ⚠️  ${conditional} conditional commands`);
  console.log(`   ⊝ ${dangerous} dangerous commands`);
  console.log(`   ❓ ${unknown} unknown commands`);
  if (skipped > 0) {
    console.log(`   ⏭️  ${skipped} skipped (documentation examples)`);
  }

  console.log('\n🖥️  System availability:');
  console.log(`   ✓ ${available} commands available on this system`);
  console.log(`   ✗ ${notAvailable} commands NOT available`);

  // List commands not available (excluding skipped documentation examples)
  const notAvailableReal = results.filter(r =>
    r.validation.available === false && r.validation.category !== 'skip'
  );

  if (notAvailableReal.length > 0) {
    console.log('\n⚠️  Commands not found on system:');
    for (const result of notAvailableReal) {
      console.log(`   ✗ ${result.command}`);
    }
  }

  // Save last commit
  const currentCommit = getCurrentCommit();
  if (currentCommit) {
    fs.writeFile(LAST_COMMIT_FILE, currentCommit);
  }
}

/**
 * Main execution
 */
async function main() {
  const startTime = Date.now();

  console.log('🚀 Universal Command Verifier\n');
  console.log('============================================================\n');

  // Phase 0: Load knowledge base
  knowledgeBase = await loadKnowledgeBase();
  if (knowledgeBase) {
    console.log('🧠 Loaded knowledge base from .claude/knowledge.json\n');
  }

  // Phase 1: Discovery
  console.log('📚 PHASE 1: Command Discovery');
  console.log('============================================================');
  const commands = await discoverCommands();

  // Phase 2: Cache Analysis
  console.log('\n🔄 PHASE 2: Cache Analysis');
  console.log('============================================================');

  const lastCommit = await fs.readFile(LAST_COMMIT_FILE, 'utf-8').catch(() => null);
  const currentCommit = getCurrentCommit();

  let affectedCommands = new Set();
  let changedFiles = new Set();

  if (lastCommit && currentCommit && lastCommit.trim() !== currentCommit) {
    changedFiles = getChangedFiles(lastCommit.trim());
    affectedCommands = analyzeImpact(changedFiles, commands);

    console.log(`ℹ️  Last validation: ${lastCommit.substring(0, 8)}`);
    console.log(`ℹ️  Current commit: ${currentCommit.substring(0, 8)}`);
    console.log(`ℹ️  Changed files: ${changedFiles.size}`);
  } else {
    console.log('ℹ️  First run - validating all commands');
    affectedCommands = new Set(commands.map(c => c.command));
  }

  // Phase 3: Validation
  console.log('\n✅ PHASE 3: Validation');
  console.log('============================================================');
  const results = await validateCommands(commands, affectedCommands);

  // Phase 4: Summary
  generateSummary(commands, results, startTime, changedFiles);

  console.log('\n✅ Command verification complete!');
}

// Handle command line arguments
if (process.argv.includes('--force')) {
  console.log('🧹 Force mode: clearing cache...');
  await fs.rm(CACHE_DIR, { recursive: true, force: true });
}

// Note: --stats flag is supported and runs the same flow as default
// (main() already outputs comprehensive statistics)

main().catch(console.error);