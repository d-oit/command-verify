import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import {
  runVerification,
  parseCliArgs,
  ConfigurationError,
} from '../lib/verification.js';

// Mock child_process
vi.mock('child_process', () => ({
  execSync: vi.fn(),
}));

// Mock fs/promises
vi.mock('fs/promises', () => {
  const fileContents = new Map();
  
  const normalizePath = (filePath) => {
    // Normalize paths for consistent lookup
    return path.resolve(filePath.toString());
  };
  
  return {
    default: {
      readFile: vi.fn((filePath, _encoding) => {
        const key = normalizePath(filePath);
        if (fileContents.has(key)) {
          return Promise.resolve(fileContents.get(key));
        }
        // Simulate ENOENT for missing files
        const error = new Error('File not found');
        error.code = 'ENOENT';
        throw error;
      }),
      writeFile: vi.fn((filePath, content) => {
        const key = normalizePath(filePath);
        fileContents.set(key, content);
        return Promise.resolve();
      }),
      mkdir: vi.fn(() => Promise.resolve()),
      readdir: vi.fn(() => Promise.resolve([])),
      rm: vi.fn(() => Promise.resolve()),
      mkdtemp: vi.fn(() => Promise.resolve('/tmp/verify-test-123456')),
      stat: vi.fn((filePath) => {
        const key = normalizePath(filePath);
        if (fileContents.has(key) || key.includes('command-verify.config.json')) {
          return Promise.resolve({ isFile: () => true });
        }
        const error = new Error('File not found');
        error.code = 'ENOENT';
        throw error;
      }),
      access: vi.fn(() => Promise.resolve()),
    },
  };
});

