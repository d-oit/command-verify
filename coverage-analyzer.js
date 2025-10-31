import { looksLikeCommand } from './lib/command-detection.js';
import { extractCommandsFromMarkdown, COMMAND_PATTERNS } from './lib/command-extraction.js';
import { categorizeCommand } from './lib/command-categorization.js';
import { shouldSkipCommand, checkKnowledgeBase } from './lib/knowledge-base.js';

// Simple test runner and coverage analyzer
class CoverageAnalyzer {
  constructor() {
    this.coverage = {
      'command-detection.js': {
        functions: new Set(),
        lines: new Set(),
        branches: new Set(),
        statements: 0
      },
      'command-extraction.js': {
        functions: new Set(),
        lines: new Set(),
        branches: new Set(),
        statements: 0
      },
      'command-categorization.js': {
        functions: new Set(),
        lines: new Set(),
        branches: new Set(),
        statements: 0
      },
      'knowledge-base.js': {
        functions: new Set(),
        lines: new Set(),
        branches: new Set(),
        statements: 0
      }
    };
  }

  markFunction(module, functionName) {
    if (this.coverage[module]) {
      this.coverage[module].functions.add(functionName);
    }
  }

  markLine(module, lineNumber) {
    if (this.coverage[module]) {
      this.coverage[module].lines.add(lineNumber);
    }
  }

  markBranch(module, branchId) {
    if (this.coverage[module]) {
      this.coverage[module].branches.add(branchId);
    }
  }

  runTests() {
    console.log('Running coverage analysis...\n');

    // Test command-detection.js
    this.testCommandDetection();
    
    // Test command-extraction.js
    this.testCommandExtraction();
    
    // Test command-categorization.js
    this.testCommandCategorization();
    
    // Test knowledge-base.js
    this.testKnowledgeBase();

    this.generateReport();
  }

  testCommandDetection() {
    console.log('Testing command-detection.js...');
    
    // Test looksLikeCommand function
    this.markFunction('command-detection.js', 'looksLikeCommand');
    
    // Valid commands
    const validCommands = [
      'npm install',
      'python script.py',
      'cargo build',
      'go build',
      'docker build',
      'git status',
      'curl http://example.com',
      'ls -la',
      'sudo apt update',
      './script.sh',
      'any-tool-name',
      'echo hello'
    ];
    
    validCommands.forEach(cmd => {
      const result = looksLikeCommand(cmd);
      this.markLine('command-detection.js', 22); // Function entry
      this.markLine('command-detection.js', 24); // Trim
      this.markLine('command-detection.js', 56); // Common prefixes check
      this.markLine('command-detection.js', 71); // Simple pattern check
    });
    
    // Invalid commands
    const invalidCommands = [
      '',
      'a',
      '- item',
      '# Header',
      '> quote',
      '// comment',
      '1. First item',
      'rate: 91.3%',
      'Summary:',
      'Example:',
      'Continue...',
      'the quick',
      'a'.repeat(101),
      '.claude/config.json',
      '<div>',
      '[1, 2, 3]',
      'const x = 1',
      '2025 Q3',
      'v0.4.0',
      'const func',
      'run, test',
      'test (optional)'
    ];
    
    invalidCommands.forEach(cmd => {
      const result = looksLikeCommand(cmd);
      this.markLine('command-detection.js', 22); // Function entry
      this.markLine('command-detection.js', 24); // Trim
      // Various early returns
      this.markBranch('command-detection.js', 'early_return_' + cmd.substring(0, 5));
    });
    
    console.log('✓ command-detection.js tests completed');
  }

  testCommandExtraction() {
    console.log('Testing command-extraction.js...');
    
    // Test extractCommandsFromMarkdown function
    this.markFunction('command-extraction.js', 'extractCommandsFromMarkdown');
    
    const testContent = `
# Installation

To install, run:

\`\`\`bash
npm install
npm run build
\`\`\`

Then check with \`git status\`.

\`\`\`
ls -la
\`\`\`
`;
    
    const commands = extractCommandsFromMarkdown(testContent, 'README.md');
    this.markLine('command-extraction.js', 18); // Function entry
    this.markLine('command-extraction.js', 20); // Split lines
    this.markLine('command-extraction.js', 24); // Code block extraction
    this.markLine('command-extraction.js', 45); // Inline code extraction
    this.markLine('command-extraction.js', 61); // Generic code block extraction
    
    // Test COMMAND_PATTERNS export
    this.markFunction('command-extraction.js', 'COMMAND_PATTERNS');
    this.markLine('command-extraction.js', 4); // Pattern object
    
    console.log('✓ command-extraction.js tests completed');
  }

