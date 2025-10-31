# Command Detection Patterns and Rules

## Core Command Detection Principles

### 1. Precision Over Recall
- Better to miss a command than falsely identify non-commands
- Prioritize reducing false positives in documentation
- Validate against real-world command syntax

### 2. Context Awareness
- Consider markdown structure and formatting
- Distinguish between code blocks and inline code
- Account for documentation examples vs. executable commands

### 3. Platform Diversity
- Support Windows (cmd/powershell), Unix (bash/zsh), and cross-platform tools
- Handle platform-specific command variations
- Account for different path separators and executable formats

## Command Prefix Recognition

### Supported Package Managers
```javascript
const PACKAGE_MANAGERS = [
  'npm', 'yarn', 'pnpm', 'node', 'npx',
  'python', 'python3', 'pip', 'pip3',
  'cargo', 'rustc', 'rustup',
  'go', 'gofmt', 'golangci-lint',
  'composer', 'php', 'pear'
];
```

### Version Control Systems
```javascript
const VCS_TOOLS = [
  'git', 'svn', 'hg', 'bzr',
  'github-cli', 'gh', 'glab'
];
```

### Build and Development Tools
```javascript
const BUILD_TOOLS = [
  'make', 'cmake', 'gradle', 'maven', 'ant',
  'webpack', 'vite', 'rollup', 'parcel',
  'docker', 'docker-compose', 'podman',
  'kubectl', 'helm', 'terraform'
];
```

## False Positive Filtering Rules

### Markdown Artifacts to Exclude
- List items: `- item`, `* item`, `1. item`
- Headers: `# Header`, `## Subheader`
- Quotes: `> quoted text`
- Comments: `// comment`, `# comment`
- Statistics: `rate: 91.3%`, `coverage: 85%`

### Code Patterns to Exclude
- Variable assignments: `const x = 1`, `let y = 2`
- Function definitions: `function test()`, `class MyClass`
- Array literals: `[1, 2, 3]`
- File paths: `src/main.js`, `.claude/config.json`
- URLs and links: `http://example.com`

### Prose Indicators
- English words: `the`, `is`, `are`, `was`, `were`
- Colons in prose: `Summary:`, `Note:`, `Example:`
- Parentheses and commas: `test (optional)`, `run, test`
- Long text: > 100 characters

## Pattern Matching Guidelines

### Hyphenated Commands
- Pattern: `^[a-z]+(-[a-z]+)+(\s|$)`
- Examples: `any-tool-name`, `word-word --help`
- Validates common CLI tool naming conventions

### Simple Command Pattern
- Pattern: `^[a-z][a-z0-9_-]*\s+`
- Requirements: Start with lowercase, followed by space and args
- Exclusions: No commas or parentheses

### Relative Path Commands
- Pattern: `^[./]`
- Examples: `./script.sh`, `../bin/tool`
- Supports executable scripts and local tools

## Integration Points

### Command Extraction Pipeline
1. **Discovery**: Scan markdown files for code blocks and inline code
2. **Filtering**: Apply false positive rules
3. **Validation**: Check against known command patterns
4. **Context**: Preserve file location and line numbers

### Knowledge Base Integration
- Load custom command prefixes from `.claude/knowledge.json`
- Support project-specific command patterns
- Allow override of default detection rules

### Performance Considerations
- Process large files efficiently with streaming
- Cache regex compilation for repeated use
- Minimize memory usage for bulk operations