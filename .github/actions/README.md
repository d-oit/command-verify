# GitHub Actions - Reusable Components

This directory contains reusable composite actions and workflow templates that provide standardized, maintainable CI/CD workflows for Node.js projects.

## 📋 Available Actions

### 1. Environment Setup (`environment-setup`)
Complete environment initialization with validation and configuration.

**Purpose**: Ensures consistent Node.js setup across all workflows with proper validation.

**Key Features**:
- Node.js version setup and validation
- Git configuration
- Package.json validation
- Required secrets checking
- Environment-specific validation

**Usage**:
```yaml
- name: Setup Environment
  uses: ./.github/actions/environment-setup
  with:
    node-version: '20.x'
    environment: 'development'
    validate-node-version: 'true'
    check-secrets: 'true'
```

**Inputs**:
- `node-version`: Node.js version to setup (default: '20.x')
- `environment`: Environment type (development/staging/production)
- `validate-node-version`: Validate version matches expected
- `check-secrets`: Check for required secrets
- `setup-git`: Setup git configuration
- `validate-package-json`: Validate package.json structure

**Outputs**:
- `node-version-installed`: Installed Node.js version
- `os-info`: Operating system information
- `environment-valid`: Whether environment is properly configured
- `secrets-missing`: List of missing required secrets

### 2. Node.js Setup (`setup-node`)
Optimized Node.js environment with multi-layer caching.

**Purpose**: Provides consistent Node.js setup with intelligent caching for faster builds.

**Key Features**:
- Multi-layer caching (npm, node_modules)
- Configurable installation commands
- Dependency verification
- Performance optimization

**Usage**:
```yaml
- name: Setup Node.js
  uses: ./.github/actions/setup-node
  with:
    node-version: '20.x'
    cache-dependency-path: 'package-lock.json'
    install-command: 'ci --legacy-peer-deps'
    verify-dependencies: 'true'
```

**Inputs**:
- `node-version`: Node.js version (default: '20.x')
- `cache-dependency-path`: Path to dependency file for caching
- `install-command`: Installation command (ci/install)
- `peer-deps`: Use legacy peer deps flag
- `verify-dependencies`: Verify installation

**Outputs**:
- `cache-hit`: Whether npm cache was hit
- `node-version`: Node.js version that was set up

### 3. Security Scan (`security-scan`)
Comprehensive security scanning including CodeQL, npm audit, and vulnerability detection.

**Purpose**: Provides standardized security scanning across all workflows.

**Key Features**:
- npm audit with configurable severity
- CodeQL static analysis
- Snyk integration (optional)
- SARIF output for GitHub Security tab
- Vulnerability reporting

**Usage**:
```yaml
- name: Security Scan
  uses: ./.github/actions/security-scan
  with:
    severity-threshold: 'moderate'
    fail-on-vulnerabilities: 'true'
    include-snyk: 'true'
```

**Inputs**:
- `severity-threshold`: Minimum severity to fail on
- `fail-on-vulnerabilities`: Fail build on vulnerabilities
- `include-snyk`: Include Snyk security scan
- `sarif-output`: Output file for SARIF results

**Outputs**:
- `vulnerabilities-found`: Number of vulnerabilities found
- `security-score`: Security score from CodeQL

### 4. Test Execution (`test-execution`)
Comprehensive test execution with coverage reporting and caching.

**Purpose**: Standardized testing with coverage analysis and performance optimization.

**Key Features**:
- Parallel test execution
- Coverage reporting
- Multi-format coverage upload
- Test result caching
- Coverage threshold validation

**Usage**:
```yaml
- name: Execute Tests
  uses: ./.github/actions/test-execution
  with:
    test-command: 'npm run test:coverage'
    coverage-threshold: '80'
    upload-coverage: 'true'
```

**Inputs**:
- `test-command`: Test command to run
- `coverage-format`: Coverage output format
- `upload-coverage`: Upload coverage to external service
- `coverage-threshold`: Minimum coverage percentage
- `parallel`: Run tests in parallel
- `verbose`: Verbose test output

**Outputs**:
- `test-result`: Test execution result
- `coverage-percentage`: Total coverage percentage
- `tests-run`: Number of tests run

### 5. Quality Checks (`quality-checks`)
Code quality validation including linting, formatting, and type checking.

**Purpose**: Ensures code quality standards across all projects.

**Key Features**:
- ESLint integration
- Code formatting validation
- TypeScript type checking support
- Quality scoring
- Auto-fix capabilities

**Usage**:
```yaml
- name: Quality Checks
  uses: ./.github/actions/quality-checks
  with:
    lint-command: 'npm run lint'
    check-format: 'true'
    fail-on-issues: 'true'
```

