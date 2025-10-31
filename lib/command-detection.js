// Configuration constants
const COMMON_COMMAND_PREFIXES = [
  'npm', 'yarn', 'pnpm', 'node', 'npx',
  'python', 'python3', 'pip', 'pip3',
  'cargo', 'rustc', 'rustup',
  'go', 'gofmt', 'golangci-lint',
  'docker', 'docker-compose',
  'git', 'make',
  'curl', 'wget',
  'ls', 'cat', 'find', 'grep',
  'mkdir', 'rm', 'cp', 'mv',
  'echo', 'printf',
  'cd', 'pwd',
  // NOTE: Don't hardcode specific tools like "claude-code"
  // The system detects them generically
];

/**
 * Check if text looks like a command
 */
export function looksLikeCommand(text) {
  if (text == null) return false;

  if (typeof text !== 'string') {
    if (typeof text === 'number' || typeof text === 'boolean') {
      text = String(text);
    } else {
      return false;
    }
  }

  const trimmed = text.trim();
  if (trimmed.length < 2) return false;
  const lower = trimmed.toLowerCase();
  const hasCommonWords = /\b(the|a|an|is|are|was|were|be|been|being)\b/.test(lower);

  // Filter out obvious non-commands
  if (trimmed.startsWith('-')) return false; // Markdown list items
  if (trimmed.startsWith('*')) return false; // Markdown list items
  if (trimmed.startsWith('#')) return false; // Markdown headers or comments
  if (trimmed.startsWith('>')) return false; // Markdown quotes
  if (trimmed.startsWith('//')) return false; // Code comments
  if (/^[0-9]+\./.test(trimmed)) return false; // Numbered lists
  if (/:\s*[0-9]/.test(trimmed)) return false; // Text with statistics (e.g., "rate: 91.3%")
  if (/[A-Z][a-z]+:/.test(trimmed)) return false; // Prose with colons (e.g., "Summary:")
  if (trimmed.endsWith(':')) return false; // Text ending with colon (prose)
  if (trimmed.includes('...')) return false; // Ellipsis indicates prose
  if (trimmed.length > 100) return false; // Commands are typically shorter

  // Filter out file paths and URLs
  const isRelativePath = trimmed.startsWith('./') || trimmed.startsWith('../');
  if (!/\s/.test(trimmed) && /\.(md|json|js|ts)\b/i.test(trimmed) && !isRelativePath) return false;
  if (trimmed.startsWith('.') && !isRelativePath) return false; // Hidden folders like .claude/
  if (trimmed.includes('<') || trimmed.includes('>')) return false; // HTML/XML tags or placeholders
  if (trimmed.match(/^\[.*\]$/)) return false; // Array literals in code
  if (trimmed.includes(' = ')) return false; // Variable assignments

  // Filter out dates and version strings
  if (/^\d{4}.*Q[1-4]/.test(trimmed)) return false; // Dates like "2025 Q3"
  if (/^v\d+\.\d+/.test(trimmed)) return false; // Version strings like "v0.4.0"

  // Filter out code snippets
  if (trimmed.startsWith('const ') || trimmed.startsWith('let ') || trimmed.startsWith('var ')) return false;
  if (trimmed.startsWith('function ') || trimmed.startsWith('class ')) return false;

  // Check for known command prefixes as a hint
  if (!trimmed.includes(',') && COMMON_COMMAND_PREFIXES.some(prefix => lower.startsWith(`${prefix} `) || lower === prefix)) {
    return true;
  }

  // Check for common command patterns
  if (/^(sudo|su)\s+/.test(trimmed)) return true;
  if (isRelativePath || trimmed.startsWith('/')) return true; // Relative or absolute paths

  // Detect hyphenated CLI tools (common pattern: word-word, e.g., any-tool-name)
  // Matches patterns like: tool-name, word-word, etc.
  if (/^[a-z]+(-[a-z]+)+(\s|$)/i.test(trimmed)) return true;

  // Allow simple command patterns that look like actual commands
  // Must start with lowercase word, followed by space and args
  // No commas or parentheses (which suggest prose)
  if (!hasCommonWords && /^[a-z][a-z0-9_-]*\s+/i.test(trimmed) && !trimmed.includes(',') && !trimmed.includes('(')) {
    return true;
  }

  // Allow commands that start with symbols/emojis followed by valid command text
  const glyphs = Array.from(trimmed);
  const [firstGlyph, ...restGlyphs] = glyphs;
  if (firstGlyph && !/^[\p{L}\p{N}]/u.test(firstGlyph)) {
    const rest = restGlyphs.join('').trim();
    if (rest && !rest.includes(',') && !rest.includes('(')) {
      return true;
    }
  }

  if (hasCommonWords) return false;

  return false;
}