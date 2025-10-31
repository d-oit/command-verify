import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const REQUIRED_FIELDS = ['command', 'category', 'confidence', 'validated', 'available', 'success', 'validatedAt'];

function checksum(command) {
  return crypto.createHash('sha1').update(command).digest('hex');
}

function isIsoDate(value) {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

function validateEntry(command, entry) {
  if (!entry || typeof entry !== 'object') {
    return { valid: false, reason: 'Entry is not an object' };
  }

  for (const field of REQUIRED_FIELDS) {
    if (!(field in entry)) {
      return { valid: false, reason: `Missing field "${field}"` };
    }
  }

  if (entry.command !== command) {
    return { valid: false, reason: 'Command mismatch' };
  }

  if (typeof entry.category !== 'string') {
    return { valid: false, reason: 'Invalid category type' };
  }

  if (typeof entry.confidence !== 'number') {
    return { valid: false, reason: 'Invalid confidence type' };
  }

  if (typeof entry.validated !== 'boolean') {
    return { valid: false, reason: 'Invalid validated flag' };
  }

  if (typeof entry.available !== 'boolean') {
    return { valid: false, reason: 'Invalid availability flag' };
  }

  if (typeof entry.success !== 'boolean') {
    return { valid: false, reason: 'Invalid success flag' };
  }

  if (!isIsoDate(entry.validatedAt)) {
    return { valid: false, reason: 'Invalid timestamp' };
  }

  if (entry.checksum && entry.checksum !== checksum(command)) {
    return { valid: false, reason: 'Checksum mismatch' };
  }

  if (entry.schemaVersion !== 1) {
    return { valid: false, reason: 'Unsupported cache schema version' };
  }

  return { valid: true };
}

function getCacheFilePath(command, config) {
  const hash = crypto.createHash('md5').update(command).digest('hex');
  return path.join(config.commandsCacheDir, `${hash}.json`);
}

async function discardCorruptedCache(cacheFile, logger, reason, stats) {
  logger?.warn?.(`⚠️  Cache corruption detected (${reason}). Repairing ${path.basename(cacheFile)}...`);
  await fs.rm(cacheFile, { force: true });
  if (stats) {
    stats.corrupted += 1;
  }
}

export async function loadCacheEntry(command, config, logger, stats) {
  const cacheFile = getCacheFilePath(command, config);

  try {
    const raw = await fs.readFile(cacheFile, 'utf-8');
    const entry = JSON.parse(raw);
    const validation = validateEntry(command, entry);

    if (!validation.valid) {
      await discardCorruptedCache(cacheFile, logger, validation.reason, stats);
      return { entry: null, repaired: true };
    }

    return { entry, repaired: false };
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { entry: null, repaired: false };
    }

    if (error instanceof SyntaxError) {
      await discardCorruptedCache(cacheFile, logger, 'Invalid JSON', stats);
      return { entry: null, repaired: true };
    }

    logger?.warn?.(`⚠️  Failed to read cache (${error.message}), scheduling rebuild.`);
    await fs.rm(cacheFile, { force: true });
    if (stats) {
      stats.corrupted += 1;
    }
    return { entry: null, repaired: true };
  }
}

export async function saveCacheEntry(command, data, config) {
  const cacheFile = getCacheFilePath(command, config);
  const normalised = {
    ...data,
    command,
    checksum: checksum(command),
    schemaVersion: 1,
  };

  await fs.mkdir(config.commandsCacheDir, { recursive: true });
  await fs.writeFile(cacheFile, JSON.stringify(normalised, null, 2));
  return normalised;
}

export async function clearCache(config) {
  await fs.rm(config.cacheDir, { recursive: true, force: true });
}

export async function ensureCacheStructure(config) {
  await fs.mkdir(config.commandsCacheDir, { recursive: true });
}
