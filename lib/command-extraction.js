import { looksLikeCommand } from './command-detection.js';

const KNOWN_LANGUAGES = new Set([
  'bash',
  'shell',
  'console',
  'sh',
  'terminal',
  'cmd',
  'powershell',
  'ps1',
  'zsh',
  'fish',
]);

// Command patterns for discovery (kept for compatibility with existing tests)
export const COMMAND_PATTERNS = {
  codeBlock: /^\s*```([a-zA-Z0-9_-]*)\s*$/gm,
  inlineCode: /`([^`\n]+)`/g,
  genericCodeBlock: /^\s*```\s*$([\s\S]*?)^```$/gm,
};

function normaliseContent(raw) {
  if (raw == null) return '';
  if (typeof raw !== 'string') return String(raw);
  return raw.replace(/\r\n/g, '\n');
}

function resolveFilePath(filePath) {
  if (typeof filePath === 'string' && filePath.trim()) {
    return filePath;
  }
  return 'unknown';
}

function normaliseLanguage(language) {
  if (!language) return 'unknown';
  const lower = language.toLowerCase();
  return KNOWN_LANGUAGES.has(lower) ? lower : 'unknown';
}

function extractInlineCommands(line, lineNumber, file, commands) {
  const inlineRegex = /`([^`\n]+)`/g;
  let inlineMatch;
  while ((inlineMatch = inlineRegex.exec(line)) !== null) {
    const command = inlineMatch[1].trim();
    if (looksLikeCommand(command)) {
      commands.push({
        command,
        file,
        line: lineNumber,
        type: 'inline',
      });
    }
  }
}

/**
 * Extract commands from markdown content
 */
export function extractCommandsFromMarkdown(content, filePath) {
  const normalisedContent = normaliseContent(content);
  const file = resolveFilePath(filePath);
  const commands = [];

  const lines = normalisedContent.split('\n');

  let inCodeBlock = false;
  let codeBlockLanguage = 'unknown';

  for (let index = 0; index < lines.length; index += 1) {
    const rawLine = lines[index];
    const line = rawLine.replace(/\r$/, '');
    const lineNumber = index + 1;

    const fenceMatch = line.match(/^\s*```([^\s]*)?/);
    if (fenceMatch) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeBlockLanguage = normaliseLanguage(fenceMatch[1]);
      } else {
        inCodeBlock = false;
        codeBlockLanguage = 'unknown';
      }
      continue;
    }

    if (inCodeBlock) {
      const trimmed = line.trim();
      if (looksLikeCommand(trimmed)) {
        commands.push({
          command: trimmed,
          file,
          line: lineNumber,
          type: 'code-block',
          language: codeBlockLanguage,
        });
      }
      continue;
    }

    extractInlineCommands(line, lineNumber, file, commands);
  }

  return commands;
}