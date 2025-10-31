# GitHub Repository Manager Skills

## create_github_repository

**Description**: Creates and initializes a new GitHub repository with proper 2025 best practices configuration.

**Input Schema**:
- name (string): Repository name
- description (string): Repository description
- visibility (enum): ["public", "private"] - default: "public"
- template (string, optional): Template repository to clone
- auto_init (boolean, optional): Initialize with README - default: true

**Implementation Sequence**:
1. Validate repository name and user permissions
2. Create repository using gh CLI with proper settings
3. Configure branch protection and security settings
4. Initialize .gitignore and license if needed
5. Set up initial commit structure

**Output Format**:
- Repository URL and clone instructions
- Initial configuration status
- Security settings applied
- Next steps for setup

**When to Use**:
- Creating new project repositories
- Setting up organization repositories
- Migrating existing projects to GitHub
- Creating template repositories

**GOAP Integration**:
- Action: create_repository
- Preconditions: user_authenticated=true, repo_name_valid=true
- Effects: repository_created=true, github_configured=true
- Cost: 2

---

## setup_github_workflows

**Description**: Creates comprehensive GitHub Actions workflows for CI/CD, security, and automation.

**Input Schema**:
- workflows (array): List of workflows to create ["ci", "security", "release", "docs"]
- node_versions (array): Node.js versions to test - default: ["18.x", "20.x", "22.x"]
- enable_coverage (boolean): Enable code coverage reporting - default: true
- enable_security (boolean): Enable security scanning - default: true

**Implementation Sequence**:
1. Create .github/workflows directory structure
2. Generate CI workflow with matrix testing
3. Set up security scanning (CodeQL, dependabot)
4. Configure release automation with semantic versioning
5. Add documentation deployment if requested
6. Configure workflow permissions and secrets

**Output Format**:
- Created workflow files with descriptions
- Configuration summary
- Required secrets list
- Testing matrix details

**When to Use**:
- New repository setup
- Adding CI/CD to existing projects
- Implementing security scanning
- Setting up automated releases

**GOAP Integration**:
- Action: setup_workflows
- Preconditions: repository_exists=true, workflows_defined=true
- Effects: ci_configured=true, security_enabled=true
- Cost: 3

---

## configure_repository_settings

**Description**: Applies comprehensive repository configuration including security, collaboration, and performance settings.

**Input Schema**:
- branch_protection (object): Branch protection rules
- security_features (object): Security features to enable
- collaboration (object): Team and collaboration settings
- automations (object): Automation and bot configurations

**Implementation Sequence**:
1. Configure branch protection rules
2. Enable security features (dependabot, security advisories)
3. Set up team access and permissions
4. Configure issue and PR templates
5. Enable project boards and automation
6. Set up codespaces configuration

**Output Format**:
- Applied settings summary
- Security configuration status
- Team permissions structure
- Automation rules enabled

**When to Use**:
- New repository security hardening
- Compliance requirements implementation
- Team collaboration setup
- Performance optimization

**GOAP Integration**:
- Action: configure_settings
- Preconditions: repository_exists=true, permissions_sufficient=true
- Effects: security_configured=true, collaboration_enabled=true
- Cost: 4

---

## manage_github_releases

**Description**: Sets up semantic versioning and automated release management.

**Input Schema**:
- version_scheme (enum): ["semver", "calver"] - default: "semver"
- auto_release (boolean): Enable automated releases - default: true
- changelog (boolean): Generate changelog - default: true
- assets (array): Release assets to include

**Implementation Sequence**:
1. Configure semantic versioning rules
2. Set up release workflow triggers
3. Configure changelog generation
4. Set up asset building and uploading
5. Configure release notifications
6. Set up version bumping automation

**Output Format**:
- Release workflow configuration
- Versioning scheme details
- Changelog generation setup
- Asset handling configuration

**When to Use**:
- Setting up release automation
- Implementing semantic versioning
- Creating release workflows
- Managing release assets

**GOAP Integration**:
- Action: setup_releases
- Preconditions: repository_exists=true, versioning_defined=true
- Effects: releases_configured=true, versioning_enabled=true
- Cost: 3

---

## setup_github_security

**Description**: Implements comprehensive GitHub Advanced Security features and best practices.

**Input Schema**:
- features (array): Security features to enable
- scanning_level (enum): ["standard", "comprehensive"] - default: "standard"
- dependabot (boolean): Enable dependabot - default: true
- codeql (boolean): Enable CodeQL scanning - default: true

**Implementation Sequence**:
1. Enable GitHub Advanced Security features
2. Configure Dependabot alerts and updates
3. Set up CodeQL scanning workflows
4. Configure secret scanning and push protection
5. Set up security advisories
6. Configure security policy rules

**Output Format**:
- Security features enabled
- Scanning configuration
- Alert and notification setup
- Policy and compliance status

**When to Use**:
- Security compliance requirements
- Enterprise security standards
- Vulnerability management setup
- Security audit preparation

**GOAP Integration**:
- Action: setup_security
- Preconditions: repository_exists=true, security_permissions=true
- Effects: security_enabled=true, scanning_active=true
- Cost: 4

---

## optimize_repository_performance

**Description**: Optimizes repository performance, workflows, and resource usage.

**Input Schema**:
- optimization_level (enum): ["basic", "standard", "aggressive"] - default: "standard"
- workflow_optimization (boolean): Optimize GitHub Actions - default: true
- cache_optimization (boolean): Optimize caching strategies - default: true
- size_optimization (boolean): Optimize repository size - default: true

**Implementation Sequence**:
1. Analyze current repository performance
2. Optimize GitHub Actions workflows with caching
3. Configure .gitignore for optimal repository size
4. Set up LFS for large files if needed
5. Optimize artifact retention policies
6. Configure monitoring and alerting

**Output Format**:
- Performance analysis report
- Optimizations applied
- Resource usage improvements
- Monitoring configuration

**When to Use**:
- Repository performance issues
- Large repository optimization
- CI/CD performance improvement
- Resource usage reduction

**GOAP Integration**:
- Action: optimize_performance
- Preconditions: repository_exists=true, performance_data_available=true
- Effects: performance_optimized=true, monitoring_enabled=true
- Cost: 3