describe('Verification module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('parseCliArgs', () => {
    it('parses force flag correctly', () => {
      expect(parseCliArgs(['--force'])).toEqual({
        force: true,
        stats: false,
        silent: false,
        json: false,
      });
    });

    it('parses stats flag correctly', () => {
      expect(parseCliArgs(['--stats'])).toEqual({
        force: false,
        stats: true,
        silent: false,
        json: false,
      });
    });

    it('parses silent flag correctly', () => {
      expect(parseCliArgs(['--silent'])).toEqual({
        force: false,
        stats: false,
        silent: true,
        json: false,
      });
    });

    it('parses json flag correctly', () => {
      expect(parseCliArgs(['--json'])).toEqual({
        force: false,
        stats: false,
        silent: false,
        json: true,
      });
    });

    it('parses multiple flags correctly', () => {
      expect(parseCliArgs(['--force', '--silent'])).toEqual({
        force: true,
        stats: false,
        silent: true,
        json: false,
      });
    });

    it('handles empty args', () => {
      expect(parseCliArgs([])).toEqual({
        force: false,
        stats: false,
        silent: false,
        json: false,
      });
    });
  });

  describe('runVerification error handling', () => {
    let mockCwd;
    let mockLogger;

    beforeEach(async () => {
      // Mock fs.mkdtemp to return a consistent temp directory
      vi.mocked(fs.mkdtemp).mockResolvedValue('/tmp/verify-test-123456');
      mockCwd = '/tmp/verify-test-123456';
      mockLogger = {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      };
    });

    afterEach(async () => {
      if (mockCwd) {
        await fs.rm(mockCwd, { recursive: true, force: true });
      }
    });

    it('handles configuration errors gracefully', async () => {
      vi.mocked(fs.readFile).mockRejectedValue(
        Object.assign(new Error('Config not found'), { code: 'ENOENT' }),
      );

      await expect(runVerification({ 
        cwd: mockCwd, 
        logger: mockLogger,
        args: ['--silent'],
      })).rejects.toThrow(ConfigurationError);
    });

    it('handles knowledge base loading failures', async () => {
      // Set up readFile mock to return specific config for this test
      const configContent = JSON.stringify({
        knowledgeBasePath: path.join(mockCwd, 'kb.json'),
        cacheDir: '.cache',
      });
      
      vi.mocked(fs.readFile)
        .mockResolvedValueOnce(configContent) // config file
        .mockRejectedValueOnce(Object.assign(new Error('KB not found'), { code: 'ENOENT' })); // knowledge base

      // Mock other required calls
      vi.mocked(fs.readdir).mockResolvedValue([]);
      vi.mocked(execSync).mockReturnValue('abc123\n');

      const result = await runVerification({
        cwd: mockCwd,
        logger: mockLogger,
        args: ['--silent'],
      });

      expect(result).toBeDefined();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Knowledge base not found'),
      );
    });

    it('handles malformed knowledge base JSON', async () => {
      const kbPath = path.join(mockCwd, 'kb.json');
      
      vi.mocked(fs.readFile)
        .mockResolvedValueOnce(JSON.stringify({
          knowledgeBasePath: kbPath,
          cacheDir: '.cache',
        })) // config file
        .mockResolvedValueOnce('{ invalid json }'); // knowledge base

      vi.mocked(fs.readdir).mockResolvedValue([]);
      vi.mocked(execSync).mockReturnValue('abc123\n');

      const result = await runVerification({
        cwd: mockCwd,
        logger: mockLogger,
        args: ['--silent'],
      });

      expect(result).toBeDefined();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('invalid JSON'),
      );
    });

    it('handles git repository detection failures', async () => {
      vi.mocked(fs.readFile).mockResolvedValueOnce(JSON.stringify({
        knowledgeBasePath: null,
        cacheDir: '.cache',
      }));

      vi.mocked(fs.readdir).mockResolvedValue([]);
      vi.mocked(execSync).mockImplementation(() => {
        throw new Error('Not a git repository');
      });

      const result = await runVerification({
        cwd: mockCwd,
        logger: mockLogger,
        args: ['--silent'],
      });

      expect(result).toBeDefined();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Not a git repository'),
      );
    });

    it('handles git diff failures', async () => {
      const lastCommitFile = path.join(mockCwd, '.cache', 'last-commit.txt');

      vi.mocked(fs.readFile)
        .mockResolvedValueOnce(JSON.stringify({
          knowledgeBasePath: null,
          cacheDir: '.cache',
        })) // config file
        .mockResolvedValueOnce('old-commit\n'); // last commit file

      vi.mocked(fs.readdir).mockResolvedValue([]);
      vi.mocked(fs.writeFile).mockResolvedValue();

      // Set up last commit file to trigger diff attempt
      await fs.mkdir(path.dirname(lastCommitFile), { recursive: true });
      await fs.writeFile(lastCommitFile, 'old-commit\n');

      // First call (git rev-parse HEAD) succeeds with different commit, second (git diff) fails
      vi.mocked(execSync)
        .mockReturnValueOnce('current-commit\n')
        .mockImplementationOnce(() => {
          throw new Error('git diff failed');
        });

      const result = await runVerification({
        cwd: mockCwd,
        logger: mockLogger,
        args: ['--silent'],
      });

      expect(result).toBeDefined();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('git diff failed'),
      );
    });

    it('handles force mode cache clearing', async () => {
      vi.mocked(fs.readFile).mockResolvedValueOnce(JSON.stringify({
        knowledgeBasePath: null,
        cacheDir: '.cache',
      }));

      vi.mocked(fs.readdir).mockResolvedValue([]);
      vi.mocked(execSync).mockReturnValue('abc123\n');

      const result = await runVerification({
        cwd: mockCwd,
        logger: mockLogger,
        args: ['--force', '--silent'],
      });

      expect(result).toBeDefined();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Force mode'),
      );
    });

    it('handles different commit comparison scenarios', async () => {
      const lastCommitFile = path.join(mockCwd, '.cache', 'last-commit.txt');

      vi.mocked(fs.readFile)
        .mockResolvedValueOnce(JSON.stringify({
          knowledgeBasePath: null,
          cacheDir: '.cache',
        })) // config file
        .mockResolvedValueOnce('different-commit-hash\n'); // last commit file

      // Create last commit file
      await fs.mkdir(path.dirname(lastCommitFile), { recursive: true });
      await fs.writeFile(lastCommitFile, 'different-commit-hash\n');

      vi.mocked(fs.readdir).mockResolvedValue([]);
      vi.mocked(execSync).mockReturnValue('current-commit-hash\n');

      const result = await runVerification({
        cwd: mockCwd,
        logger: mockLogger,
        args: [],
      });

      expect(result).toBeDefined();
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Last validation commit'),
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Current commit'),
      );
    });

    it('handles same commit scenario', async () => {
      const lastCommitFile = path.join(mockCwd, '.cache', 'last-commit.txt');

      vi.mocked(fs.readFile)
        .mockResolvedValueOnce(JSON.stringify({
          knowledgeBasePath: null,
          cacheDir: '.cache',
        })) // config file
        .mockResolvedValueOnce('same-commit-hash\n'); // last commit file

      // Create last commit file with same commit
      await fs.mkdir(path.dirname(lastCommitFile), { recursive: true });
      await fs.writeFile(lastCommitFile, 'same-commit-hash\n');

      vi.mocked(fs.readdir).mockResolvedValue([]);
      vi.mocked(execSync).mockReturnValue('same-commit-hash\n');

      const result = await runVerification({
        cwd: mockCwd,
        logger: mockLogger,
        args: [],
      });

      expect(result).toBeDefined();
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('No new commits since last validation'),
      );
    });
  });
});