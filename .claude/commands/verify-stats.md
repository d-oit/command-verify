---
description: Show detailed verification statistics and cache performance metrics
allowed-tools: Bash
---

# Verification Statistics

Display comprehensive statistics about command verification including cache performance, command distribution, and validation history.

!npm run verify:stats

The script automatically outputs:
- Cache performance (hit rate, token usage, validation time)
- Command distribution by category (safe, conditional, dangerous, unknown, skipped)
- System availability (which commands are installed)
- Changed files since last validation
- Detailed breakdown of unavailable commands

All statistics are computed and formatted by the verification script for optimal performance.
