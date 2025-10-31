# Verification Testing Framework Guidelines

## Testing Methodology Hierarchy

### 1. Unit Testing
**Purpose**: Test individual functions in isolation
**Focus**: Single responsibility, pure functions, deterministic behavior

**Coverage Requirements**:
- Functions: 90% minimum
- Branches: 90% minimum  
- Lines: 90% minimum
- Statements: 90% minimum

**Test Structure**:
```javascript
describe('functionName', () => {
  describe('should handle valid inputs', () => {
    it('should return expected result for case 1', () => {
      // Test implementation
    });
    it('should handle edge case 2', () => {
      // Test implementation
    });
  });
  
  describe('should handle invalid inputs', () => {
    it('should throw error for null input', () => {
      // Test implementation
    });
    it('should handle empty input gracefully', () => {
      // Test implementation
    });
  });
});
```

### 2. Integration Testing
**Purpose**: Test component interactions and data flow
**Focus**: Module boundaries, data transformation, side effects

**Integration Points**:
- Command Detection ↔ Command Extraction
- Command Categorization ↔ Knowledge Base
- Cache System ↔ Git Integration
- Verification Pipeline ↔ External Dependencies

### 3. Edge Case Testing
**Purpose**: Test boundary conditions and error scenarios
**Focus**: Unusual inputs, system limits, failure modes

**Edge Case Categories**:
- **Input Validation**: null, undefined, empty strings, extreme lengths
- **Platform Variations**: Windows vs Unix, path separators, executable formats
- **Performance Limits**: Large files, many commands, memory constraints
- **Error Conditions**: Missing files, invalid permissions, network failures

### 4. Performance Testing
**Purpose**: Validate efficiency and scalability
**Focus**: Execution time, memory usage, throughput

**Performance Benchmarks**:
- Command detection: <10ms per 1000 lines
- Command extraction: <50ms per file
- Categorization: <1ms per command
- Cache operations: <5ms lookup time
- Full verification: <1s with cache, <5s without

### 5. Mock Testing
**Purpose**: Test with controlled external dependencies
**Focus**: Isolation, reproducibility, edge case simulation

## Mock Design Principles

### File System Mocks
```javascript
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
```

### Git Operation Mocks
```javascript
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
    return '';
  });
};
```

### Glob Pattern Mocks
```javascript
export const mockGlob = (mockResults = {}) => {
  return vi.fn().mockImplementation((pattern, options) => {
    if (mockResults[pattern]) {
      return Promise.resolve(mockResults[pattern]);
    }
    // Default behavior - return common markdown files
    if (pattern === '**/*.md') {
      return Promise.resolve([
        'README.md',
        'docs/installation.md',
        'docs/usage.md',
        'CHANGELOG.md',
      ]);
    }
    return Promise.resolve([]);
  });
};
```

## Test Coverage Requirements

### Command Detection Tests
- **Valid Commands**: All supported command types and patterns
- **Invalid Commands**: False positive scenarios and edge cases
- **Platform Variations**: Windows, macOS, Linux specific commands
- **Performance**: Large file processing and memory usage
- **Integration**: With extraction and categorization components

### Command Extraction Tests
- **Code Blocks**: Different language hints (bash, shell, powershell)
- **Inline Code**: Backtick extraction and context
- **Generic Blocks**: Code without language hints
- **Mixed Content**: Files with multiple code block types
- **Edge Cases**: Malformed blocks, nested backticks

### Categorization Tests
- **Safety Rules**: All danger levels and categories
- **Knowledge Base**: Integration and priority handling
- **Confidence Scoring**: Accuracy and consistency
- **Edge Cases**: Unknown commands and ambiguous cases
- **Security**: Privilege escalation and data loss detection

### Cache System Tests
- **Storage**: Command validation caching and retrieval
- **Invalidation**: Git diff-based cache updates
- **Performance**: Hit rates and lookup times
- **Persistence**: Cache file management and corruption
- **Integration**: With verification pipeline

### Git Integration Tests
- **Diff Analysis**: File change detection and impact
- **Commit Tracking**: Last validation commit management
- **Error Handling**: Non-git repositories and network issues
- **Performance**: Large repository handling
- **Edge Cases**: Empty repos, merge conflicts, detached HEAD

## Test Data Management

### Test Fixtures
```javascript
// fixtures/commands.js
export const VALID_COMMANDS = [
  'npm install',
  'git status',
  'docker build',
  'cargo test',
  // ... more test cases
];

export const INVALID_COMMANDS = [
  '# Header',
  '- List item',
  'const x = 1',
  'rate: 91.3%',
  // ... more test cases
];
```

### Mock Data Sets
```javascript
// fixtures/mockFiles.js
export const MARKDOWN_FILES = {
  'README.md': `# Installation\n\n\`\`\`bash\nnpm install\n\`\`\``,
  'docs/usage.md': `# Usage\n\nRun \`git status\` to check.`,
  // ... more mock files
};
```

### Performance Test Data
```javascript
// fixtures/performance.js
export const LARGE_MARKDOWN = 'npm install\n'.repeat(10000);
export const MANY_COMMANDS = Array.from({length: 1000}, (_, i) => `npm run test-${i}`);
```

## Continuous Integration Testing

### Test Pipeline
1. **Lint Check**: Code style and quality validation
2. **Unit Tests**: Fast feedback on code changes
3. **Integration Tests**: Component interaction validation
4. **Coverage Check**: Ensure minimum coverage thresholds
5. **Performance Tests**: Regression detection for performance
6. **Security Tests**: Vulnerability scanning and analysis

### Quality Gates
- All tests must pass
- Coverage thresholds must be met
- No new security vulnerabilities
- Performance benchmarks must be maintained
- Code quality metrics must be acceptable

### Test Reporting
- **Coverage Reports**: HTML, JSON, and text formats
- **Performance Metrics**: Execution time and memory usage
- **Test Results**: Detailed failure information and trends
- **Quality Metrics**: Code complexity and maintainability