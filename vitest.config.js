import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['__tests__/**/*.test.js', '*.test.js'],
    exclude: ['node_modules/**'],
    coverage: {
      reporter: ['text', 'lcov', 'html'],
      include: ['lib/**/*.js', 'scripts/**/*.js'],
      exclude: ['node_modules/**', '__tests__/**', 'mocks/**'],
      all: true,
      lines: 90,
      functions: 90,
      branches: 90,
      statements: 90,
    },
  },
});