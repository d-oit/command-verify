# Contributing to Command Verify

Thank you for your interest in contributing to Command Verify! This guide will help you get started.

## 🚀 Quick Start

### Prerequisites
- **Node.js**: Version 18.x or higher
- **Git**: For version control
- **GitHub Account**: For pull requests
- **Text Editor**: VS Code recommended with our extensions

### Setup Instructions
```bash
# 1. Fork the repository
gh repo fork d-oit/command-verify

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/command-verify.git
cd command-verify

# 3. Install dependencies
npm install

# 4. Create your feature branch
git checkout -b feature/your-feature-name

# 5. Make your changes
# ... code changes ...

# 6. Test your changes
npm run test
npm run lint
npm run verify

# 7. Commit your changes
git add .
git commit -m "feat: add your feature description"

# 8. Push to your fork
git push origin feature/your-feature-name

# 9. Create pull request
gh pr create --title "feat: your feature title" --body "See description below"
```

## 📋 Development Workflow

### 1. Planning
- [ ] Check existing issues for similar requests
- [ ] Create issue for discussion before large changes
- [ ] Design approach and consider edge cases
- [ ] Plan testing strategy

### 2. Development
- [ ] Follow existing code style and patterns
- [ ] Add JSDoc comments for new functions
- [ ] Include error handling for edge cases
- [ ] Update documentation as needed

### 3. Testing
- [ ] Write unit tests for new functionality
- [ ] Ensure 90%+ code coverage
- [ ] Test on multiple Node.js versions
- [ ] Verify command detection still works

### 4. Code Review
- [ ] Self-review your changes
- [ ] Run all tests locally
- [ ] Check for security implications
- [ ] Update CHANGELOG if needed

## 🧪 Testing Guidelines

### Test Structure
```javascript
// Example test structure
import { describe, it, expect } from 'vitest';

import { yourFunction } from '../lib/your-module.js';

describe('yourFunction', () => {
  it('should handle basic case', () => {
    const result = yourFunction('input');
    expect(result).toBe('expected');
  });

  it('should handle edge cases', () => {
    expect(() => yourFunction(null)).toThrow();
  });
});
```

### Coverage Requirements
- **Functions**: 90% minimum
- **Branches**: 90% minimum
- **Lines**: 90% minimum
- **Statements**: 90% minimum

### Command Verification Testing
Always test command verification:
```bash
# Test discovery
npm run verify

# Test with force
npm run verify:force

# Test statistics
npm run verify:stats
```

## 📝 Code Style

### JavaScript Standards
- **ESLint**: All code must pass linting
- **ES Modules**: Use ES6+ import/export syntax
- **JSDoc**: Document all public functions
- **Error Handling**: Use try/catch for async operations

### Naming Conventions
```javascript
// Functions: camelCase
function detectCommands() { }

// Constants: UPPER_SNAKE_CASE
const MAX_COMMAND_LENGTH = 1000;

// Files: kebab-case
// command-detection.js
// command-categorization.js
```

### Git Commit Messages
Follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples**:
```
feat(detection): add support for docker commands
fix(categorization): handle edge case in safety checks
docs(readme): update installation instructions
test(cache): add integration tests for git diff
```

## 🔧 Project Structure

### Core Modules
- `lib/command-detection.js` - Command pattern recognition
- `lib/command-extraction.js` - Markdown parsing
- `lib/command-categorization.js` - Safety classification
- `lib/knowledge-base.js` - Learning system
- `lib/cache-manager.js` - Git-based caching
- `scripts/verify-commands.js` - Main CLI interface

### Adding New Modules
1. Create file in `lib/` directory
2. Export functions as needed
3. Add corresponding tests in `__tests__/`
4. Update documentation in README.md
5. Consider integration with existing modules

### Configuration Files
- `package.json` - Dependencies and scripts
- `eslint.config.js` - Linting rules
- `vitest.config.js` - Test configuration
- `.claude/knowledge.json` - Learning data

## 🐛 Bug Reports

### Reporting Bugs
1. **Search**: Check existing issues first
2. **Use Template**: Fill out bug report template
3. **Include**: Environment details and reproduction steps
4. **Add Logs**: Include relevant console output
5. **Test**: Verify bug still exists in latest version

### Debug Information
Provide this information in bug reports:
```bash
# System info
node --version
npm --version
git --version

# Project info
npm list command-verify
npm run verify:stats
```

## 💡 Feature Requests

### Proposing Features
1. **Discuss**: Create issue for discussion
2. **Use Case**: Explain problem and solution
3. **Alternatives**: Consider other approaches
4. **Implementation**: Suggest how to implement
5. **Breaking Changes**: Note any compatibility impact

### Feature Categories
- **Command Detection**: New CLI tools or patterns
- **Caching**: Performance or invalidation improvements
- **Safety**: New security categorizations
- **UI**: Better output or interactive features
- **Integration**: New platform or tool support

## 📚 Documentation

### README.md Updates
When adding features:
- [ ] Update "Features" section
- [ ] Add usage examples
- [ ] Update installation if needed
- [ ] Add troubleshooting tips
- [ ] Update file structure diagram

### Code Documentation
```javascript
/**
 * Detects commands in markdown content
 * @param {string} content - Markdown content to analyze
 * @param {Object} options - Detection options
 * @returns {Array<Command>} Array of detected commands
 * @throws {Error} When content is invalid
 * 
 * @example
 * const commands = detectCommands(markdown, { platform: 'linux' });
 */
function detectCommands(content, options = {}) {
  // implementation
}
```

## 🔄 Release Process

### Version Management
- Follow [Semantic Versioning](https://semver.org/)
- Update `package.json` version
- Update CHANGELOG.md
- Create GitHub release with notes

### Release Checklist
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Version bumped correctly
- [ ] CHANGELOG updated
- [ ] Release notes prepared
- [ ] Security review completed

## 🏆 Recognition

### Contributor Recognition
- **AUTHORS.md**: Add your name and contributions
- **Release Notes**: Mention significant contributors
- **GitHub**: Tag contributors in relevant commits/PRs

### Types of Contributions
- **Code**: New features, bug fixes, refactoring
- **Documentation**: README, inline docs, examples
- **Testing**: Test cases, coverage improvements
- **Infrastructure**: CI/CD, workflows, configuration
- **Community**: Support, triage, reviews

## 🤝 Community

### Getting Help
- **Issues**: Use GitHub issues for questions
- **Discussions**: Start GitHub Discussion for general topics
- **Discord**: Join our community Discord (if available)
- **Email**: Contact maintainers for sensitive topics

### Code of Conduct
Please read and follow our [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
We're committed to providing a welcoming and inclusive environment.

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.
See [LICENSE](LICENSE) file for details.

## 🙏 Thank You

Thank you for contributing to Command Verify! Every contribution helps make this project better for everyone.

---

**Questions?** Feel free to ask in issues or discussions. We're here to help! 🚀