import { describe, it, expect } from 'vitest';
import { looksLikeCommand } from '../lib/command-detection.js';

describe('looksLikeCommand', () => {
  describe('should return true for valid commands', () => {
    it('should detect npm commands', () => {
      expect(looksLikeCommand('npm install')).toBe(true);
      expect(looksLikeCommand('npm run build')).toBe(true);
      expect(looksLikeCommand('yarn add')).toBe(true);
    });

    it('should detect python commands', () => {
      expect(looksLikeCommand('python script.py')).toBe(true);
      expect(looksLikeCommand('pip install')).toBe(true);
    });

    it('should detect rust commands', () => {
      expect(looksLikeCommand('cargo build')).toBe(true);
      expect(looksLikeCommand('rustc')).toBe(true);
    });

    it('should detect go commands', () => {
      expect(looksLikeCommand('go build')).toBe(true);
      expect(looksLikeCommand('gofmt')).toBe(true);
    });

    it('should detect docker commands', () => {
      expect(looksLikeCommand('docker build')).toBe(true);
      expect(looksLikeCommand('docker-compose up')).toBe(true);
    });

    it('should detect git commands', () => {
      expect(looksLikeCommand('git status')).toBe(true);
      expect(looksLikeCommand('git commit')).toBe(true);
    });

    it('should detect curl commands', () => {
      expect(looksLikeCommand('curl http://example.com')).toBe(true);
      expect(looksLikeCommand('wget file.zip')).toBe(true);
    });

    it('should detect unix commands', () => {
      expect(looksLikeCommand('ls -la')).toBe(true);
      expect(looksLikeCommand('cat file.txt')).toBe(true);
      expect(looksLikeCommand('find . -name "*.js"')).toBe(true);
    });

    it('should detect sudo commands', () => {
      expect(looksLikeCommand('sudo apt update')).toBe(true);
      expect(looksLikeCommand('su -')).toBe(true);
    });

    it('should detect relative path commands', () => {
      expect(looksLikeCommand('./script.sh')).toBe(true);
      expect(looksLikeCommand('../bin/tool')).toBe(true);
    });

    it('should detect hyphenated commands', () => {
      expect(looksLikeCommand('any-tool-name')).toBe(true);
      expect(looksLikeCommand('tool-name --help')).toBe(true);
    });

    it('should detect simple command patterns', () => {
      expect(looksLikeCommand('echo hello')).toBe(true);
      expect(looksLikeCommand('printf "%s" arg')).toBe(true);
      expect(looksLikeCommand('mkdir newdir')).toBe(true);
    });
  });

  describe('should return false for invalid commands', () => {
    it('should reject empty or null input', () => {
      expect(looksLikeCommand('')).toBe(false);
      expect(looksLikeCommand(null)).toBe(false);
      expect(looksLikeCommand(undefined)).toBe(false);
    });

    it('should reject too-short strings', () => {
      expect(looksLikeCommand('a')).toBe(false);
      expect(looksLikeCommand('x')).toBe(false);
    });

    it('should reject markdown list items', () => {
      expect(looksLikeCommand('- item')).toBe(false);
      expect(looksLikeCommand('* item')).toBe(false);
    });

    it('should reject markdown headers', () => {
      expect(looksLikeCommand('# Header')).toBe(false);
      expect(looksLikeCommand('## Subheader')).toBe(false);
    });

    it('should reject markdown quotes', () => {
      expect(looksLikeCommand('> quote')).toBe(false);
    });

    it('should reject code comments', () => {
      expect(looksLikeCommand('// comment')).toBe(false);
    });

    it('should reject numbered lists', () => {
      expect(looksLikeCommand('1. First item')).toBe(false);
      expect(looksLikeCommand('2. Second item')).toBe(false);
    });

    it('should reject text with statistics', () => {
      expect(looksLikeCommand('rate: 91.3%')).toBe(false);
    });

    it('should reject prose with colons', () => {
      expect(looksLikeCommand('Summary:')).toBe(false);
      expect(looksLikeCommand('Note:')).toBe(false);
    });

    it('should reject text ending with colon', () => {
      expect(looksLikeCommand('Example:')).toBe(false);
    });

    it('should reject ellipsis', () => {
      expect(looksLikeCommand('Continue...')).toBe(false);
    });

    it('should reject english words', () => {
      expect(looksLikeCommand('the quick')).toBe(false);
      expect(looksLikeCommand('is running')).toBe(false);
    });

    it('should reject long text', () => {
      expect(looksLikeCommand('a'.repeat(101))).toBe(false);
    });

    it('should reject file paths', () => {
      expect(looksLikeCommand('.claude/config.json')).toBe(false);
      expect(looksLikeCommand('src/main.js')).toBe(false);
    });

    it('should reject HTML/XML tags', () => {
      expect(looksLikeCommand('<div>')).toBe(false);
      expect(looksLikeCommand('</script>')).toBe(false);
    });

    it('should reject array literals', () => {
      expect(looksLikeCommand('[1, 2, 3]')).toBe(false);
    });

    it('should reject variable assignments', () => {
      expect(looksLikeCommand('const x = 1')).toBe(false);
      expect(looksLikeCommand('let y = 2')).toBe(false);
    });

    it('should reject dates and versions', () => {
      expect(looksLikeCommand('2025 Q3')).toBe(false);
      expect(looksLikeCommand('v0.4.0')).toBe(false);
    });

    it('should reject code snippets', () => {
      expect(looksLikeCommand('const func')).toBe(false);
      expect(looksLikeCommand('function test')).toBe(false);
      expect(looksLikeCommand('class MyClass')).toBe(false);
    });

    it('should reject comma-containing text', () => {
      expect(looksLikeCommand('run, test')).toBe(false);
      expect(looksLikeCommand('npm install, yarn add')).toBe(false);
    });

    it('should reject parentheses-containing text', () => {
      expect(looksLikeCommand('test (optional)')).toBe(false);
      expect(looksLikeCommand('run (dry)')).toBe(false);
    });
  });
});