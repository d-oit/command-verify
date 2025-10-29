#!/usr/bin/env node

/**
 * Claude Code Standards Validator
 *
 * Validates the command-verify skill against Claude Code documentation standards:
 * - https://docs.claude.com/en/docs/claude-code/skills
 * - https://docs.claude.com/en/docs/claude-code/plugins
 * - https://docs.claude.com/en/docs/claude-code/sub-agents
 * - https://docs.claude.com/en/docs/agents-and-tools/agent-skills/best-practices
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class ClaudeStandardsValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.passed = [];
  }

  log(message, type = 'info') {
    const prefix = {
      error: '❌',
      warning: '⚠️ ',
      success: '✅',
      info: 'ℹ️ '
    }[type] || 'ℹ️ ';

    console.log(`${prefix} ${message}`);

    if (type === 'error') this.errors.push(message);
    else if (type === 'warning') this.warnings.push(message);
    else if (type === 'success') this.passed.push(message);
  }

  async validateFileExists(filePath, description) {
    try {
      await fs.access(filePath);
      this.log(`${description} found`, 'success');
      return true;
    } catch {
      this.log(`${description} missing: ${filePath}`, 'error');
      return false;
    }
  }

  async validateYAMLStructure(filePath, requiredFields, description) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const yamlContent = content;

      for (const field of requiredFields) {
        if (!yamlContent.includes(`${field}:`)) {
          this.log(`${description}: Missing required field '${field}'`, 'error');
        } else {
          this.log(`${description}: Field '${field}' present`, 'success');
        }
      }

      return true;
    } catch (error) {
      this.log(`${description}: Failed to read file - ${error.message}`, 'error');
      return false;
    }
  }

  async validateSkillStandards() {
    console.log('\n🔍 Validating Skill Standards (.claude/skills/command-verify.yml)');
    console.log('================================================================\n');

    const skillPath = '.claude/skills/command-verify.yml';

    // Required files
    await this.validateFileExists(skillPath, 'Skill definition file');

    // Required YAML structure
    const requiredSkillFields = [
      'name',
      'description',
      'version',
      'capabilities',
      'triggers',
      'behavior',
      'cache',
      'dependencies'
    ];

    await this.validateYAMLStructure(skillPath, requiredSkillFields, 'Skill YAML structure');

    // Check specific skill standards
    try {
      const content = await fs.readFile(skillPath, 'utf-8');

      // Check for trigger patterns
      if (!content.includes('triggers:')) {
        this.log('Skill: Missing triggers section', 'error');
      } else if (!content.includes('pattern:')) {
        this.log('Skill: Missing trigger patterns', 'error');
      } else {
        this.log('Skill: Has trigger patterns', 'success');
      }

      // Check for capabilities
      if (!content.includes('capabilities:')) {
        this.log('Skill: Missing capabilities section', 'error');
      } else {
        this.log('Skill: Has capabilities section', 'success');
      }

      // Check for behavior section
      if (!content.includes('behavior:')) {
        this.log('Skill: Missing behavior section', 'error');
      } else {
        this.log('Skill: Has behavior section', 'success');
      }

      // Check for cache strategy
      if (!content.includes('cache:')) {
        this.log('Skill: Missing cache configuration', 'error');
      } else {
        this.log('Skill: Has cache configuration', 'success');
      }

      // Check for usage examples
      if (!content.includes('usage_examples:')) {
        this.log('Skill: Missing usage examples', 'warning');
      } else {
        this.log('Skill: Has usage examples', 'success');
      }

      // Check for success criteria
      if (!content.includes('success_criteria:')) {
        this.log('Skill: Missing success criteria', 'warning');
      } else {
        this.log('Skill: Has success criteria', 'success');
      }

    } catch (error) {
      this.log(`Skill validation failed: ${error.message}`, 'error');
    }
  }

  async validatePluginStandards() {
    console.log('\n🔌 Validating Plugin Standards (.claude/plugins/command-executor.yml)');
    console.log('======================================================================\n');

    const pluginPath = '.claude/plugins/command-executor.yml';

    // Required files
    await this.validateFileExists(pluginPath, 'Plugin definition file');

    // Required YAML structure
    const requiredPluginFields = [
      'name',
      'description',
      'version',
      'plugin_type',
      'extends',
      'config',
      'triggers',
      'capabilities'
    ];

    await this.validateYAMLStructure(pluginPath, requiredPluginFields, 'Plugin YAML structure');

    // Check specific plugin standards
    try {
      const content = await fs.readFile(pluginPath, 'utf-8');

      // Check for plugin type
      if (!content.includes('plugin_type:')) {
        this.log('Plugin: Missing plugin_type', 'error');
      } else {
        this.log('Plugin: Has plugin_type', 'success');
      }

      // Check for extends
      if (!content.includes('extends:')) {
        this.log('Plugin: Missing extends field', 'error');
      } else {
        this.log('Plugin: Has extends field', 'success');
      }

      // Check for config section
      if (!content.includes('config:')) {
        this.log('Plugin: Missing config section', 'error');
      } else {
        this.log('Plugin: Has config section', 'success');
      }

      // Check for safety features
      if (!content.includes('safety:')) {
        this.log('Plugin: Missing safety configuration', 'warning');
      } else {
        this.log('Plugin: Has safety configuration', 'success');
      }

    } catch (error) {
      this.log(`Plugin validation failed: ${error.message}`, 'error');
    }
  }

  async validateSubAgentStandards() {
    console.log('\n🤖 Validating Sub-Agent Standards (.claude/agents/command-analyzer.yml)');
    console.log('========================================================================\n');

    const agentPath = '.claude/agents/command-analyzer.yml';

    // Required files
    await this.validateFileExists(agentPath, 'Sub-agent definition file');

    // Required YAML structure
    const requiredAgentFields = [
      'name',
      'description',
      'version',
      'agent_type',
      'parent',
      'invocation_triggers',
      'capabilities'
    ];

    await this.validateYAMLStructure(agentPath, requiredAgentFields, 'Sub-agent YAML structure');

    // Check specific sub-agent standards
    try {
      const content = await fs.readFile(agentPath, 'utf-8');

      // Check for agent type
      if (!content.includes('agent_type:')) {
        this.log('Sub-agent: Missing agent_type', 'error');
      } else {
        this.log('Sub-agent: Has agent_type', 'success');
      }

      // Check for parent skill
      if (!content.includes('parent:')) {
        this.log('Sub-agent: Missing parent field', 'error');
      } else {
        this.log('Sub-agent: Has parent field', 'success');
      }

      // Check for invocation triggers
      if (!content.includes('invocation_triggers:')) {
        this.log('Sub-agent: Missing invocation_triggers', 'error');
      } else {
        this.log('Sub-agent: Has invocation_triggers', 'success');
      }

      // Check for cost management
      if (!content.includes('cost_control:')) {
        this.log('Sub-agent: Missing cost management', 'warning');
      } else {
        this.log('Sub-agent: Has cost management', 'success');
      }

    } catch (error) {
      this.log(`Sub-agent validation failed: ${error.message}`, 'error');
    }
  }

  async validateImplementationStandards() {
    console.log('\n💻 Validating Implementation Standards');
    console.log('=====================================\n');

    // Check for implementation script
    await this.validateFileExists('scripts/verify-commands.js', 'Main implementation script');

    // Check for package.json
    const packageExists = await this.validateFileExists('package.json', 'Package configuration');

    if (packageExists) {
      try {
        const packageContent = await fs.readFile('package.json', 'utf-8');
        const packageJson = JSON.parse(packageContent);

        // Check for required fields
        const requiredFields = ['name', 'version', 'description', 'type', 'main'];
        for (const field of requiredFields) {
          if (!packageJson[field]) {
            this.log(`Package.json: Missing required field '${field}'`, 'error');
          } else {
            this.log(`Package.json: Has '${field}'`, 'success');
          }
        }

        // Check for scripts
        if (!packageJson.scripts || !packageJson.scripts.verify) {
          this.log('Package.json: Missing verify script', 'error');
        } else {
          this.log('Package.json: Has verify script', 'success');
        }

        // Check for dependencies
        if (!packageJson.dependencies || !packageJson.dependencies.glob) {
          this.log('Package.json: Missing glob dependency', 'warning');
        } else {
          this.log('Package.json: Has required dependencies', 'success');
        }

      } catch (error) {
        this.log(`Package.json validation failed: ${error.message}`, 'error');
      }
    }
  }

  async validateDocumentationStandards() {
    console.log('\n📚 Validating Documentation Standards');
    console.log('====================================\n');

    // Check for README
    const readmeExists = await this.validateFileExists('README.md', 'README documentation');

    if (readmeExists) {
      try {
        const readmeContent = await fs.readFile('README.md', 'utf-8');

        // Check for essential sections
        const essentialSections = [
          'Features',
          'Quick Start',
          'Usage Examples',
          'Installation',
          'Configuration'
        ];

        for (const section of essentialSections) {
          if (readmeContent.includes(`# ${section}`) || readmeContent.includes(`## ${section}`)) {
            this.log(`README: Has '${section}' section`, 'success');
          } else {
            this.log(`README: Missing '${section}' section`, 'warning');
          }
        }

      } catch (error) {
        this.log(`README validation failed: ${error.message}`, 'error');
      }
    }

    // Check for CONTRIBUTING
    const contributingExists = await this.validateFileExists('CONTRIBUTING.md', 'Contributing guidelines');

    if (contributingExists) {
      this.log('Has CONTRIBUTING.md', 'success');
    } else {
      this.log('Missing CONTRIBUTING.md', 'warning');
    }

    // Check for LICENSE
    const licenseExists = await this.validateFileExists('LICENSE', 'License file');

    if (licenseExists) {
      this.log('Has LICENSE file', 'success');
    } else {
      this.log('Missing LICENSE file', 'warning');
    }

   
  }

  async validateGitHubStandards() {
    console.log('\n🐙 Validating GitHub Standards');
    console.log('=============================\n');

    // Check for GitHub templates
    const issueTemplateExists = await this.validateFileExists('.github/ISSUE_TEMPLATE/bug-report.yml', 'Bug report template');
    const featureTemplateExists = await this.validateFileExists('.github/ISSUE_TEMPLATE/feature-request.yml', 'Feature request template');
    const prTemplateExists = await this.validateFileExists('.github/PULL_REQUEST_TEMPLATE.md', 'PR template');

    // Check for .gitignore
    const gitignoreExists = await this.validateFileExists('.gitignore', 'Git ignore file');

    if (gitignoreExists) {
      try {
        const gitignoreContent = await fs.readFile('.gitignore', 'utf-8');

        // Check for common ignores
        const importantIgnores = [
          'node_modules/',
          '.cache/',
          '*.log'
        ];

        for (const ignore of importantIgnores) {
          if (gitignoreContent.includes(ignore)) {
            this.log(`Gitignore: Ignores '${ignore}'`, 'success');
          } else {
            this.log(`Gitignore: Should ignore '${ignore}'`, 'warning');
          }
        }

      } catch (error) {
        this.log(`Gitignore validation failed: ${error.message}`, 'error');
      }
    }
  }

  async validateBestPractices() {
    console.log('\n✨ Validating Best Practices');
    console.log('===========================\n');

    // Check skill naming conventions
    const skillContent = await fs.readFile('.claude/skills/command-verify.yml', 'utf-8');

    // Check for kebab-case naming
    if (skillContent.includes('name: command-verify')) {
      this.log('Skill: Uses kebab-case naming', 'success');
    } else {
      this.log('Skill: Should use kebab-case naming', 'warning');
    }

    // Check for version field
    if (skillContent.includes('version: ')) {
      this.log('Skill: Has version field', 'success');
    } else {
      this.log('Skill: Missing version field', 'warning');
    }

    // Check for clear descriptions
    if (skillContent.includes('description: |')) {
      this.log('Skill: Has detailed description', 'success');
    } else {
      this.log('Skill: Should have detailed description', 'warning');
    }

    // Check plugin configuration
    const pluginContent = await fs.readFile('.claude/plugins/command-executor.yml', 'utf-8');

    // Check for safety defaults
    if (pluginContent.includes('auto_execute: false')) {
      this.log('Plugin: Has safe defaults (auto_execute: false)', 'success');
    } else {
      this.log('Plugin: Should have safe defaults', 'warning');
    }

    // Check sub-agent cost controls
    const agentContent = await fs.readFile('.claude/agents/command-analyzer.yml', 'utf-8');

    if (agentContent.includes('cost_control:')) {
      this.log('Sub-agent: Has cost management', 'success');
    } else {
      this.log('Sub-agent: Should have cost management', 'warning');
    }
  }

  async runValidation() {
    console.log('🚀 Claude Code Standards Validator');
    console.log('==================================\n');

    try {
      await this.validateSkillStandards();
      await this.validatePluginStandards();
      await this.validateSubAgentStandards();
      await this.validateImplementationStandards();
      await this.validateDocumentationStandards();
      await this.validateGitHubStandards();
      await this.validateBestPractices();

      // Summary
      console.log('\n📊 Validation Summary');
      console.log('====================\n');

      console.log(`✅ Passed: ${this.passed.length}`);
      console.log(`⚠️  Warnings: ${this.warnings.length}`);
      console.log(`❌ Errors: ${this.errors.length}`);

      if (this.errors.length > 0) {
        console.log('\n❌ Errors that must be fixed:');
        this.errors.forEach(error => console.log(`   - ${error}`));
      }

      if (this.warnings.length > 0) {
        console.log('\n⚠️  Warnings to consider:');
        this.warnings.forEach(warning => console.log(`   - ${warning}`));
      }

      const totalIssues = this.errors.length + this.warnings.length;
      if (totalIssues === 0) {
        console.log('\n🎉 All standards validated successfully!');
        return true;
      } else {
        console.log(`\n📈 ${totalIssues} issues found (${this.errors.length} critical)`);
        return this.errors.length === 0;
      }

    } catch (error) {
      console.error('Validation failed with error:', error);
      return false;
    }
  }
}

// Run validation
const validator = new ClaudeStandardsValidator();
validator.runValidation().then(success => {
  process.exit(success ? 0 : 1);
});