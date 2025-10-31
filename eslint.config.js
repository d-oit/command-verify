import js from '@eslint/js';

export default [
  {
    ignores: [
      'node_modules/**',
      '.cache/**',
      '.roo/**',
      'factory/**',
      'comprehensive-test-runner.js',
      'coverage-*.js',
      'coverage-report.html',
      'simple-coverage-analysis.js',
      'validate-claude-standards.js',
      'mocks/**',
    ],
  },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
      },
    },
    rules: {
      // Code quality
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': 'off', // Allow console for CLI tools
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-arrow-callback': 'error',
      'arrow-spacing': 'error',

      // Consistency
      'quotes': ['error', 'single', { avoidEscape: true }],
      'semi': ['error', 'always'],
      'comma-dangle': ['error', 'always-multiline'],
      'indent': ['error', 2],
      'brace-style': ['error', '1tbs'],
      'space-before-function-paren': ['error', 'never'],
      'key-spacing': ['error', { beforeColon: false, afterColon: true }],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],

      // Security
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',

      // Best practices for Node.js CLI
      'no-process-exit': 'off', // Allow process.exit in CLI
      'handle-callback-err': 'error',
      'no-new-require': 'error',
      'no-path-concat': 'error',
    },
  },
  {
    files: ['**/*.test.js', '**/*.spec.js'],
    languageOptions: {
      globals: {
        vi: 'readonly',
      },
    },
    rules: {
      'no-unused-expressions': 'off',
      'space-before-function-paren': 'off',
    },
  },
];