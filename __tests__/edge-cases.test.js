import { describe, it, expect } from 'vitest';
import { looksLikeCommand } from '../lib/command-detection.js';
import { extractCommandsFromMarkdown } from '../lib/command-extraction.js';
import { shouldSkipCommand, checkKnowledgeBase } from '../lib/knowledge-base.js';
import { categorizeCommand } from '../lib/command-categorization.js';

describe('Edge Cases and Error Conditions', () => {
  describe('looksLikeCommand edge cases', () => {
    it('should handle null and undefined', () => {
      expect(looksLikeCommand(null)).toBe(false);
      expect(looksLikeCommand(undefined)).toBe(false);
    });

    it('should handle non-string inputs', () => {
      expect(looksLikeCommand(123)).toBe(false);
      expect(looksLikeCommand({})).toBe(false);
      expect(looksLikeCommand([])).toBe(false);
    });

    it('should handle extremely long strings', () => {
      const longCommand = 'npm install ' + 'a'.repeat(1000);
      expect(looksLikeCommand(longCommand)).toBe(false);
    });

    it('should handle strings with only whitespace', () => {
      expect(looksLikeCommand('   ')).toBe(false);
      expect(looksLikeCommand('\t\n')).toBe(false);
    });

    it('should handle strings with special characters', () => {
      expect(looksLikeCommand('🚀 deploy')).toBe(true); // Emojis are allowed
      expect(looksLikeCommand('cmd with 中文')).toBe(true); // Unicode characters
    });
  });

  describe('extractCommandsFromMarkdown edge cases', () => {
    it('should handle null/undefined content', () => {
      expect(extractCommandsFromMarkdown(null, 'test.md')).toEqual([]);
      expect(extractCommandsFromMarkdown(undefined, 'test.md')).toEqual([]);
    });

    it('should handle empty content', () => {
      expect(extractCommandsFromMarkdown('', 'test.md')).toEqual([]);
    });

    it('should handle content without newlines', () => {
      const content = 'Just a single line without commands';
      expect(extractCommandsFromMarkdown(content, 'test.md')).toEqual([]);
    });

    it('should handle malformed code blocks', () => {
      const content = `
\`\`\`bash
npm install
\`\`\`bash  # Missing closing
more content
`;
      const commands = extractCommandsFromMarkdown(content, 'test.md');
      expect(commands).toHaveLength(1);
      expect(commands[0].command).toBe('npm install');
    });

    it('should handle nested backticks in code blocks', () => {
      const content = `
\`\`\`bash
echo "The command is \`ls -la\`"
\`\`\`
`;
      const commands = extractCommandsFromMarkdown(content, 'test.md');
      expect(commands).toHaveLength(1);
      expect(commands[0].command).toBe('echo "The command is `ls -la`"');
    });

    it('should handle code blocks with unusual language identifiers', () => {
      const content = `
\`\`\`powershell
Get-ChildItem
\`\`\`
\`\`\`unknown-lang
some command
\`\`\`
`;
      const commands = extractCommandsFromMarkdown(content, 'test.md');
      expect(commands).toHaveLength(2);
      expect(commands[0].language).toBe('powershell');
      expect(commands[1].language).toBe('unknown');
    });
  });

  describe('knowledge base edge cases', () => {
    it('should handle malformed regex patterns gracefully', () => {
      const knowledge = {
        validationRules: {
          skip: {
            patterns: ['[unclosed', '[invalid range a-z'],
          },
        },
      };

      // Should not throw, should just ignore invalid patterns
      expect(() => shouldSkipCommand('test', knowledge)).not.toThrow();
      expect(shouldSkipCommand('test', knowledge)).toBe(false);
    });

    it('should handle null/undefined knowledge base', () => {
      expect(shouldSkipCommand('test', null)).toBe(false);
      expect(shouldSkipCommand('test', undefined)).toBe(false);
      expect(checkKnowledgeBase('test', null)).toBe(null);
      expect(checkKnowledgeBase('test', undefined)).toBe(null);
    });

    it('should handle empty validation rules', () => {
      const knowledge = { validationRules: {} };
      expect(shouldSkipCommand('test', knowledge)).toBe(false);
      expect(checkKnowledgeBase('test', knowledge)).toBe(null);
    });

    it('should handle missing arrays in validation rules', () => {
      const knowledge = {
        validationRules: {
          skip: {},
          dangerous: { patterns: null, exactMatches: undefined },
        },
      };
      expect(() => shouldSkipCommand('test', knowledge)).not.toThrow();
      expect(() => checkKnowledgeBase('test', knowledge)).not.toThrow();
    });
  });

  describe('categorizeCommand edge cases', () => {
    it('should handle null/undefined knowledge base', () => {
      const result = categorizeCommand('npm install', null);
      expect(result.category).toBe('conditional');
      expect(result.confidence).toBe(0.90);
    });

    it('should handle non-string command inputs', () => {
      expect(categorizeCommand(null)).toEqual({
        category: 'unknown',
        confidence: 0.50,
      });
      expect(categorizeCommand(undefined)).toEqual({
        category: 'unknown',
        confidence: 0.50,
      });
      expect(categorizeCommand(123)).toEqual({
        category: 'unknown',
        confidence: 0.50,
      });
    });

    it('should handle command objects with missing command property', () => {
      expect(categorizeCommand({})).toEqual({
        category: 'unknown',
        confidence: 0.50,
      });
      expect(categorizeCommand({ other: 'data' })).toEqual({
        category: 'unknown',
        confidence: 0.50,
      });
    });

    it('should handle commands with special regex characters', () => {
      expect(categorizeCommand('echo "hello (world)"')).toEqual({
        category: 'safe',
        confidence: 0.95,
      });
    });

    it('should handle very long commands', () => {
      const longCommand = 'npm install ' + 'package-name '.repeat(100);
      const result = categorizeCommand(longCommand.trim());
      expect(result.category).toBe('conditional');
      expect(result.confidence).toBe(0.90);
    });
  });

  describe('Integration edge cases', () => {
    it('should handle a file with mixed valid and invalid content', () => {
      const content = `
# Documentation

This is regular text.

\`\`\`bash
npm install
\`\`\`

Some more text with \`not a command\`.

\`\`\`javascript
console.log('not a command');
\`\`\`

\`\`\`
ls -la
\`\`\`
`;

      const commands = extractCommandsFromMarkdown(content, 'test.md');

      expect(commands).toHaveLength(2);
      expect(commands.map(c => c.command)).toEqual(['npm install', 'ls -la']);
    });

    it('should handle commands that look like commands but are in non-command contexts', () => {
      const content = `
The command "npm install" should be run carefully.
Run \`npm install\` to install dependencies.
`;

      const commands = extractCommandsFromMarkdown(content, 'test.md');

      expect(commands).toHaveLength(1);
      expect(commands[0].command).toBe('npm install');
      expect(commands[0].type).toBe('inline');
    });

    it('should handle duplicate commands with different locations', () => {
      const content = `
\`\`\`bash
npm install
\`\`\`

Later in the file:

\`\`\`sh
npm install
\`\`\`
`;

      const commands = extractCommandsFromMarkdown(content, 'test.md');

      expect(commands).toHaveLength(2);
      expect(commands[0].command).toBe('npm install');
      expect(commands[1].command).toBe('npm install');
    });
  });
});