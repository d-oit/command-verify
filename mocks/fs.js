/**
 * Mock implementations for Node.js fs/promises API for testing
 */

export const mockFsReadFile = (mockContent) => {
  return vi.fn().mockImplementation((filePath) => {
    if (mockContent[filePath]) {
      return Promise.resolve(mockContent[filePath]);
    }
    const error = new Error(`ENOENT: no such file or directory, open '${filePath}'`);
    error.code = 'ENOENT';
    return Promise.reject(error);
  });
};

export const mockFsWriteFile = () => {
  return vi.fn().mockResolvedValue(undefined);
};

export const mockFsMkdir = () => {
  return vi.fn().mockResolvedValue(undefined);
};

export const mockFsRm = () => {
  return vi.fn().mockResolvedValue(undefined);
};

export const mockFsReadFileSync = (mockContent) => {
  return vi.fn().mockImplementation((filePath, _options) => {
    if (mockContent[filePath]) {
      return mockContent[filePath];
    }
    const error = new Error(`ENOENT: no such file or directory, open '${filePath}'`);
    error.code = 'ENOENT';
    throw error;
  });
};

export const createMockFs = (mockContent = {}) => {
  return {
    readFile: mockFsReadFile(mockContent),
    writeFile: mockFsWriteFile(),
    mkdir: mockFsMkdir(),
    rm: mockFsRm(),
    readFileSync: mockFsReadFileSync(mockContent),
  };
};