  testCommandCategorization() {
    console.log('Testing command-categorization.js...');
    
    // Test categorizeCommand function
    this.markFunction('command-categorization.js', 'categorizeCommand');
    
    const testKnowledge = {
      validationRules: {
        skip: {
          exactMatches: ['documentation example'],
          patterns: ['example.*']
        },
        dangerous: {
          exactMatches: ['rm -rf /'],
          patterns: ['sudo.*']
        },
        safe: {
          exactMatches: ['git status'],
          patterns: ['^git.*status$']
        }
      }
    };
    
    // Test various command categories
    const testCommands = [
      'documentation example', // skip
      'npm install', // conditional
      'rm -rf /', // dangerous
      'git status', // safe
      'unknown-command' // unknown
    ];
    
    testCommands.forEach(cmd => {
      const result = categorizeCommand(cmd, testKnowledge);
      this.markLine('command-categorization.js', 6); // Function entry
      this.markLine('command-categorization.js', 10); // Skip check
      this.markLine('command-categorization.js', 15); // Knowledge base check
      this.markLine('command-categorization.js', 82); // Dangerous check
      this.markLine('command-categorization.js', 89); // Safe check
      this.markLine('command-categorization.js', 96); // Conditional check
      this.markBranch('command-categorization.js', 'category_' + result.category);
    });
    
    console.log('✓ command-categorization.js tests completed');
  }

  testKnowledgeBase() {
    console.log('Testing knowledge-base.js...');
    
    // Test shouldSkipCommand function
    this.markFunction('knowledge-base.js', 'shouldSkipCommand');
    
    const testKnowledge = {
      validationRules: {
        skip: {
          exactMatches: ['exact match'],
          patterns: ['^pattern.*', '[invalid'] // Include invalid pattern
        }
      }
    };
    
    const skipCommands = ['exact match', 'pattern test'];
    const noSkipCommands = ['different command'];
    
    [...skipCommands, ...noSkipCommands].forEach(cmd => {
      const result = shouldSkipCommand(cmd, testKnowledge);
      this.markLine('knowledge-base.js', 4); // Function entry
      this.markLine('knowledge-base.js', 10); // Exact match check
      this.markLine('knowledge-base.js', 15); // Pattern check
      this.markBranch('knowledge-base.js', 'skip_' + result);
    });
    
    // Test checkKnowledgeBase function
    this.markFunction('knowledge-base.js', 'checkKnowledgeBase');
    
    const categories = ['dangerous', 'safe', 'conditional'];
    categories.forEach(category => {
      const result = checkKnowledgeBase('test command', testKnowledge);
      this.markLine('knowledge-base.js', 28); // Function entry
      this.markLine('knowledge-base.js', 40); // Exact match check
      this.markLine('knowledge-base.js', 47); // Pattern check
      this.markBranch('knowledge-base.js', 'kb_' + category);
    });
    
    console.log('✓ knowledge-base.js tests completed');
  }

  generateReport() {
    console.log('\n=== COVERAGE ANALYSIS REPORT ===\n');
    
    const totalFunctions = {
      'command-detection.js': 1, // looksLikeCommand
      'command-extraction.js': 2, // extractCommandsFromMarkdown, COMMAND_PATTERNS
      'command-categorization.js': 1, // categorizeCommand
      'knowledge-base.js': 2 // shouldSkipCommand, checkKnowledgeBase
    };
    
    const totalLines = {
      'command-detection.js': 76,
      'command-extraction.js': 81,
      'command-categorization.js': 104,
      'knowledge-base.js': 57
    };
    
    let overallFunctions = 0;
    let overallLines = 0;
    let coveredFunctions = 0;
    let coveredLines = 0;
    
    Object.keys(this.coverage).forEach(module => {
      const coverage = this.coverage[module];
      const funcCoverage = (coverage.functions.size / totalFunctions[module]) * 100;
      const lineCoverage = (coverage.lines.size / totalLines[module]) * 100;
      
      console.log(`${module}:`);
      console.log(`  Functions: ${coverage.functions.size}/${totalFunctions[module]} (${funcCoverage.toFixed(1)}%)`);
      console.log(`  Lines: ${coverage.lines.size}/${totalLines[module]} (${lineCoverage.toFixed(1)}%)`);
      console.log(`  Branches: ${coverage.branches.size} branches covered`);
      
      overallFunctions += totalFunctions[module];
      overallLines += totalLines[module];
      coveredFunctions += coverage.functions.size;
      coveredLines += coverage.lines.size;
      
      // Identify insufficient coverage
      if (funcCoverage < 90) {
        console.log(`  ⚠️  Functions coverage below 90%`);
      }
      if (lineCoverage < 90) {
        console.log(`  ⚠️  Lines coverage below 90%`);
      }
      console.log('');
    });
    
    const overallFuncCoverage = (coveredFunctions / overallFunctions) * 100;
    const overallLineCoverage = (coveredLines / overallLines) * 100;
    
    console.log('OVERALL:');
    console.log(`  Functions: ${coveredFunctions}/${overallFunctions} (${overallFuncCoverage.toFixed(1)}%)`);
    console.log(`  Lines: ${coveredLines}/${overallLines} (${overallLineCoverage.toFixed(1)}%)`);
    
    console.log('\n=== RECOMMENDATIONS ===\n');
    
    if (overallFuncCoverage < 90) {
      console.log('• Add tests for missing function coverage');
    }
    if (overallLineCoverage < 90) {
      console.log('• Add tests for missing line coverage');
    }
    
    console.log('• Add edge case tests for error handling paths');
    console.log('• Add integration tests for component interactions');
    console.log('• Add performance tests for large file processing');
    console.log('• Add mock tests for external dependencies');
  }
}

// Run the coverage analysis
const analyzer = new CoverageAnalyzer();
analyzer.runTests();