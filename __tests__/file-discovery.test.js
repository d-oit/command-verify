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

  it('uses fast-glob when available', async () => {
    const cwd = await createFixture();

    __setFileDiscoveryModule('fast-glob', {
      default: async (patterns, options) => {
        expect(patterns).toEqual(['**/*.md']);
        expect(options.cwd).toBe(cwd);
        return ['docs/guide.md'];
      },
    });

    // Override the module to ensure only the mock is used
    __setFileDiscoveryModule('glob', {
      glob: async () => {
        // Return empty to ensure fast-glob is used
        return [];
      },
    });

    try {
      const matches = await findMatchingFiles(['**/*.md'], {
        cwd,
        ignore: [],
      });

      expect(matches).toEqual([path.normalize('docs/guide.md')]);
      expect(matches).not.toContain('README.md');
    } finally {
      await fs.rm(cwd, { recursive: true, force: true });
    }
  });

  it('handles module loading failures gracefully', async () => {
    const cwd = await createFixture();

    __setFileDiscoveryModule('glob', {
      default: () => {
        throw new Error('Module not found');
      },
    });

    try {
      const matches = await findMatchingFiles(['**/*.md'], {
        cwd,
        ignore: [],
      });

      expect(matches).toContain('README.md');
    } finally {
      await fs.rm(cwd, { recursive: true, force: true });
    }
  });

  it('handles ERR_MODULE_NOT_FOUND errors', async () => {
    const cwd = await createFixture();

    __setFileDiscoveryModule('glob', {
      glob: () => {
        throw Object.assign(new Error('Cannot find module'), {
          code: 'ERR_MODULE_NOT_FOUND',
        });
      },
    });

    try {
      const matches = await findMatchingFiles(['**/*.md'], {
        cwd,
        ignore: [],
      });

      expect(matches).toContain('README.md');
      expect(matches).toContain(path.normalize('docs/guide.md'));
    } finally {
      await fs.rm(cwd, { recursive: true, force: true });
    }
  });

  it('throws error when fallback is disabled and no modules available', async () => {
    const cwd = await createFixture();

    __setFileDiscoveryModule('glob', {
      glob: () => {
        throw Object.assign(new Error('Cannot find module'), {
          code: 'ERR_MODULE_NOT_FOUND',
        });
      },
    });

    __setFileDiscoveryModule('fast-glob', {
      default: () => {
        throw Object.assign(new Error('Cannot find module'), {
          code: 'ERR_MODULE_NOT_FOUND',
        });
      },
    });

    try {
      await expect(findMatchingFiles(['**/*.md'], {
        cwd,
        ignore: [],
        fallback: false,
      })).rejects.toThrow('No file discovery module available');
    } finally {
      await fs.rm(cwd, { recursive: true, force: true });
    }
  });

  it('handles different pattern matching scenarios', async () => {
    const cwd = await createFixture();

    try {
      // Test **/*.md pattern
      const matches1 = await findMatchingFiles(['**/*.md'], { cwd, ignore: [] });
      expect(matches1).toContain('README.md');
      expect(matches1).toContain(path.normalize('docs/guide.md'));

      // Test *.md pattern
      const matches2 = await findMatchingFiles(['*.md'], { cwd, ignore: [] });
      expect(matches2).toContain('README.md');
      expect(matches2).not.toContain('docs/guide.md');

      // Test directory pattern
      const matches3 = await findMatchingFiles(['docs/**'], { cwd, ignore: [] });
      expect(matches3).toContain(path.normalize('docs/guide.md'));
      expect(matches3).toContain(path.normalize('docs/notes.txt'));

      // Test exclusion pattern
      const matches4 = await findMatchingFiles(['**/*'], {
        cwd,
        ignore: ['**/notes.txt'],
      });
      expect(matches4).toContain('README.md');
      expect(matches4).toContain(path.normalize('docs/guide.md'));
      expect(matches4).not.toContain(path.normalize('docs/notes.txt'));
    } finally {
      await fs.rm(cwd, { recursive: true, force: true });
    }
  });

  it('handles edge cases with empty or null patterns', async () => {
    const cwd = await createFixture();

    try {
      const matches = await findMatchingFiles([''], {
        cwd,
        ignore: [],
      });
      
      expect(matches).toEqual([]);
    } finally {
      await fs.rm(cwd, { recursive: true, force: true });
    }
  });

  it('handles pattern caching performance', async () => {
    const cwd = await createFixture();

    const mockGlob = vi.fn().mockImplementation((pattern) => {
      if (pattern === '**/*.md') return ['README.md', 'docs/guide.md'];
      return [];
    });

    __setFileDiscoveryModule('glob', {
      glob: mockGlob,
    });

    try {
      // Multiple calls should use cached regex
      await findMatchingFiles(['**/*.md'], { cwd, ignore: [] });
      await findMatchingFiles(['**/*.md'], { cwd, ignore: [] });
      
      expect(mockGlob).toHaveBeenCalledTimes(2);
    } finally {
      await fs.rm(cwd, { recursive: true, force: true });
    }
  });

  it('handles mixed module override scenarios', async () => {
    const cwd = await createFixture();

    // Set glob to return empty, fast-glob to return results
    __setFileDiscoveryModule('glob', {
      glob: () => [],
    });

    __setFileDiscoveryModule('fast-glob', {
      default: (_patterns) => ['docs/guide.md'],
    });

    try {
      const matches = await findMatchingFiles(['**/*.md'], { cwd, ignore: [] });
      
      // Should fall back to fast-glob
      expect(matches).toEqual([path.normalize('docs/guide.md')]);
    } finally {
      await fs.rm(cwd, { recursive: true, force: true });
    }
  });
});