**Inputs**:
- `lint-command`: Command to run linting
- `fix-lint`: Automatically fix linting issues
- `check-format`: Check code formatting
- `format-command`: Format check command
- `type-check`: Run TypeScript type checking
- `fail-on-issues`: Fail build on quality issues

**Outputs**:
- `quality-score`: Overall quality score (0-100)
- `lint-issues`: Number of linting issues found
- `format-issues`: Number of formatting issues found

### 6. Dependency Management (`dependency-management`)
NPM dependency management with security checks and automated updates.

**Purpose**: Provides standardized dependency management across workflows.

**Key Features**:
- Install/update/audit operations
- Security vulnerability scanning
- License compliance checking
- Automated PR creation for updates
- Update strategy configuration

**Usage**:
```yaml
- name: Dependency Management
  uses: ./.github/actions/dependency-management
  with:
    action: 'install'
    audit-level: 'moderate'
    create-pr: 'true'
```

**Inputs**:
- `action`: Action to perform (install/audit/outdated/update)
- `install-command`: Installation command
- `verify-installed`: Verify dependencies after installation
- `audit-level`: Audit level for security checks
- `update-strategy`: Update strategy (patch/minor/major/latest)
- `create-pr`: Create PR for updates

**Outputs**:
- `has-updates`: Whether updates are available
- `outdated-count`: Number of outdated packages
- `vulnerabilities`: Number of vulnerabilities found
- `audit-result`: Audit result (pass/fail/warn)

## 🏗️ Workflow Templates

### CI Workflow Template (`templates/ci-workflow.yml`)
Reusable CI workflow with configurable steps.

**Usage**:
```yaml
name: Custom CI
on: [push, pull_request]

jobs:
  ci:
    uses: ./.github/workflows/templates/ci-workflow.yml
    with:
      node-version: '20.x'
      test-command: 'npm run test:coverage'
      run-security-scan: 'true'
```

### Security Workflow Template (`templates/security-workflow.yml`)
Reusable security scanning workflow template.

**Usage**:
```yaml
name: Custom Security
on: [schedule, push]

jobs:
  security:
    uses: ./.github/workflows/templates/security-workflow.yml
    with:
      scan-types: '["codeql", "npm-audit", "secrets"]'
      severity-threshold: 'moderate'
```

## 🔧 Configuration

### Global Configuration
All actions support environment-specific configuration through GitHub environment variables and repository settings.

### Caching Strategy
Actions implement multi-layer caching:
1. **Node.js/npm cache**: Dependencies and package manager cache
2. **Test cache**: Test execution results and artifacts
3. **Linting cache**: ESLint and other linting tool caches

### Performance Optimization
- **Parallel execution**: Tests run in parallel when possible
- **Intelligent caching**: Multi-layer caching strategy
- **Conditional execution**: Steps only run when needed
- **Resource optimization**: Efficient use of GitHub Actions minutes

## 🚀 Best Practices

### 1. Version Pinning
Always pin action versions for stability:
```yaml
uses: actions/checkout@v5
```

### 2. Security Considerations
- Use least-privilege permissions
- Validate all inputs
- Store secrets securely
- Regular security audits

### 3. Performance
- Enable caching where possible
- Use matrix builds for testing multiple versions
- Minimize workflow complexity
- Monitor execution times

### 4. Maintainability
- Keep workflows simple and focused
- Use descriptive names for jobs and steps
- Document custom configurations
- Regular updates and maintenance

## 📊 Monitoring and Metrics

### Performance Metrics
- Build time reduction through caching
- Resource usage optimization
- Test execution speed
- Cache hit rates

### Quality Metrics
- Test coverage percentages
- Security vulnerability counts
- Code quality scores
- Dependency update frequency

### Reliability Metrics
- Success/failure rates
- Mean time to recovery
- Workflow stability
- Error rate trends

## 🔄 Migration Guide

For teams migrating from custom workflows to these reusable components:

1. **Assessment**: Identify duplicate code patterns in existing workflows
2. **Planning**: Map existing workflows to new reusable components
3. **Migration**: Replace custom steps with reusable actions
4. **Testing**: Validate workflow behavior after migration
5. **Optimization**: Fine-tune configuration for performance

See the full migration guide in [MIGRATION.md](./MIGRATION.md).

## 🤝 Contributing

To add new reusable components:

1. Create new action directory under `.github/actions/`
2. Implement composite action with proper inputs/outputs
3. Add comprehensive documentation
4. Include usage examples
5. Test thoroughly across different scenarios

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Composite Actions Guide](https://docs.github.com/en/actions/creating-actions/creating-a-composite-action)
- [Reusable Workflows](https://docs.github.com/en/actions/using-workflows/reusing-workflows)
- [Security Best Practices](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)