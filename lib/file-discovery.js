import fs from 'fs/promises';
import path from 'path';

const REMOTE_CANDIDATES = ['glob', 'fast-glob'];
const DEFAULT_OPTIONS = {
  cwd: process.cwd(),
  ignore: [],
  fallback: true,
  logger: console,
};

const regexCache = new Map();
const moduleOverrides = new Map();

export function __setFileDiscoveryModule(name, implementation) {
  if (implementation === undefined) {
    moduleOverrides.delete(name);
    return;
  }
  moduleOverrides.set(name, implementation);
}

function toPosix(p) {
  return p.split(path.sep).join('/');
}

function patternToRegex(pattern) {
  if (regexCache.has(pattern)) {
    return regexCache.get(pattern);
  }

  const escaped = pattern
    .replace(/[-/\\^$+?.()|[\]{}]/g, '\\$&')
    .replace(/\*\*/g, '.*')
    .replace(/\*/g, '[^/]*')
    .replace(/\?/g, '[^/]');

  const regex = new RegExp(`^${escaped}$`);
  regexCache.set(pattern, regex);
  return regex;
}

function matchesPattern(pattern, target, { treatDirectories = false } = {}) {
  const posixPattern = pattern.replace(/\\/g, '/');
  const posixTarget = target.replace(/\\/g, '/');

  if (posixPattern === '**/*.md' || posixPattern === '*.md') {
    return posixTarget.endsWith('.md');
  }

  if (posixPattern.endsWith('/**')) {
    const prefix = posixPattern.slice(0, -3);
    if (posixTarget === prefix) return true;
    if (posixTarget.startsWith(`${prefix}/`)) return true;
  }

  if (treatDirectories && (posixPattern === posixTarget || posixPattern === `${posixTarget}/`)) {
    return true;
  }

  return patternToRegex(posixPattern).test(posixTarget);
}

function shouldIgnore(target, patterns, { isDirectory }) {
  return patterns.some(pattern => matchesPattern(pattern, target, { treatDirectories: isDirectory }));
}

async function discoverWithModule(moduleName, patterns, options) {
  try {
    const override = moduleOverrides.get(moduleName);
    const mod = override ?? await import(moduleName);
    if (moduleName === 'fast-glob') {
      const fn = mod.default ?? mod;
      const matches = await fn(patterns, {
        cwd: options.cwd,
        ignore: options.ignore,
        onlyFiles: true,
        dot: false,
      });
      return matches.map(match => path.normalize(match));
    }

    const globFn = mod.glob ?? mod.default?.glob ?? mod.default;
    if (typeof globFn !== 'function') {
      throw new Error('glob implementation not found');
    }

    const results = new Set();
    for (const pattern of patterns) {
      const matches = await globFn(pattern, {
        cwd: options.cwd,
        ignore: options.ignore,
        nodir: true,
        dot: false,
      });
      for (const file of matches) {
        results.add(path.normalize(file));
      }
    }

    return [...results];
  } catch (error) {
    if (error.code === 'ERR_MODULE_NOT_FOUND' || /Cannot find module/.test(error.message)) {
      return null;
    }

    options.logger?.warn?.(`⚠️  ${moduleName} failed: ${error.message}`);
    return null;
  }
}

async function walkDirectory(root, dir, options, files) {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relative = toPosix(path.relative(root, fullPath));

    if (entry.isDirectory()) {
      if (shouldIgnore(relative, options.ignore, { isDirectory: true })) {
        continue;
      }
      await walkDirectory(root, fullPath, options, files);
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    if (shouldIgnore(relative, options.ignore, { isDirectory: false })) {
      continue;
    }

    files.push(relative);
  }
}

async function discoverWithNative(patterns, options) {
  const files = [];
  await walkDirectory(options.cwd, options.cwd, options, files);

  const results = new Set();
  for (const relative of files) {
    if (patterns.some(pattern => matchesPattern(pattern, relative, { treatDirectories: false }))) {
      results.add(path.normalize(relative));
    }
  }

  return [...results];
}

export async function findMatchingFiles(patterns, inputOptions = {}) {
  const options = { ...DEFAULT_OPTIONS, ...inputOptions };
  const uniquePatterns = Array.from(new Set(patterns));

  for (const candidate of REMOTE_CANDIDATES) {
    const matches = await discoverWithModule(candidate, uniquePatterns, options);
    if (matches && matches.length > 0) {
      if (candidate !== 'glob') {
        options.logger?.info?.(`ℹ️  Using ${candidate} for file discovery`);
      }
      return matches;
    }
  }

  if (!options.fallback) {
    throw new Error('No file discovery module available and fallback disabled');
  }

  options.logger?.warn?.('⚠️  Falling back to native file discovery (slower).');
  return discoverWithNative(uniquePatterns, options);
}
