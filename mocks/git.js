/**
 * Mock implementations for git operations for testing
 */

export const mockExecSync = (mockResults = {}) => {
  return vi.fn().mockImplementation((command, options) => {
    const cmd = command.trim();

    if (mockResults[cmd]) {
      if (mockResults[cmd].error) {
        throw new Error(mockResults[cmd].error);
      }
      return mockResults[cmd].output || '';
    }

    // Default behaviors for common commands
    if (cmd === 'git rev-parse HEAD') {
      return 'abc123def456';
    }

    if (cmd.startsWith('git diff --name-only')) {
      return '';
    }

    if (cmd.startsWith('where ') || cmd.startsWith('which ')) {
      const program = cmd.split(' ')[1];
      if (['npm', 'node', 'git', 'ls', 'cat', 'echo'].includes(program)) {
        return `/usr/bin/${program}`;
      }
      throw new Error(`Command '${program}' not found`);
    }

    // Default fallback
    return '';
  });
};

export const mockSpawn = () => {
  return vi.fn().mockReturnValue({
    on: vi.fn(),
    stdout: { on: vi.fn() },
    stderr: { on: vi.fn() },
    kill: vi.fn(),
  });
};

export const createMockGit = (mockResults = {}) => {
  return {
    execSync: mockExecSync(mockResults),
    spawn: mockSpawn(),
  };
};