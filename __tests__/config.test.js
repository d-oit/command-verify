import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { loadConfiguration, ensureConfigReady, ConfigurationError, DEFAULT_CONFIG } from '../lib/config.js';

async function createTempDir() {
  return fs.mkdtemp(path.join(os.tmpdir(), 'cmd-verify-config-'));
}

describe('Configuration loader', () => {
  let tempDir;

  beforeEach(async () => {
    tempDir = await createTempDir();
  });

  afterEach(async () => {
    if (!tempDir) return;
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('returns defaults when no config file is present', async () => {
    const config = await loadConfiguration(tempDir);
    expect(config.include).toEqual(DEFAULT_CONFIG.include);
    expect(config.ignore).toEqual(DEFAULT_CONFIG.ignore);
    expect(path.isAbsolute(config.cacheDir)).toBe(true);
    expect(config.cacheDir).toContain(path.sep);
  });

  it('resolves JSON configuration overrides', async () => {
    const configPath = path.join(tempDir, 'command-verify.config.json');
    await fs.writeFile(configPath, JSON.stringify({
      include: ['docs/**/*.md'],
      cacheDir: '.tmp/cache',
      knowledgeBasePath: 'kb.json',
      treatUnknownAsWarnings: false,
    }));

    const config = await loadConfiguration(tempDir);
    expect(config.include).toEqual(['docs/**/*.md']);
    expect(config.treatUnknownAsWarnings).toBe(false);
    expect(config.cacheDir.endsWith(path.normalize('.tmp/cache'))).toBe(true);
    expect(config.knowledgeBasePath.endsWith(path.normalize('kb.json'))).toBe(true);
  });

  it('throws descriptive errors for invalid shapes', async () => {
    const configPath = path.join(tempDir, 'command-verify.config.json');
    await fs.writeFile(configPath, JSON.stringify({ include: 'docs/*.md' }));

    await expect(loadConfiguration(tempDir)).rejects.toThrow(ConfigurationError);
  });

  it('honours failOnMissingKnowledgeBase flag', async () => {
    const configPath = path.join(tempDir, 'command-verify.config.json');
    await fs.writeFile(configPath, JSON.stringify({
      failOnMissingKnowledgeBase: true,
      knowledgeBasePath: 'missing.json',
    }));

    const config = await loadConfiguration(tempDir);
    await expect(ensureConfigReady(config)).rejects.toThrow(ConfigurationError);
  });

  it('creates cache directories during ensureConfigReady', async () => {
    const config = await loadConfiguration(tempDir);
    await ensureConfigReady(config);

    const stat = await fs.stat(config.cacheDir);
    expect(stat.isDirectory()).toBe(true);
  });
});
