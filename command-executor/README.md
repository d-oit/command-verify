# Command Executor Plugin

A Claude Code plugin that extends the command-verify skill to actually execute safe commands and capture their output.

## Features

- ✅ Safe command execution with pre-flight checks
- ✅ Output capture (stdout, stderr, exit code, duration)
- ✅ Performance regression detection
- ✅ Audit logging for all executions
- ✅ Never executes dangerous commands automatically
- ✅ Clear execution plans before running

## Installation

This plugin is bundled with the command-verify project. It's automatically available when using the command verification system.

### Manual Installation

If you want to use this plugin separately:

1. Copy the `command-executor` directory to your Claude Code plugins location
2. The plugin will be automatically loaded by Claude Code

## Usage

Invoke this plugin when you want to actually execute commands (not just verify them):

```
"Verify and execute the safe commands"
"Run the commands in the documentation"
"Test if the commands actually work"
```

## Safety

This plugin follows strict safety rules:

### Never Executes
- `rm -rf` operations
- `git push --force`
- Database drops
- Any destructive operations

### Requires Confirmation
- `npm install`
- File modification commands
- Commands with `--force` flags

### Auto-Executes (Safe)
- `npm run build`
- `npm run test`
- `npm run lint`
- Read-only operations

## Output

The plugin captures execution results and stores them in:
- `.cache/command-validations/executions/` - Individual execution results
- `.cache/command-validations/audit.log` - Complete execution log

## Integration

Works seamlessly with the command-verify skill:
1. command-verify discovers commands
2. command-executor executes safe ones
3. Both share the same cache
4. Results improve future validations

## License

MIT - See parent project for details
