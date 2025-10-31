import { shouldSkipCommand, checkKnowledgeBase } from './knowledge-base.js';

/**
 * Categorize command safety
 */
export function categorizeCommand(command, knowledgeBase) {
  let cmd;

  if (typeof command === 'string') {
    cmd = command;
  } else if (command && typeof command === 'object' && typeof command.command === 'string') {
    cmd = command.command;
  } else if (command != null) {
    cmd = String(command);
  } else {
    return { category: 'unknown', confidence: 0.50 };
  }

  if (typeof cmd !== 'string') {
    return { category: 'unknown', confidence: 0.50 };
  }

  cmd = cmd.trim();
  if (!cmd) {
    return { category: 'unknown', confidence: 0.50 };
  }

  // Check if this command should be skipped entirely
  if (knowledgeBase && shouldSkipCommand(cmd, knowledgeBase)) {
    return { category: 'skip', confidence: 1.0 };
  }

  // Check knowledge base first (takes precedence over hardcoded patterns)
  if (knowledgeBase) {
    const kbResult = checkKnowledgeBase(cmd, knowledgeBase);
    if (kbResult) return kbResult;
  }

  // Fall back to hardcoded patterns
  // Dangerous commands - never execute
  const dangerous = [
    /rm\s+-rf/,
    /git push.*--force/,
    /npm run.*(?:clean|clear|reset)/,
    /npm run.*:(?:force|clean|clear|reset)/,  // Force operations via npm scripts
    /drop database/,
    /truncate/,
    /delete.*--force/,
    /--force/,
    /sudo.*rm/,
    /format.*--yes/,
    /:clean/,
  ];

  // Conditional commands - ask before running
  const conditional = [
    /npm install/,
    /yarn add/,
    /pip install/,
    /cargo add/,
    /go mod/,
    /docker build/,
    /docker run.*-p/,
    /git commit/,
    /git push(?!.*--force)/,  // git push without --force
    /git add/,
    /git init/,
    /git clone/,
    /git checkout -b/,
    /npm run format/,
    /prettier.*--write/,
    /npx husky/,  // Git hooks modification
    /npx rimraf/,  // Cross-platform rm -rf
  ];

  // Safe commands - auto-execute
  const safe = [
    /^npm run (build|test|lint|typecheck|dev|verify)$/,
    /^yarn (build|test|lint|typecheck|dev)$/,
    /^pnpm (build|test|lint|typecheck|dev)$/,
    /^cargo (build|test|check)$/,
    /^go (build|test|vet)$/,
    /^git (status|log|diff|show|branch)$/,
    /^git diff/,  // Git diff with args is also safe (read-only)
    /^docker ps$/,
    /^docker images$/,
    /^node --version$/,
    /^python --version$/,
    /^npm --version$/,
    /^git --version$/,
    /^cd /,  // Change directory (safe to execute)
    /^ls/,
    /^cat/,
    /^find/,
    /^grep.*--help/,
    /^echo/,
    /^pwd$/,
  ];

  // Check dangerous first
  for (const pattern of dangerous) {
    if (pattern.test(cmd)) {
      return { category: 'dangerous', confidence: 0.95 };
    }
  }

  // Check safe
  for (const pattern of safe) {
    if (pattern.test(cmd)) {
      return { category: 'safe', confidence: 0.95 };
    }
  }

  // Check conditional
  for (const pattern of conditional) {
    if (pattern.test(cmd)) {
      return { category: 'conditional', confidence: 0.90 };
    }
  }

  // Unknown - low confidence
  return { category: 'unknown', confidence: 0.50 };
}