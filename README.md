# Command Verification System for Claude Code

Intelligent command verification for documentation. Discovers all commands in markdown files, validates them using git diff-based cache invalidation, and ensures documentation accuracy with zero token cost after initial setup.

## Features

✅ **Zero-token operation** - Base system uses only git + file operations
✅ **Git diff-based caching** - Only revalidates what actually changed
✅ **Intelligent invalidation** - package.json changed? Revalidate npm commands
✅ **Safe by design** - Never auto-executes dangerous commands
✅ **Fast** - < 1s for typical runs with cache
✅ **Complete** - Finds every command in every .md file

✅ **Cross-platform** - Works on Windows, macOS, and Linux with platform-aware command detection
## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run verification:**
   ```bash
   npm run verify
   ```

3. **View detailed statistics:**
   ```bash
   npm run verify:stats
   ```

4. **Force full validation:**
   ```bash
   npm run verify:force
   ```

## Slash Commands

When using this skill in Claude Code, you have access to these slash commands:

### `/verify`
Verify all commands in markdown documentation with intelligent caching.

**What it does:**
- Discovers all commands in markdown files
- Uses git diff-based cache invalidation
- Only revalidates commands affected by recent changes
- Provides cache hit rate statistics

**Example output:**
```
✓ Discovered 23 unique commands
✓ Cache hit rate: 91.3% (21/23 from cache)
✓ Validated 2 new/changed commands
```

### `/verify-force`
Force full command verification, bypassing the cache entirely.

**What it does:**
- Clears the validation cache
- Revalidates ALL commands from scratch
- Useful for debugging or after major changes
- Establishes fresh baseline

**Use when:**
- Cache may be corrupted or stale
- After bulk documentation updates
- Debugging cache invalidation issues
- Need to verify validation logic changes

### `/verify-stats`
Show detailed verification statistics and cache performance metrics.

**What it provides:**
- **Cache Performance:** Hit rates, last validation commit, cache size
- **Command Distribution:** Breakdown by category (safe/conditional/dangerous)
- **System Availability:** Which commands are installed vs unavailable
- **Invalidation Analysis:** Files changed, commands affected by changes

**Example insights:**
```
Cache Performance:
- 46 cached commands
- 95.7% hit rate
- Cache size: 42KB

Command Distribution:
- Safe: 32 (69.6%)
- Conditional: 10 (21.7%)
- Dangerous: 4 (8.7%)
```

## Self-Learning Memory System

The skill includes an auto-updating knowledge base that learns from corrections and adapts to your project.

### How It Works

When you tell Claude about a mistake, it:
1. **Learns** - Updates `.claude/knowledge.json` with the correction
2. **Applies** - Fixes all affected files automatically
3. **Remembers** - Uses the correction in future verifications

### Example: Implicit Memory Request

```
You: "claude-code is wrong, it should just be claude"

Claude:
✓ Learned: CLI name is "claude" not "claude-code"
✓ Updated knowledge base
✓ Fixed 2 references in README.md
✓ Added to learning log
```

### What Gets Learned

**CLI Name Corrections:**
- Wrong command names → Correct names
- Automatically applied to all documentation

**Command Patterns:**
- New command types discovered in your project
- Custom validation rules
- Project-specific safety categories

**File Invalidation Rules:**
- Which file changes should trigger revalidation
- Learned from patterns in your workflow

### Knowledge Base Location

`.claude/knowledge.json` - A simple JSON file that stores:
- Corrections learned from user feedback
- Project-specific command patterns
- Custom validation rules
- Learning history with timestamps

### Generic & Portable

This system works **everywhere**, not just in Claude Code:
- Plain JSON format (no proprietary formats)
- Can be copied to any project
- No external dependencies
- Auto-updates based on user corrections
- Human-readable and editable

### Manual Updates

You can also edit `.claude/knowledge.json` directly to teach the skill:

