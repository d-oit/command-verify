/**
 * Mock implementations for glob operations for testing
 */

export const mockGlob = (mockResults = {}) => {
  return vi.fn().mockImplementation((pattern, options) => {
    if (mockResults[pattern]) {
      return Promise.resolve(mockResults[pattern]);
    }

    // Default behavior - return some common markdown files
    if (pattern === '**/*.md') {
      return Promise.resolve([
        'README.md',
        'docs/installation.md',
        'docs/usage.md',
        'CHANGELOG.md',
      ]);
    }

    // Default empty array for other patterns
    return Promise.resolve([]);
  });
};

export const createMockGlob = (mockResults = {}) => {
  return {
    glob: mockGlob(mockResults),
  };
};