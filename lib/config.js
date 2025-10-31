import fs from 'fs/promises';
import path from 'path';
import { pathToFileURL } from 'url';

export class ConfigurationError extends Error {
  constructor(message, hints = []) {
    super(message);
    this.name = 'ConfigurationError';
    this.hints = hints;
  }
}

const CONFIG_FILES = [
  'command-verify.config.json',
  'command-verify.config.js',
];

export const DEFAULT_CONFIG = {
  include: ['**/*.md'],
  ignore: ['node_modules/**', '.git/**', 'dist/**', 'build/**', '.cache/**'],
  cacheDir: '.cache/command-validations',
  knowledgeBasePath: '.claude/knowledge.json',
  treatUnknownAsWarnings: true,
  failOnMissingKnowledgeBase: false,
  fallbackFileDiscovery: true,
};

function validateStringArray(value, key) {
  if (!Array.isArray(value)) {
    throw new ConfigurationError(`"${key}" must be an array of strings`, [
      `Update ${key} to use an array: { "${key}": ["pattern1", "pattern2"] }`,
    ]);
  }

  const invalid = value.find(item => typeof item !== 'string' || item.trim() === '');
  if (invalid) {
    throw new ConfigurationError(`"${key}" contains a non-string or empty value`, [
      `Remove empty values from ${key} and ensure each entry is a non-empty string`,
    ]);
  }

  return value;
}

function validateBoolean(value, key) {
  if (typeof value !== 'boolean') {
    throw new ConfigurationError(`"${key}" must be a boolean`, [
      `Set ${key} to either true or false`,
    ]);
  }
  return value;
}

function validateString(value, key) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new ConfigurationError(`"${key}" must be a non-empty string`, [
      `Provide a string value for ${key}`,
    ]);
  }
  return value;
}

async function loadConfigModule(filePath) {
  try {
    const module = await import(pathToFileURL(filePath).href);
    return module.default ?? module.config ?? module;
  } catch (error) {
    throw new ConfigurationError(`Failed to load ${path.basename(filePath)}: ${error.message}`, [
      'Ensure the config exports a JSON-compatible default object',
    ]);
  }
}

async function readConfigFile(filePath) {
  if (filePath.endsWith('.json')) {
    try {
      const raw = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(raw);
    } catch (error) {
      throw new ConfigurationError(`Failed to parse ${path.basename(filePath)}: ${error.message}`, [
        'Verify the JSON syntax (quotes, commas, braces)',
        'Use an online JSON validator if needed',
      ]);
    }
  }

  return loadConfigModule(filePath);
}

function resolvePaths(config, cwd) {
  const resolved = { ...config };
  resolved.rootDir = cwd;
  resolved.cwd = cwd;
  resolved.cacheDir = path.resolve(cwd, config.cacheDir);
  resolved.commandsCacheDir = path.join(resolved.cacheDir, 'commands');
  resolved.lastCommitFile = path.join(resolved.cacheDir, 'last-validation-commit.txt');
  resolved.knowledgeBasePath = config.knowledgeBasePath
    ? path.resolve(cwd, config.knowledgeBasePath)
    : null;

  return resolved;
}

function validateConfigShape(config) {
  if (config == null || typeof config !== 'object' || Array.isArray(config)) {
    throw new ConfigurationError('Configuration must be an object', [
      'Export an object from command-verify.config.js or provide a JSON object',
    ]);
  }

  const result = { ...DEFAULT_CONFIG, ...config };

  if (config.include) {
    result.include = validateStringArray(config.include, 'include');
  }

  if (config.ignore) {
    result.ignore = validateStringArray(config.ignore, 'ignore');
  }

  if (config.cacheDir) {
    result.cacheDir = validateString(config.cacheDir, 'cacheDir');
  }

  if (config.knowledgeBasePath !== undefined) {
    if (config.knowledgeBasePath === null) {
      result.knowledgeBasePath = null;
    } else {
      result.knowledgeBasePath = validateString(config.knowledgeBasePath, 'knowledgeBasePath');
    }
  }

  if (config.treatUnknownAsWarnings !== undefined) {
    result.treatUnknownAsWarnings = validateBoolean(config.treatUnknownAsWarnings, 'treatUnknownAsWarnings');
  }

  if (config.failOnMissingKnowledgeBase !== undefined) {
    result.failOnMissingKnowledgeBase = validateBoolean(config.failOnMissingKnowledgeBase, 'failOnMissingKnowledgeBase');
  }

  if (config.fallbackFileDiscovery !== undefined) {
    result.fallbackFileDiscovery = validateBoolean(config.fallbackFileDiscovery, 'fallbackFileDiscovery');
  }

  return result;
}

export async function loadConfiguration(cwd = process.cwd()) {
  for (const file of CONFIG_FILES) {
    const fullPath = path.resolve(cwd, file);
    try {
      const stat = await fs.stat(fullPath);
      if (!stat.isFile()) continue;

      const rawConfig = await readConfigFile(fullPath);
      const validated = validateConfigShape(rawConfig);
      return resolvePaths(validated, cwd);
    } catch (error) {
      if (error.code === 'ENOENT') {
        continue;
      }

      if (error instanceof ConfigurationError) {
        throw error;
      }

      throw new ConfigurationError(`Cannot read ${file}: ${error.message}`);
    }
  }

  return resolvePaths(DEFAULT_CONFIG, cwd);
}

export async function ensureConfigReady(config) {
  await fs.mkdir(config.cacheDir, { recursive: true });

  if (config.knowledgeBasePath) {
    try {
      await fs.access(config.knowledgeBasePath);
    } catch {
      if (config.failOnMissingKnowledgeBase) {
        throw new ConfigurationError(`Knowledge base not found at ${config.knowledgeBasePath}`, [
          'Set "knowledgeBasePath" to a valid file or disable it by setting it to null',
        ]);
      }
    }
  }

  return config;
}
