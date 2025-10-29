---
description: Force full command verification, bypassing cache
allowed-tools: Bash
---

# Force Command Verification

Run complete command verification on all markdown files, clearing cache and revalidating everything from scratch.

!npm run verify:force

The script automatically:
- Clears the validation cache
- Discovers all commands in markdown files
- Validates each command from scratch
- Outputs comprehensive statistics

Use force verification when:
- Cache may be stale or corrupted
- Major changes to validation logic
- Need fresh baseline after bulk documentation updates
- Debugging cache invalidation issues

The output includes all standard metrics plus information about cache clearing and fresh validation timing.
