import { describe, it, expect } from 'vitest';
import { shouldSkipCommand, checkKnowledgeBase } from '../lib/knowledge-base.js';

describe('shouldSkipCommand', () => {
  it('should return false when no knowledge base is provided', () => {
    expect(shouldSkipCommand('npm install', null)).toBe(false);
    expect(shouldSkipCommand('ls -la', undefined)).toBe(false);
  });

  it('should return false when knowledge base has no skip rules', () => {
    const knowledge = { validationRules: {} };
    expect(shouldSkipCommand('npm install', knowledge)).toBe(false);
  });

  it('should return false when skip rules are empty', () => {
    const knowledge = {
      validationRules: {
        skip: { patterns: [], exactMatches: [] },
      },
    };
    expect(shouldSkipCommand('npm install', knowledge)).toBe(false);
  });

  it('should skip commands in exactMatches', () => {
    const knowledge = {
      validationRules: {
        skip: {
          exactMatches: ['npm install', 'echo hello'],
        },
      },
    };

    expect(shouldSkipCommand('npm install', knowledge)).toBe(true);
    expect(shouldSkipCommand('echo hello', knowledge)).toBe(true);
    expect(shouldSkipCommand('npm run build', knowledge)).toBe(false);
  });

  it('should skip commands matching patterns', () => {
    const knowledge = {
      validationRules: {
        skip: {
          patterns: ['^echo.*', 'npm.*install$'],
        },
      },
    };

    expect(shouldSkipCommand('echo hello', knowledge)).toBe(true);
    expect(shouldSkipCommand('echo "world"', knowledge)).toBe(true);
    expect(shouldSkipCommand('npm install', knowledge)).toBe(true);
    expect(shouldSkipCommand('npm install --save-dev', knowledge)).toBe(false);
    expect(shouldSkipCommand('npm run install', knowledge)).toBe(false);
  });

  it('should handle invalid regex patterns gracefully', () => {
    const knowledge = {
      validationRules: {
        skip: {
          patterns: ['[invalid', 'valid.*'],
        },
      },
    };

    expect(shouldSkipCommand('valid test', knowledge)).toBe(true);
    expect(shouldSkipCommand('invalid command', knowledge)).toBe(false);
  });

  it('should prioritize exactMatches over patterns', () => {
    const knowledge = {
      validationRules: {
        skip: {
          exactMatches: ['exact match'],
          patterns: ['exact.*'],
        },
      },
    };

    expect(shouldSkipCommand('exact match', knowledge)).toBe(true);
  });
});

describe('checkKnowledgeBase', () => {
  it('should return null when no knowledge base is provided', () => {
    expect(checkKnowledgeBase('npm install', null)).toBe(null);
    expect(checkKnowledgeBase('ls -la', undefined)).toBe(null);
  });

  it('should return null when knowledge base has no validationRules', () => {
    const knowledge = {};
    expect(checkKnowledgeBase('npm install', knowledge)).toBe(null);
  });

  it('should return null when no rules match', () => {
    const knowledge = {
      validationRules: {
        dangerous: { patterns: [], exactMatches: [] },
        safe: { patterns: [], exactMatches: [] },
      },
    };
    expect(checkKnowledgeBase('unknown command', knowledge)).toBe(null);
  });

  it('should return exactMatches with highest priority', () => {
    const knowledge = {
      validationRules: {
        dangerous: {
          exactMatches: ['rm -rf /'],
          patterns: ['rm.*rf.*'],
        },
      },
    };

    expect(checkKnowledgeBase('rm -rf /', knowledge)).toEqual({
      category: 'dangerous',
      confidence: 1.0,
    });
  });

  it('should match patterns with lower confidence', () => {
    const knowledge = {
      validationRules: {
        safe: {
          patterns: ['^git status$', 'npm.*install'],
        },
      },
    };

    expect(checkKnowledgeBase('git status', knowledge)).toEqual({
      category: 'safe',
      confidence: 0.95,
    });

    expect(checkKnowledgeBase('npm install', knowledge)).toEqual({
      category: 'safe',
      confidence: 0.95,
    });

    expect(checkKnowledgeBase('npm install --save-dev', knowledge)).toEqual({
      category: 'safe',
      confidence: 0.95,
    });
  });

  it('should prioritize dangerous over safe categories', () => {
    const knowledge = {
      validationRules: {
        dangerous: {
          patterns: ['^sudo.*'],
        },
        safe: {
          patterns: ['^sudo.*'],
        },
      },
    };

    expect(checkKnowledgeBase('sudo apt update', knowledge)).toEqual({
      category: 'dangerous',
      confidence: 0.95,
    });
  });

  it('should handle invalid regex patterns gracefully', () => {
    const knowledge = {
      validationRules: {
        dangerous: {
          patterns: ['[invalid regex'],
        },
      },
    };

    expect(checkKnowledgeBase('some command', knowledge)).toBe(null);
  });

  it('should only check defined categories', () => {
    const knowledge = {
      validationRules: {
        dangerous: { patterns: ['danger.*'], exactMatches: [] },
        safe: { patterns: ['safe.*'], exactMatches: [] },
        // conditional category not defined
      },
    };

    expect(checkKnowledgeBase('danger command', knowledge)).toEqual({
      category: 'dangerous',
      confidence: 0.95,
    });

    expect(checkKnowledgeBase('safe command', knowledge)).toEqual({
      category: 'safe',
      confidence: 0.95,
    });

    expect(checkKnowledgeBase('conditional command', knowledge)).toBe(null);
  });
});