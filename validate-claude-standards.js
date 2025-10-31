#!/usr/bin/env node

/**
 * Claude Code Standards Validator
 *
 * Validates the command-verify project against official Claude Code documentation standards:
 * - https://docs.claude.com/en/docs/claude-code/skills
 * - https://docs.claude.com/en/docs/claude-code/plugin-marketplaces
 *
 * Updated for current standards (SKILL.md format, plugin.json, marketplace.json)
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
      info: 'ℹ️ ',
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

  async validateMarkdownYAMLFrontmatter(filePath, requiredFields, description) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');

      // Check for YAML frontmatter delimiters
      if (!content.startsWith('---')) {
        this.log(`${description}: Missing YAML frontmatter start delimiter`, 'error');
        return false;
      }

      const endDelimiterIndex = content.indexOf('---', 3);
      if (endDelimiterIndex === -1) {
        this.log(`${description}: Missing YAML frontmatter end delimiter`, 'error');
        return false;
      }

      const frontmatter = content.substring(0, endDelimiterIndex + 3);

      // Check for required fields
      for (const field of requiredFields) {
        if (!frontmatter.includes(`${field}:`)) {
          this.log(`${description}: Missing required field '${field}'`, 'error');
        } else {
          this.log(`${description}: Has required field '${field}'`, 'success');
        }
      }

      return true;
    } catch (error) {
      this.log(`${description}: Failed to read file - ${error.message}`, 'error');
      return false;
    }
  }

  async validateJSONFile(filePath, requiredFields, description) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const json = JSON.parse(content);

      this.log(`${description}: Valid JSON structure`, 'success');

      // Check for required fields
      for (const field of requiredFields) {
        if (!(field in json)) {
          this.log(`${description}: Missing required field '${field}'`, 'error');
        } else {
          this.log(`${description}: Has field '${field}'`, 'success');
        }
      }

      return json;
    } catch (error) {
      this.log(`${description}: Failed to validate - ${error.message}`, 'error');
      return null;
    }
  }

  async validateSkillStandards() {
    console.log('\n🔍 Validating Project Skills (.claude/skills/)');
    console.log('==============================================\n');

    const skills = [
      { path: '.claude/skills/command-verify/SKILL.md', name: 'command-verify' },
      { path: '.claude/skills/test-skill/SKILL.md', name: 'test-skill' },
    ];

    for (const skill of skills) {
      const exists = await this.validateFileExists(skill.path, `Skill: ${skill.name}`);

      if (exists) {
        // Validate SKILL.md format
        const requiredFields = ['name', 'description'];
        const optionalFields = ['allowed-tools'];

        await this.validateMarkdownYAMLFrontmatter(
          skill.path,
          requiredFields,
          `Skill ${skill.name}`,
        );

        // Read and validate content
        try {
          const content = await fs.readFile(skill.path, 'utf-8');

          // Check for lowercase hyphenated name
          if (content.includes(`name: ${skill.name}`)) {
            this.log(`Skill ${skill.name}: Uses correct kebab-case naming`, 'success');
          } else {
            this.log(`Skill ${skill.name}: Name should be kebab-case`, 'warning');
          }

          // Check description includes when to use
          if (content.includes('Use when') || content.includes('when asked to')) {
            this.log(`Skill ${skill.name}: Description includes usage context`, 'success');
          } else {
            this.log(`Skill ${skill.name}: Description should include when to use it`, 'warning');
          }

          // Check for allowed-tools if present
          if (content.includes('allowed-tools:')) {
            this.log(`Skill ${skill.name}: Has tool restrictions defined`, 'success');
          }

          // Check for supporting documentation
          if (content.includes('## Overview') || content.includes('## Instructions')) {
            this.log(`Skill ${skill.name}: Has supporting documentation`, 'success');
          } else {
            this.log(`Skill ${skill.name}: Should have detailed instructions`, 'warning');
          }

        } catch (error) {
          this.log(`Skill ${skill.name}: Content validation failed - ${error.message}`, 'error');
        }
      }
    }
  }

  async validatePluginStandards() {
    console.log('\n🔌 Validating Plugin (command-executor/.claude-plugin/)');
    console.log('====================================================\n');

    const pluginJsonPath = 'command-executor/.claude-plugin/plugin.json';
    const exists = await this.validateFileExists(pluginJsonPath, 'Plugin manifest');

    if (exists) {
      const requiredFields = ['name', 'description', 'version', 'author'];
      const recommendedFields = ['homepage', 'repository', 'license', 'keywords', 'category', 'components'];

      const json = await this.validateJSONFile(pluginJsonPath, requiredFields, 'Plugin manifest');

      if (json) {
        // Check recommended fields
        for (const field of recommendedFields) {
          if (!(field in json)) {
            this.log(`Plugin manifest: Missing recommended field '${field}'`, 'warning');
          } else {
            this.log(`Plugin manifest: Has recommended field '${field}'`, 'success');
          }
        }

        // Validate components structure
        if (json.components && json.components.skills) {
          this.log(`Plugin manifest: Declares skills: ${json.components.skills.join(', ')}`, 'success');
        } else {
          this.log('Plugin manifest: Should declare bundled components', 'warning');
        }

        // Validate plugin skill exists
        const pluginSkillPath = 'command-executor/skills/command-executor/SKILL.md';
        const skillExists = await this.validateFileExists(pluginSkillPath, 'Plugin skill');

        if (skillExists) {
          await this.validateMarkdownYAMLFrontmatter(
            pluginSkillPath,
            ['name', 'description'],
            'Plugin skill',
          );
        }
      }
    }
  }

  async validateMarketplaceStandards() {
    console.log('\n🏪 Validating Marketplace (.claude-plugin/marketplace.json)');
    console.log('=======================================================\n');

    const marketplacePath = '.claude-plugin/marketplace.json';
    const exists = await this.validateFileExists(marketplacePath, 'Marketplace catalog');

    if (exists) {
      const requiredFields = ['name', 'owner', 'plugins'];
      const json = await this.validateJSONFile(marketplacePath, requiredFields, 'Marketplace');

      if (json) {
        // Validate plugins array
        if (!Array.isArray(json.plugins)) {
          this.log('Marketplace: plugins field should be an array', 'error');
        } else {
          this.log(`Marketplace: Contains ${json.plugins.length} plugin(s)`, 'success');

          // Validate each plugin entry
          json.plugins.forEach((plugin, index) => {
            const pluginRequiredFields = ['name', 'source', 'description', 'version'];

            pluginRequiredFields.forEach(field => {
              if (!(field in plugin)) {
                this.log(`Marketplace plugin ${index + 1}: Missing '${field}'`, 'error');
              } else {
                this.log(`Marketplace plugin ${index + 1} (${plugin.name}): Has '${field}'`, 'success');
              }
            });

            // Check source format
            if (plugin.source) {
              if (typeof plugin.source === 'string') {
                this.log(`Marketplace plugin ${plugin.name}: Has relative path source`, 'success');
              } else if (plugin.source.source && plugin.source.repo) {
                this.log(`Marketplace plugin ${plugin.name}: Has GitHub source`, 'success');
              }
            }
          });
        }
      }
    }
  }

  async validateAgentStandards() {
    console.log('\n🤖 Validating Sub-Agent (.claude/agents/)');
    console.log('========================================\n');

    const agentPath = '.claude/agents/command-analyzer.md';
    const exists = await this.validateFileExists(agentPath, 'Sub-agent definition');

    if (exists) {
      const requiredFields = ['name', 'description'];
      const recommendedFields = ['tools', 'model'];

      await this.validateMarkdownYAMLFrontmatter(agentPath, requiredFields, 'Sub-agent');

      // Check content
      try {
        const content = await fs.readFile(agentPath, 'utf-8');

        // Check for tools (not allowed-tools for agents)
        if (content.includes('tools:')) {
          this.log('Sub-agent: Has tools configuration', 'success');
        } else {
          this.log('Sub-agent: Should specify tools (not allowed-tools)', 'warning');
        }

        // Check for model specification
        if (content.includes('model:')) {
          this.log('Sub-agent: Specifies model for cost control', 'success');
        } else {
          this.log('Sub-agent: Should specify model (e.g., haiku for efficiency)', 'warning');
        }

        // Check for clear instructions
        if (content.includes('## Your Role') || content.includes('## Instructions')) {
          this.log('Sub-agent: Has clear instructions for autonomous operation', 'success');
        }

      } catch (error) {
        this.log(`Sub-agent: Content validation failed - ${error.message}`, 'error');
      }
    }
  }

  async validateSlashCommands() {
    console.log('\n⚡ Validating Slash Commands (.claude/commands/)');
    console.log('==============================================\n');

    const commands = [
      'verify.md',
      'verify-force.md',
      'verify-stats.md',
    ];

    for (const cmd of commands) {
      const cmdPath = `.claude/commands/${cmd}`;
      const exists = await this.validateFileExists(cmdPath, `Slash command: /${cmd.replace('.md', '')}`);

      if (exists) {
        await this.validateMarkdownYAMLFrontmatter(
          cmdPath,
          ['description'],
          `Command ${cmd}`,
        );

        // Check for allowed-tools if restricted
        try {
          const content = await fs.readFile(cmdPath, 'utf-8');
          if (content.includes('allowed-tools:')) {
            this.log(`Command ${cmd}: Has tool restrictions`, 'success');
          }
        } catch (error) {
          this.log(`Command ${cmd}: Failed to read - ${error.message}`, 'error');
        }
      }
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
      const requiredFields = ['name', 'version', 'description', 'type', 'main', 'scripts'];
      const json = await this.validateJSONFile('package.json', requiredFields, 'Package.json');

      if (json) {
        // Check for required scripts
        const requiredScripts = ['verify', 'verify:force', 'verify:stats'];
        requiredScripts.forEach(script => {
          if (json.scripts && json.scripts[script]) {
            this.log(`Package.json: Has '${script}' script`, 'success');
          } else {
            this.log(`Package.json: Missing '${script}' script`, 'error');
          }
        });

        // Check for dependencies
        if (json.dependencies && json.dependencies.glob) {
          this.log('Package.json: Has required dependencies', 'success');
        } else {
          this.log('Package.json: Missing glob dependency', 'warning');
        }
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
          'Architecture',
          'Plugin Installation',
          'Configuration',
          'File Structure',
        ];

        for (const section of essentialSections) {
          if (readmeContent.includes(`# ${section}`) || readmeContent.includes(`## ${section}`)) {
            this.log(`README: Has '${section}' section`, 'success');
          } else {
            this.log(`README: Missing '${section}' section`, 'warning');
          }
        }

        // Check for installation instructions
        if (readmeContent.includes('/plugin marketplace add') ||
            readmeContent.includes('Installing from Marketplace')) {
          this.log('README: Has plugin installation instructions', 'success');
        }

      } catch (error) {
        this.log(`README validation failed: ${error.message}`, 'error');
      }
    }

    // Check for CONTRIBUTING
    await this.validateFileExists('CONTRIBUTING.md', 'Contributing guidelines');

    // Check for LICENSE
    await this.validateFileExists('LICENSE', 'License file');
  }

  async validateKnowledgeBase() {
    console.log('\n🧠 Validating Knowledge Base');
    console.log('===========================\n');

    const knowledgePath = '.claude/knowledge.json';
    const exists = await this.validateFileExists(knowledgePath, 'Knowledge base');

    if (exists) {
      try {
        const content = await fs.readFile(knowledgePath, 'utf-8');
        const json = JSON.parse(content);

        this.log('Knowledge base: Valid JSON structure', 'success');

        // Check for standard sections
        const expectedSections = ['corrections', 'patterns', 'validationRules', 'learningLog'];

        expectedSections.forEach(section => {
          if (section in json) {
            this.log(`Knowledge base: Has '${section}' section`, 'success');
          }
        });

      } catch (error) {
        this.log(`Knowledge base: Validation failed - ${error.message}`, 'error');
      }
    }
  }

  async validateFileStructure() {
    console.log('\n📁 Validating File Structure');
    console.log('===========================\n');

    const expectedStructure = {
      '.claude/commands/': 'Slash commands directory',
      '.claude/skills/': 'Project skills directory',
      '.claude/agents/': 'Sub-agents directory',
      '.claude/knowledge.json': 'Self-learning knowledge base',
      '.claude-plugin/marketplace.json': 'Marketplace catalog',
      'command-executor/.claude-plugin/': 'Plugin directory',
      'scripts/': 'Implementation scripts',
      '.cache/': 'Validation cache',
    };

    for (const [path, description] of Object.entries(expectedStructure)) {
      try {
        await fs.access(path);
        this.log(`${description}: ${path}`, 'success');
      } catch {
        if (path === '.cache/') {
          this.log(`${description}: ${path} (created on first run)`, 'info');
        } else {
          this.log(`${description}: Missing ${path}`, 'error');
        }
      }
    }
  }

  async runValidation() {
    console.log('🚀 Claude Code Standards Validator');
    console.log('==================================\n');
    console.log('Validating against official Claude Code documentation');
    console.log('Updated for current standards (SKILL.md, plugin.json, marketplace.json)\n');

    try {
      await this.validateSkillStandards();
      await this.validatePluginStandards();
      await this.validateMarketplaceStandards();
      await this.validateAgentStandards();
      await this.validateSlashCommands();
      await this.validateImplementationStandards();
      await this.validateDocumentationStandards();
      await this.validateKnowledgeBase();
      await this.validateFileStructure();

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

      if (this.warnings.length > 0 && this.warnings.length <= 10) {
        console.log('\n⚠️  Warnings to consider:');
        this.warnings.forEach(warning => console.log(`   - ${warning}`));
      } else if (this.warnings.length > 10) {
        console.log(`\n⚠️  ${this.warnings.length} warnings found (showing first 10):`);
        this.warnings.slice(0, 10).forEach(warning => console.log(`   - ${warning}`));
        console.log(`   ... and ${this.warnings.length - 10} more`);
      }

      const totalIssues = this.errors.length + this.warnings.length;
      if (totalIssues === 0) {
        console.log('\n🎉 All standards validated successfully!');
        console.log('Your project is 100% compliant with Claude Code standards.');
        return true;
      } else {
        console.log(`\n📈 ${totalIssues} issues found (${this.errors.length} critical, ${this.warnings.length} warnings)`);

        if (this.errors.length === 0) {
          console.log('✓ No critical errors - project is compliant!');
          return true;
        } else {
          console.log('✗ Critical errors found - please fix before proceeding');
          return false;
        }
      }

    } catch (error) {
      console.error('\n💥 Validation failed with error:', error);
      console.error(error.stack);
      return false;
    }
  }
}

// Run validation
const validator = new ClaudeStandardsValidator();
validator.runValidation().then(success => {
  process.exit(success ? 0 : 1);
});
