import { describe, it, expect } from 'vitest';
import { extractCommandsFromMarkdown, COMMAND_PATTERNS } from '../lib/command-extraction.js';

describe('extractCommandsFromMarkdown', () => {
  describe('code block extraction', () => {
    it('should extract commands from bash code blocks', () => {
      const content = `
# Installation

To install, run:

\`\`\`bash
npm install
npm run build
\`\`\`
`;

      const commands = extractCommandsFromMarkdown(content, 'README.md');

      expect(commands).toHaveLength(2);
      expect(commands[0]).toEqual({
        command: 'npm install',
        file: 'README.md',
        line: 7,
        type: 'code-block',
        language: 'bash',
      });
      expect(commands[1]).toEqual({
        command: 'npm run build',
        file: 'README.md',
        line: 8,
        type: 'code-block',
        language: 'bash',
      });
    });

    it('should extract commands from shell code blocks', () => {
      const content = `
\`\`\`shell
ls -la
cat file.txt
\`\`\`
`;

      const commands = extractCommandsFromMarkdown(content, 'docs/usage.md');

      expect(commands).toHaveLength(2);
      expect(commands[0]).toEqual({
        command: 'ls -la',
        file: 'docs/usage.md',
        line: 3,
        type: 'code-block',
        language: 'shell',
      });
    });

    it('should handle multiple code blocks in one file', () => {
      const content = `
\`\`\`bash
npm install
\`\`\`

Some text

\`\`\`sh
ls -la
\`\`\`
`;

      const commands = extractCommandsFromMarkdown(content, 'file.md');

      expect(commands).toHaveLength(2);
      expect(commands[0].command).toBe('npm install');
      expect(commands[1].command).toBe('ls -la');
    });

    it('should extract from generic code blocks without language', () => {
      const content = `
\`\`\`
echo "hello"
pwd
\`\`\`
`;

      const commands = extractCommandsFromMarkdown(content, 'file.md');

      expect(commands).toHaveLength(2);
      expect(commands[0]).toEqual({
        command: 'echo "hello"',
        file: 'file.md',
        line: 3,
        type: 'code-block',
        language: 'unknown',
      });
    });
  });

  describe('inline code extraction', () => {
    it('should extract commands from inline code', () => {
      const content = `
To verify installation, run \`npm --version\` and \`node --version\`.
`;

      const commands = extractCommandsFromMarkdown(content, 'README.md');

      expect(commands).toHaveLength(2);
      expect(commands[0]).toEqual({
        command: 'npm --version',
        file: 'README.md',
        line: 2,
        type: 'inline',
      });
    });

    it('should skip inline code that is not commands', () => {
      const content = `
The \`package.json\` file contains dependencies.
`;

      const commands = extractCommandsFromMarkdown(content, 'README.md');

      expect(commands).toHaveLength(0);
    });
  });

  describe('mixed extraction', () => {
    it('should extract from both code blocks and inline code', () => {
      const content = `
# Setup

Run \`npm install\` first.

\`\`\`bash
npm run build
npm test
\`\`\`

Then run \`git status\` to check.
`;

      const commands = extractCommandsFromMarkdown(content, 'README.md');

      expect(commands).toHaveLength(4);
      expect(commands.map(c => c.command)).toEqual([
        'npm install',
        'npm run build',
        'npm test',
        'git status',
      ]);
    });
  });

  describe('edge cases', () => {
    it('should handle empty content', () => {
      const commands = extractCommandsFromMarkdown('', 'empty.md');
      expect(commands).toHaveLength(0);
    });

    it('should handle content without code blocks', () => {
      const content = `
# Title

This is just plain text without any code.
`;

      const commands = extractCommandsFromMarkdown(content, 'plain.md');
      expect(commands).toHaveLength(0);
    });

    it('should skip non-command content in code blocks', () => {
      const content = `
\`\`\`bash
# This is a comment
const x = 1;
\`\`\`
`;

      const commands = extractCommandsFromMarkdown(content, 'file.md');
      expect(commands).toHaveLength(0);
    });

    it('should handle nested backticks correctly', () => {
      const content = `
\`\`\`bash
echo "Use \`ls -la\` to list files"
\`\`\`
`;

      const commands = extractCommandsFromMarkdown(content, 'file.md');

      expect(commands).toHaveLength(1);
      expect(commands[0].command).toBe('echo "Use `ls -la` to list files"');
    });
  });
});

describe('COMMAND_PATTERNS', () => {
  it('should export the command patterns object', () => {
    expect(COMMAND_PATTERNS).toHaveProperty('codeBlock');
    expect(COMMAND_PATTERNS).toHaveProperty('inlineCode');
    expect(COMMAND_PATTERNS).toHaveProperty('genericCodeBlock');
  });

  it('should have regex patterns', () => {
    expect(COMMAND_PATTERNS.codeBlock).toBeInstanceOf(RegExp);
    expect(COMMAND_PATTERNS.inlineCode).toBeInstanceOf(RegExp);
    expect(COMMAND_PATTERNS.genericCodeBlock).toBeInstanceOf(RegExp);
  });
});