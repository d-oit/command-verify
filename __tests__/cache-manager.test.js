import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import {
  saveCacheEntry,
  loadCacheEntry,
  clearCache,
  ensureCacheStructure,
} from '../lib/cache-manager.js';
import crypto from 'crypto';

function createConfig(root) {
  const cacheDir = path.join(root, '.cache');
  return {
    cacheDir,
    commandsCacheDir: path.join(cacheDir, 'commands'),
  };
}

async function createTempDir() {
  return fs.mkdtemp(path.join(os.tmpdir(), 'cmd-verify-cache-'));
}

describe('Cache manager', () => {
  let tempDir;
  let config;

  beforeEach(async () => {
    tempDir = await createTempDir();
    config = createConfig(tempDir);
    await ensureCacheStructure(config);
  });

  afterEach(async () => {
    if (!tempDir) return;
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('saves and loads cache entries with checksum metadata', async () => {
    const command = 'npm test';
    const saved = await saveCacheEntry(command, {
      category: 'safe',
      confidence: 0.9,
      validated: true,
      available: true,
      success: true,
      message: 'ok',
      validatedAt: new Date().toISOString(),
    }, config);

    expect(saved.schemaVersion).toBe(1);
    expect(saved.checksum).toBeDefined();

    const { entry, repaired } = await loadCacheEntry(command, config);
    expect(repaired).toBe(false);
    expect(entry.command).toBe(command);
  });

  it('repairs corrupted JSON entries automatically', async () => {
    const command = 'npm run build';
    const hash = crypto.createHash('md5').update(command).digest('hex');
    const cachePath = path.join(config.commandsCacheDir, `${hash}.json`);
    await fs.writeFile(cachePath, '{ invalid json');

    const stats = { corrupted: 0 };
    const log = { warn: vi.fn() };
    const { entry, repaired } = await loadCacheEntry(command, config, log, stats);
    expect(entry).toBeNull();
    expect(repaired).toBe(true);
    expect(stats.corrupted).toBe(1);
    expect(log.warn).toHaveBeenCalled();
  });

  it('clears entire cache directory on demand', async () => {
    await fs.writeFile(path.join(config.commandsCacheDir, 'test.json'), '{}');
    await clearCache(config);

    await expect(fs.access(config.cacheDir)).rejects.toThrow();
  });
});
