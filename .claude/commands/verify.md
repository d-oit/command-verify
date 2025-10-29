---
description: Verify all commands in markdown documentation with caching
allowed-tools: Bash
---

# Command Verification

Run intelligent command verification on all markdown files in the project using git diff-based cache invalidation.

!npm run verify

The script automatically outputs:
- Total commands discovered
- Cache hit rate and performance metrics
- Breakdown by category (safe, conditional, dangerous, unknown, skipped)
- System availability (installed vs unavailable commands)
- Validation summary with detailed breakdown

If any commands are unavailable or require attention, review the output and take appropriate action.
