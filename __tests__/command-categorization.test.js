import { describe, it, expect } from 'vitest';
import { categorizeCommand } from '../lib/command-categorization.js';

describe('categorizeCommand', () => {
  describe('skip category', () => {
    it('should skip commands in knowledge base', () => {
      const knowledge = {
        validationRules: {
          skip: {
            exactMatches: ['documentation example'],
          },
        },
      };

      expect(categorizeCommand('documentation example', knowledge)).toEqual({
        category: 'skip',
        confidence: 1.0,
      });
    });

    it('should skip commands matching patterns in knowledge base', () => {
      const knowledge = {
        validationRules: {
          skip: {
            patterns: ['example.*'],
          },
        },
      };

      expect(categorizeCommand('example command', knowledge)).toEqual({
        category: 'skip',
        confidence: 1.0,
      });
    });
  });

  describe('knowledge base precedence', () => {
    it('should use knowledge base over hardcoded patterns', () => {
      const knowledge = {
        validationRules: {
          safe: {
            exactMatches: ['rm -rf /'],
          },
        },
      };

      // rm -rf / is dangerous in hardcoded patterns, but safe in knowledge base
      expect(categorizeCommand('rm -rf /', knowledge)).toEqual({
        category: 'safe',
        confidence: 1.0,
      });
    });

    it('should fall back to hardcoded patterns when knowledge base has no match', () => {
      const knowledge = {
        validationRules: {
          safe: {
            exactMatches: ['custom command'],
          },
        },
      };

      expect(categorizeCommand('npm install', knowledge)).toEqual({
        category: 'conditional',
        confidence: 0.90,
      });
    });
  });

  describe('dangerous commands', () => {
    it('should categorize rm -rf commands as dangerous', () => {
      expect(categorizeCommand('rm -rf /')).toEqual({
        category: 'dangerous',
        confidence: 0.95,
      });
      expect(categorizeCommand('rm -rf node_modules')).toEqual({
        category: 'dangerous',
        confidence: 0.95,
      });
    });

    it('should categorize force git push as dangerous', () => {
      expect(categorizeCommand('git push --force')).toEqual({
        category: 'dangerous',
        confidence: 0.95,
      });
    });

    it('should categorize npm run clean scripts as dangerous', () => {
      expect(categorizeCommand('npm run clean')).toEqual({
        category: 'dangerous',
        confidence: 0.95,
      });
      expect(categorizeCommand('npm run :clean')).toEqual({
        category: 'dangerous',
        confidence: 0.95,
      });
    });

    it('should categorize force operations as dangerous', () => {
      expect(categorizeCommand('npm install --force')).toEqual({
        category: 'dangerous',
        confidence: 0.95,
      });
    });

    it('should categorize sudo rm as dangerous', () => {
      expect(categorizeCommand('sudo rm -rf')).toEqual({
        category: 'dangerous',
        confidence: 0.95,
      });
    });
  });

  describe('conditional commands', () => {
    it('should categorize package manager installs as conditional', () => {
      expect(categorizeCommand('npm install')).toEqual({
        category: 'conditional',
        confidence: 0.90,
      });
      expect(categorizeCommand('yarn add')).toEqual({
        category: 'conditional',
        confidence: 0.90,
      });
      expect(categorizeCommand('pip install')).toEqual({
        category: 'conditional',
        confidence: 0.90,
      });
    });

    it('should categorize docker commands as conditional', () => {
      expect(categorizeCommand('docker build')).toEqual({
        category: 'conditional',
        confidence: 0.90,
      });
      expect(categorizeCommand('docker run -p 3000:3000')).toEqual({
        category: 'conditional',
        confidence: 0.90,
      });
    });

    it('should categorize git operations as conditional', () => {
      expect(categorizeCommand('git commit')).toEqual({
        category: 'conditional',
        confidence: 0.90,
      });
      expect(categorizeCommand('git push')).toEqual({
        category: 'conditional',
        confidence: 0.90,
      });
      expect(categorizeCommand('git add')).toEqual({
        category: 'conditional',
        confidence: 0.90,
      });
    });
  });

  describe('safe commands', () => {
    it('should categorize npm scripts as safe', () => {
      expect(categorizeCommand('npm run build')).toEqual({
        category: 'safe',
        confidence: 0.95,
      });
      expect(categorizeCommand('npm run test')).toEqual({
        category: 'safe',
        confidence: 0.95,
      });
      expect(categorizeCommand('yarn lint')).toEqual({
        category: 'safe',
        confidence: 0.95,
      });
    });

    it('should categorize cargo commands as safe', () => {
      expect(categorizeCommand('cargo build')).toEqual({
        category: 'safe',
        confidence: 0.95,
      });
      expect(categorizeCommand('cargo test')).toEqual({
        category: 'safe',
        confidence: 0.95,
      });
    });

    it('should categorize go commands as safe', () => {
      expect(categorizeCommand('go build')).toEqual({
        category: 'safe',
        confidence: 0.95,
      });
      expect(categorizeCommand('go test')).toEqual({
        category: 'safe',
        confidence: 0.95,
      });
    });

    it('should categorize read-only git commands as safe', () => {
      expect(categorizeCommand('git status')).toEqual({
        category: 'safe',
        confidence: 0.95,
      });
      expect(categorizeCommand('git log')).toEqual({
        category: 'safe',
        confidence: 0.95,
      });
      expect(categorizeCommand('git diff')).toEqual({
        category: 'safe',
        confidence: 0.95,
      });
    });

    it('should categorize basic shell commands as safe', () => {
      expect(categorizeCommand('ls')).toEqual({
        category: 'safe',
        confidence: 0.95,
      });
      expect(categorizeCommand('cat file.txt')).toEqual({
        category: 'safe',
        confidence: 0.95,
      });
      expect(categorizeCommand('pwd')).toEqual({
        category: 'safe',
        confidence: 0.95,
      });
      expect(categorizeCommand('echo hello')).toEqual({
        category: 'safe',
        confidence: 0.95,
      });
    });

    it('should categorize version checks as safe', () => {
      expect(categorizeCommand('node --version')).toEqual({
        category: 'safe',
        confidence: 0.95,
      });
      expect(categorizeCommand('npm --version')).toEqual({
        category: 'safe',
        confidence: 0.95,
      });
      expect(categorizeCommand('git --version')).toEqual({
        category: 'safe',
        confidence: 0.95,
      });
    });

    it('should categorize cd as safe', () => {
      expect(categorizeCommand('cd /tmp')).toEqual({
        category: 'safe',
        confidence: 0.95,
      });
    });
  });

  describe('unknown commands', () => {
    it('should categorize unrecognized commands as unknown', () => {
      expect(categorizeCommand('custom-tool --flag')).toEqual({
        category: 'unknown',
        confidence: 0.50,
      });
      expect(categorizeCommand('unknown-command')).toEqual({
        category: 'unknown',
        confidence: 0.50,
      });
    });
  });

  describe('command object support', () => {
    it('should accept command objects', () => {
      expect(categorizeCommand({ command: 'npm install' })).toEqual({
        category: 'conditional',
        confidence: 0.90,
      });
    });

    it('should prioritize command property over object itself', () => {
      const cmd = { command: 'npm install', other: 'data' };
      expect(categorizeCommand(cmd)).toEqual({
        category: 'conditional',
        confidence: 0.90,
      });
    });
  });

  describe('edge cases', () => {
    it('should handle empty/undefined knowledge base', () => {
      expect(categorizeCommand('npm install', null)).toEqual({
        category: 'conditional',
        confidence: 0.90,
      });
      expect(categorizeCommand('npm install', undefined)).toEqual({
        category: 'conditional',
        confidence: 0.90,
      });
    });

    it('should handle empty command strings', () => {
      expect(categorizeCommand('', {})).toEqual({
        category: 'unknown',
        confidence: 0.50,
      });
    });
  });
});