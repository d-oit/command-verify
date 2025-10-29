# Contributing to Command Verification System

Thank you for your interest in contributing to the Command Verification System! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Reporting Issues](#reporting-issues)

## Code of Conduct

This project follows a Code of Conduct to ensure a welcoming environment for all contributors. By participating, you agree to uphold this code.

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- Basic understanding of JavaScript/Node.js
- Familiarity with Claude Code skills/plugins

### Quick Start

1. Fork the repository
2. Clone your fork: `git clone https://github.com/d-oit/command-verify.git`
3. Install dependencies: `npm install`
4. Run tests: `npm run verify`
5. Make your changes
6. Test your changes: `npm run verify`
7. Submit a pull request

## Development Setup

### Local Development

```bash
# Clone the repository
git clone https://github.com/d-oit/command-verify.git
cd command-verify

# Install dependencies
npm install

# Initialize git repo for testing
git init
git add .
git commit -m "Initial commit"

# Run the verification system
npm run verify

# Force a full validation (clears cache)
npm run verify:force

# Clean cache
npm run clean:cache
```

### Project Structure

```
command-verify/
├── .claude/                    # Claude Code configurations
│   ├── skills/                 # Skill definitions
│   ├── plugins/                # Plugin definitions
│   └── agents/                 # Sub-agent definitions
├── scripts/                    # Implementation scripts
│   └── verify-commands.js      # Main verification logic
├── .cache/                     # Cache directory (gitignored)
├── package.json                # Dependencies and scripts
├── README.md                   # Project documentation
└── CONTRIBUTING.md             # This file
```

## Contributing Guidelines

### Types of Contributions

- **Bug fixes**: Fix issues with existing functionality
- **Features**: Add new capabilities or improve existing ones
- **Documentation**: Improve documentation, add examples
- **Tests**: Add or improve test coverage
- **Code quality**: Refactoring, performance improvements

### Code Style

- Use modern JavaScript (ES2022+ features)
- Follow ESLint rules (if configured)
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### Commit Messages

Use clear, descriptive commit messages:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Testing changes
- `chore`: Maintenance tasks

Examples:
```
feat(command-discovery): Add support for inline code commands

Fixes parsing of `command` style references in markdown.
```

### Pull Request Guidelines

1. **Create a branch** from `main` for your work
2. **Keep PRs focused** - one feature or fix per PR
3. **Test thoroughly** - ensure all tests pass
4. **Update documentation** if needed
5. **Add screenshots** for UI changes (if applicable)
6. **Follow the PR template** (see below)

## Testing

### Automated Testing

```bash
# Run all tests
npm run verify

# Run specific test scenarios
# (Add your test commands here)
```

### Manual Testing

Test these scenarios:

1. **Fresh installation**: Delete `.cache/` and run verification
2. **Cache invalidation**: Modify a .md file and verify cache updates
3. **Git integration**: Test with different git states
4. **Error handling**: Test with missing dependencies, invalid files
5. **Performance**: Time execution with large documentation sets

### Test Documentation

When adding new features, include:

- Test cases in code comments
- Manual testing instructions
- Expected behavior documentation

## Submitting Changes

### Pull Request Process

1. **Fork** the repository
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes** following the guidelines above
4. **Test thoroughly**
5. **Update documentation** if needed
6. **Commit with clear messages**
7. **Push to your fork**
8. **Create a Pull Request** with the template below

### Pull Request Template

```markdown
## Description
Brief description of the changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Code style update (formatting, renaming)
- [ ] Refactoring (no functional changes)
- [ ] Build related changes
- [ ] Other (please describe):

## Testing
Describe the testing performed:
- [ ] Unit tests pass
- [ ] Manual testing completed
- [ ] Documentation updated

## Checklist
- [ ] I have read the [CONTRIBUTING](CONTRIBUTING.md) document
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes

## Additional Notes
Any additional information or context about this PR.
```

## Reporting Issues

### Bug Reports

When reporting bugs, please include:

- **Clear title** describing the issue
- **Steps to reproduce** the problem
- **Expected behavior** vs actual behavior
- **Environment details** (OS, Node version, etc.)
- **Error messages** or logs
- **Screenshots** if applicable

### Feature Requests

For new features, please:

- **Describe the problem** you're trying to solve
- **Explain your proposed solution**
- **Consider alternatives** you've thought about
- **Include mockups** or examples if helpful

### Issue Template

```
**Description**
[Brief description of the issue]

**Steps to Reproduce**
1. [First step]
2. [Second step]
3. [Continue...]

**Expected Behavior**
[What should happen]

**Actual Behavior**
[What actually happens]

**Environment**
- OS: [e.g., Windows 10]
- Node.js version: [e.g., 18.17.0]
- NPM version: [e.g., 9.6.7]
- Git version: [e.g., 2.41.0]

**Additional Context**
[Add any other context about the problem here]
```

## Development Workflow

### Regular Contributors

1. Check for existing issues/PRs
2. Create a feature branch
3. Implement changes
4. Test thoroughly
5. Submit PR
6. Address review feedback
7. Merge when approved

### First-Time Contributors

1. Look for issues labeled "good first issue" or "help wanted"
2. Ask questions in the issue if unclear
3. Follow the contribution guidelines
4. Don't hesitate to ask for help!

## Recognition

Contributors will be recognized in:
- GitHub's contributor insights
- Release notes for significant contributions
- Project documentation

Thank you for contributing to the Command Verification System! 🚀