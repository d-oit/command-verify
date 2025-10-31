import { describe, it, expect } from 'vitest';
import { buildValidationMessage } from '../lib/messages.js';

describe('Validation messages', () => {
  it('returns info for skipped commands', () => {
    const result = buildValidationMessage({
      command: 'claude --help',
      category: 'skip',
      available: true,
      locations: [{ file: 'docs/guide.md', line: 10 }],
    });

    expect(result.severity).toBe('info');
    expect(result.message).toContain('Skipped');
  });

  it('provides actionable suggestion for missing commands', () => {
    const result = buildValidationMessage({
      command: 'docker build .',
      category: 'safe',
      available: false,
      locations: [],
    });

    expect(result.severity).toBe('warning');
    expect(result.suggestion).toContain('Install Docker');
  });

  it('escalates unknown commands to warnings when configured', () => {
    const result = buildValidationMessage({
      command: 'mystery-tool run',
      category: 'unknown',
      available: true,
      treatUnknownAsWarnings: true,
    });

    expect(result.severity).toBe('warning');
    expect(result.message).toContain('Unknown command pattern');
  });
});
