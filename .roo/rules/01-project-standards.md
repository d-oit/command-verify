# Command Verification Project Standards

## Project Overview
This is a command verification system for documentation with intelligent git diff-based cache invalidation. The system discovers CLI commands in markdown files, validates them, and ensures documentation accuracy with zero token cost after initial setup.

## Technology Stack
- **Runtime**: Node.js 18+ (ES modules)
- **Language**: JavaScript (modern ES6+)
- **Testing**: Vitest with V8 coverage provider
- **Package Management**: npm/yarn/pnpm support
- **Core Dependencies**: glob for file pattern matching
- **Development Tools**: ESLint, Prettier

## Architecture Principles
- **SOLID Design**: Single responsibility, open/closed, Liskov substitution, interface segregation, dependency inversion
- **Modular Structure**: Each module has clear boundaries and responsibilities
- **Test-Driven Development**: Comprehensive test coverage with 90%+ thresholds
- **Performance First**: Sub-second execution with 90%+ cache hit rates
- **Git-Native**: Leverages git for intelligent caching and invalidation

## Code Quality Standards
- **ESLint Compliance**: All code must pass linting with no warnings
- **Test Coverage**: 90% minimum for functions, branches, lines, statements
- **Documentation**: All modules must have comprehensive JSDoc comments
- **Error Handling**: Graceful error handling with proper logging
- **Performance**: No blocking operations, efficient algorithms

## File Organization
```
project-root/
├── lib/                          # Core modules
│   ├── command-detection.js      # Command pattern recognition
│   ├── command-extraction.js      # Markdown parsing and extraction
│   ├── command-categorization.js   # Safety classification
│   └── knowledge-base.js         # Learning system integration
├── scripts/                       # Executable scripts
│   └── verify-commands-updated.js  # Main verification implementation
├── __tests__/                     # Test suites
├── mocks/                         # Test utilities and mocks
├── .roo/                         # AI modes and rules
└── package.json                   # Dependencies and scripts
```

## Development Workflow
1. **Feature Development**: Create feature branch from main
2. **Test-First**: Write tests before implementation
3. **Implementation**: Write code following SOLID principles
4. **Validation**: Run full test suite with coverage
5. **Integration**: Test with real documentation
6. **Documentation**: Update README and inline docs
7. **Pull Request**: Code review and automated checks

## Performance Requirements
- **Discovery Phase**: <200ms for typical projects
- **Analysis Phase**: <100ms for impact analysis  
- **Validation Phase**: <500ms for affected commands
- **Cache Operations**: <50ms lookup time
- **Total Execution**: <1s with cache, <5s without
- **Memory Usage**: <100MB for large projects
- **Cache Hit Rate**: 90%+ for typical workflows

## Security Considerations
- **Command Safety**: Never auto-execute dangerous commands
- **Input Validation**: Validate all user inputs and file paths
- **Privilege Escalation**: Flag sudo/admin operations
- **Data Protection**: Never expose sensitive data in logs
- **Dependency Security**: Regular security updates for dependencies

## Integration Requirements
- **Git Integration**: Must work with any git repository
- **Cross-Platform**: Support Windows, macOS, Linux
- **IDE Integration**: Compatible with VS Code and other editors
- **CI/CD Integration**: Easy integration with build pipelines
- **Plugin System**: Extensible architecture for custom rules

## Monitoring and Observability
- **Performance Metrics**: Track execution times and cache hit rates
- **Error Tracking**: Comprehensive error logging and analysis
- **Usage Analytics**: Monitor command patterns and effectiveness
- **Health Checks**: System health validation and reporting
- **Audit Logging**: Complete audit trail for all operations