/**
 * Check if command should be skipped (documentation example, not a real command)
 */
export function shouldSkipCommand(cmd, knowledge) {
  if (!knowledge?.validationRules?.skip) return false;

  const rawPatterns = knowledge.validationRules.skip.patterns;
  const rawExactMatches = knowledge.validationRules.skip.exactMatches;

  const patterns = Array.isArray(rawPatterns) ? rawPatterns : [];
  const exactMatches = Array.isArray(rawExactMatches) ? rawExactMatches : [];

  // Check exact matches first
  if (exactMatches.includes(cmd)) return true;

  // Check patterns
  for (const pattern of patterns) {
    try {
      if (typeof pattern !== 'string' || pattern.trim() === '') continue;
      const source = pattern.startsWith('^') ? pattern : `^${pattern}`;
      if (new RegExp(source).test(cmd)) {
        if (/^(npm|yarn|pnpm)\s+run\s+/i.test(cmd)) {
          continue;
        }
        return true;
      }
    } catch {
      // Invalid regex, skip
    }
  }

  return false;
}

/**
 * Check knowledge base for command categorization
 * Returns: { category: string, confidence: number } or null if not found
 */
export function checkKnowledgeBase(cmd, knowledge) {
  if (!knowledge?.validationRules) return null;

  const categories = ['dangerous', 'safe', 'conditional']; // Check dangerous first

  for (const category of categories) {
    const rules = knowledge.validationRules[category];
    if (!rules) continue;

    const rawPatterns = rules.patterns;
    const rawExactMatches = rules.exactMatches;

    const patterns = Array.isArray(rawPatterns) ? rawPatterns : [];
    const exactMatches = Array.isArray(rawExactMatches) ? rawExactMatches : [];

    // Check exact matches first
    if (exactMatches.includes(cmd)) {
      return { category, confidence: 1.0 };
    }

    // Check patterns
    for (const pattern of patterns) {
      try {
        if (typeof pattern !== 'string' || pattern.trim() === '') continue;
        const source = pattern.startsWith('^') ? pattern : `^${pattern}`;
        if (new RegExp(source).test(cmd)) {
          return { category, confidence: 0.95 };
        }
      } catch {
        // Invalid regex, skip
      }
    }
  }

  return null; // Not found in knowledge base
}