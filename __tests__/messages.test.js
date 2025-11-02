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

  it('handles dangerous commands correctly', () => {
    const result = buildValidationMessage({
      command: 'rm -rf /',
      category: 'dangerous',
      available: true,
      locations: [],
    });

    expect(result.severity).toBe('error');
    expect(result.message).toContain('Flagged as dangerous');
    expect(result.suggestion).toContain('safer alternative');
  });

  it('handles conditional commands correctly', () => {
    const result = buildValidationMessage({
      command: 'sudo npm install',
      category: 'conditional',
      available: true,
      locations: [],
    });

    expect(result.severity).toBe('warning');
    expect(result.message).toContain('Requires manual review');
    expect(result.suggestion).toContain('pre-requisites');
  });

  it('handles unknown commands as errors when treatUnknownAsWarnings is false', () => {
    const result = buildValidationMessage({
      command: 'mystery-tool run',
      category: 'unknown',
      available: true,
      treatUnknownAsWarnings: false,
      locations: [],
    });

    expect(result.severity).toBe('error');
    expect(result.message).toContain('Unknown command pattern');
  });

  it('handles unknown commands with installation hints', () => {
    const result = buildValidationMessage({
      command: 'unknown-tool run',
      category: 'unknown',
      available: false,
      treatUnknownAsWarnings: true,
      locations: [],
    });

    expect(result.severity).toBe('warning');
    expect(result.message).toContain('not found on this system');
    expect(result.suggestion).toContain('Add this command to the knowledge base');
  });

  it('handles commands without installation hints', () => {
    const result = buildValidationMessage({
      command: 'unknown-custom-tool',
      category: 'safe',
      available: false,
      locations: [],
    });

    expect(result.severity).toBe('warning');
    expect(result.message).toContain('is not available on this system');
    expect(result.suggestion).toContain('Install the required CLI');
  });

  it('handles safe commands correctly', () => {
    const result = buildValidationMessage({
      command: 'ls -la',
      category: 'safe',
      available: true,
      locations: [],
    });

    expect(result.severity).toBe('info');
    expect(result.message).toContain('Validated as safe');
  });

  it('handles commands with known installation hints', () => {
    const result = buildValidationMessage({
      command: 'npm install',
      category: 'safe',
      available: false,
      locations: [],
    });

    expect(result.suggestion).toContain('Install Node.js');
  });

  it('handles commands with yarn installation hints', () => {
    const result = buildValidationMessage({
      command: 'yarn install',
      category: 'safe',
      available: false,
      locations: [],
    });

    expect(result.suggestion).toContain('Install Yarn globally');
  });

  it('handles commands with pip installation hints', () => {
    const result = buildValidationMessage({
      command: 'pip install requirements.txt',
      category: 'safe',
      available: false,
      locations: [],
    });

    expect(result.suggestion).toContain('Install pip');
  });

  it('handles commands with git installation hints', () => {
    const result = buildValidationMessage({
      command: 'git clone repo',
      category: 'safe',
      available: false,
      locations: [],
    });

    expect(result.suggestion).toContain('Install Git');
  });

  it('handles commands with docker installation hints', () => {
    const result = buildValidationMessage({
      command: 'docker run image',
      category: 'safe',
      available: false,
      locations: [],
    });

    expect(result.suggestion).toContain('Install Docker');
  });

  it('handles empty locations array', () => {
    const result = buildValidationMessage({
      command: 'ls',
      category: 'safe',
      available: true,
      locations: [],
    });

    expect(result.message).toBe('Validated as safe.');
  });

  it('handles locations with file only', () => {
    const result = buildValidationMessage({
      command: 'ls',
      category: 'safe',
      available: true,
      locations: [{ file: 'docs/readme.md' }],
    });

    expect(result.message).toContain('docs/readme.md:');
  });

  it('handles locations with file and line', () => {
    const result = buildValidationMessage({
      command: 'ls',
      category: 'safe',
      available: true,
      locations: [{ file: 'docs/readme.md', line: 42 }],
    });

    expect(result.message).toContain('docs/readme.md:42:');
  });

  it('handles multiple locations (uses first)', () => {
    const result = buildValidationMessage({
      command: 'ls',
      category: 'safe',
      available: true,
      locations: [
        { file: 'docs/a.md', line: 1 },
        { file: 'docs/b.md', line: 2 },
      ],
    });

    expect(result.message).toContain('docs/a.md:1:');
  });

  it('handles empty command string', () => {
    const result = buildValidationMessage({
      command: '',
      category: 'safe',
      available: true,
      locations: [],
    });

    expect(result).toBeDefined();
    expect(result.message).toBeDefined();
  });

  it('handles commands with complex arguments', () => {
    const result = buildValidationMessage({
      command: 'npm install --save-dev webpack@5.0.0',
      category: 'safe',
      available: false,
      locations: [],
    });

    expect(result.message).toContain('npm');
    expect(result.suggestion).toContain('Node.js');
  });

  it('handles commands with whitespace variations', () => {
    const result1 = buildValidationMessage({
      command: '  ls  -la  ',
      category: 'safe',
      available: true,
      locations: [],
    });

    const result2 = buildValidationMessage({
      command: 'ls\t-la',
      category: 'safe',
      available: true,
      locations: [],
    });

    expect(result1).toBeDefined();
    expect(result2).toBeDefined();
  });

  it('handles treatUnknownAsWarnings undefined (defaults to true)', () => {
    const result = buildValidationMessage({
      command: 'unknown-tool',
      category: 'unknown',
      available: true,
      // treatUnknownAsWarnings not specified
      locations: [],
    });

    expect(result.severity).toBe('warning');
  });

  it('handles skip category with no locations', () => {
    const result = buildValidationMessage({
      command: 'claude --help',
      category: 'skip',
      available: true,
      locations: [],
    });

    expect(result.severity).toBe('info');
    expect(result.message).toBe('Skipped documentation-only command');
  });

  it('handles commands with both unknown and unavailable status', () => {
    const result = buildValidationMessage({
      command: 'weird-tool subcommand',
      category: 'unknown',
      available: false,
      treatUnknownAsWarnings: false,
      locations: [],
    });

    expect(result.severity).toBe('error');
    expect(result.message).toContain('Unknown command pattern');
  });
});