```json
{
  "corrections": {
    "cliNames": {
      "old-cli-name": {
        "correct": "new-cli-name",
        "reason": "Project renamed the CLI"
      }
    }
  },
  "patterns": {
    "commandPrefixes": ["npm", "git", "your-custom-cli"]
  },
  "validationRules": {
    "skip": {
      "patterns": ["^/my-slash-command$"],
      "reason": "Documentation examples that aren't real system commands"
    },
    "safe": {
      "patterns": ["^my-cli run test$"],
      "exactMatches": []
    }
  }
}
```

### Integration with verify-commands.js

The knowledge base is **automatically loaded** by the verification script:

1. **At startup**: Loads `.claude/knowledge.json`
2. **During validation**: Checks knowledge base BEFORE hardcoded patterns
3. **Priority**: Knowledge base rules take precedence over defaults
4. **Merge strategy**: Supplements hardcoded patterns, doesn't replace them

**Categories:**
- `safe` - Commands that can be auto-executed
- `conditional` - Commands that need user confirmation
- `dangerous` - Commands that should never auto-execute
- `skip` - Documentation examples (not real commands)

**Result:**
```
🧠 Loaded knowledge base from .claude/knowledge.json

📋 Command breakdown:
   ✓ 13 safe commands
   ⚠️  11 conditional commands
   ⊝ 3 dangerous commands
   ❓ 2 unknown commands
   ⏭️  6 skipped (documentation examples)
```

Skipped commands (like `/verify`, `claude-code`, `drop database`) are recognized as documentation examples and excluded from "not available" warnings.

## Architecture

### Core Components

#### 1. Skill: command-verify (Base System)
- **Purpose:** Core validation logic
- **Token Usage:** 0 tokens
- **Coverage:** 90% of commands
- **When to use:** Always, for documentation verification

#### 2. Plugin: command-executor (Optional Execution)
- **Purpose:** Actually run safe commands and capture output
- **Token Usage:** 0 tokens
- **Coverage:** 100% (with confirmation)
- **When to use:** Before releases, to ensure commands work

#### 3. Sub-Agent: command-analyzer (Optional Intelligence)
- **Purpose:** Deep analysis for ambiguous commands
- **Token Usage:** ~1,200 tokens per analysis
- **Coverage:** 99% of commands
- **When to use:** When deterministic rules aren't enough

### How They Work Together

```
User: "verify commands"
    ↓
Skill discovers and validates (0 tokens)
    ↓
90% commands: deterministic rules (0 tokens)
10% commands: might invoke sub-agent (~1200 tokens)

User: "verify and execute commands"
    ↓
Skill + Plugin (0 tokens)
    ↓
Safe commands executed with output capture
```

## Usage Examples

### Basic Verification
```bash
npm run verify
```

**Output:**
```
🚀 Universal Command Verifier

📚 PHASE 1: Command Discovery
📄 Found 5 markdown files
✓ Discovered 23 unique commands

🔄 PHASE 2: Cache Analysis
ℹ️  Changed files: 2

🔍 Analyzing README.md...
   ❌ npm install - mentioned in changed file
   ❌ npm run dev - mentioned in changed file

🎯 2 commands need revalidation

✅ PHASE 3: Validation
✓ Validated 2 commands

📊 PHASE 4: Summary
Total: 23 commands
Cache hit rate: 91.3% (21/23 from cache)
Token usage: 0
Time: 1.2s
```

### With Execution (Plugin)
```bash
# This would invoke the command-executor plugin
claude "verify and execute safe commands"
```

### Deep Analysis (Sub-Agent)
```bash
# This might invoke command-analyzer for ambiguous commands
claude "verify commands and explain any ambiguous ones"
```

## Command Discovery

The system finds commands in multiple formats:

### Code Blocks with Language Hints
```bash
npm run build
npm run test
```

### Inline Commands
Use `npm run dev` to start development.

### Generic Code Blocks
```
npm install
npm run lint
```

## Cache Strategy

### Intelligent Invalidation Rules

| File Changed | Commands Revalidated |
|--------------|---------------------|
| `*.md` | Commands in that file |
| `package.json` | All npm/yarn/pnpm commands |
| `tsconfig.json` | Build/test/typecheck commands |
| `Cargo.toml` | All cargo commands |
| `requirements.txt` | All pip/python commands |
| `src/**` | Test commands |

