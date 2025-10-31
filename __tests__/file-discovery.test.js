import { describe, it, expect, afterEach } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { findMatchingFiles, __setFileDiscoveryModule } from '../lib/file-discovery.js';

async function createFixture() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'cmd-verify-files-'));
  await fs.mkdir(path.join(root, 'docs'), { recursive: true });
  await fs.writeFile(path.join(root, 'README.md'), '# Hello');
  await fs.writeFile(path.join(root, 'docs', 'guide.md'), '# Guide');
  await fs.writeFile(path.join(root, 'docs', 'notes.txt'), 'not markdown');
  return root;
}

afterEach(() => {
  __setFileDiscoveryModule('glob', undefined);
  __setFileDiscoveryModule('fast-glob', undefined);
});

describe('File discovery', () => {
  it('finds markdown files using available glob implementation', async () => {
    const cwd = await createFixture();
    try {
      const matches = await findMatchingFiles(['**/*.md'], {
        cwd,
        ignore: ['**/notes.txt'],
      });

      expect(matches.sort()).toEqual(['README.md', path.join('docs', 'guide.md')].sort());
    } finally {
      await fs.rm(cwd, { recursive: true, force: true });
    }
  });

  it('falls back to native discovery when glob modules are unavailable', async () => {
    const cwd = await createFixture();

    __setFileDiscoveryModule('glob', {
      glob: async () => {
        throw Object.assign(new Error('failure'), { code: 'ERR_MODULE_NOT_FOUND' });
      },
    });

    __setFileDiscoveryModule('fast-glob', {
      default: async () => {
        throw Object.assign(new Error('failure'), { code: 'ERR_MODULE_NOT_FOUND' });
      },
    });

    try {
      const matches = await findMatchingFiles(['**/*.md'], {
        cwd,
        ignore: [],
        fallback: true,
      });

      expect(matches).toContain('README.md');
      expect(matches).toContain(path.join('docs', 'guide.md'));
    } finally {
      await fs.rm(cwd, { recursive: true, force: true });
    }
  });
});