### Cache Hit Rate
- **First run:** 0% (validates all)
- **Typical runs:** 90%+ (only changed commands)
- **No changes:** 100% (all from cache)

## Integration

### CI/CD Integration

#### GitHub Actions
```yaml
# .github/workflows/verify-docs.yml
name: Verify Documentation

on:
  pull_request:
    paths:
      - '**.md'
      - 'package.json'

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0

      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - run: npm ci
      - run: npm run verify
```

#### Pre-commit Hooks
```bash
# Install husky
npm install -D husky
npx husky install

# Add hooks
npx husky add .husky/pre-commit "npm run verify"
npx husky add .husky/pre-push "npm run verify"
```

### Package.json Scripts
```json
{
  "scripts": {
    "verify": "node scripts/verify-commands.js",
    "verify:force": "node scripts/verify-commands.js --force",
    "verify:stats": "node scripts/verify-commands.js --stats",
    "prerelease": "npm run verify",
    "prepush": "npm run verify"
  }
}
```

## Configuration

### Customize Command Detection

Edit `scripts/verify-commands.js`:

```javascript
// Add your command prefixes
const COMMAND_PREFIXES = [
  'npm', 'yarn', 'pnpm', 'node', 'npx',
  'python', 'pip', 'cargo', 'go', 'docker',
  // Add yours:
  'your-cli', 'custom-tool'
];
```

### Add Custom Invalidation Rules

```javascript
// In analyzeImpact function
const invalidationRules = [
  // ... existing rules ...

  // Add your custom rules
  {
    pattern: /^Dockerfile$/,
    action: (file, commands) => {
      for (const cmd of commands) {
        if (cmd.command.startsWith('docker ')) {
          affectedCommands.add(cmd.command);
        }
      }
    }
  }
];
```

## Troubleshooting

### Issue: Commands not found
**Problem:** Commands in code blocks without language hints

**Solution:** Add language hints
```markdown
❌ Bad:
```
npm run build
```

✅ Good:
```bash
npm run build
```
```

### Issue: Too many false positives
**Problem:** Commands invalidated unnecessarily

**Solution:** Fine-tune invalidation rules or use `--force` occasionally

### Issue: Not a git repository
**Solution:** Works, but treats as first run (validates all)

### Issue: Cache corrupted
**Solution:** Clear cache
```bash
npm run clean:cache
npm run verify
```

## File Structure

```
project/
├── .claude/
│   ├── commands/                   # Slash commands
│   │   ├── verify.md               # /verify command
│   │   ├── verify-force.md         # /verify-force command
│   │   └── verify-stats.md         # /verify-stats command
│   ├── skills/
│   │   └── command-verify.yml      # Core skill
│   ├── plugins/
│   │   └── command-executor.yml    # Execution plugin
│   ├── agents/
│   │   └── command-analyzer.yml    # Analysis sub-agent
│   └── knowledge.json              # 🧠 Self-learning knowledge base
│
├── scripts/
│   └── verify-commands.js          # Main implementation
│
├── .cache/
│   └── command-validations/
│       ├── last-validation-commit.txt
│       └── commands/               # Per-command cache
│           ├── npm-run-build.json
│           └── ...
│
├── package.json                    # Dependencies & scripts
└── README.md                       # This file
```

## Development

### Testing the Implementation
```bash
# Test discovery
npm run verify

# Test with force
npm run verify:force

# Check cache
ls -la .cache/command-validations/
```

### Adding New Command Types
1. Add to `COMMAND_PREFIXES` in `verify-commands.js`
2. Add invalidation rules in `analyzeImpact`
3. Test with `npm run verify`

### Contributing
- The system is designed to be extensible
- Add new patterns to categorization rules
- Test thoroughly before committing

## Support

For issues:
1. Check troubleshooting section
2. Inspect cache in `.cache/command-validations/`
3. Review skill definitions in `.claude/`
4. Check git diff: `git diff $(cat .cache/command-validations/last-validation-commit.txt) HEAD`

## License

MIT - See package.json for details
