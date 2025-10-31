# Command Detection Expert Skills

## analyze_command_detection_patterns

**Description**: Analyzes and improves command detection patterns across the codebase, identifying areas for better accuracy and performance.

**Input Schema**:
- scope (string): Area to analyze ('patterns', 'false-positives', 'performance', 'integration')
- targetFiles (array): Specific files to analyze (optional, defaults to all relevant files)
- testCoverage (boolean): Whether to include test coverage analysis (default: true)

**Implementation Sequence**:
1. Read files matching pattern: `lib/command-detection.js`, `lib/command-extraction.js`, `__tests__/command-detection.test.js`
2. Analyze current pattern effectiveness and edge cases
3. Identify false positive/negative patterns
4. Validate integration with extraction and categorization
5. Generate improvement recommendations

**Output Format**:
- Current pattern analysis with effectiveness metrics
- False positive/negative identification with examples
- Performance bottleneck analysis
- Recommended pattern improvements
- Integration validation report

**When to Use**:
- When command detection accuracy needs improvement
- Adding support for new command types
- Debugging detection issues
- Performance optimization of detection logic

**GOAP Integration**:
- Action: analyze_detection_patterns
- Preconditions: codebase_accessible=true, scope_defined=true
- Effects: patterns_analyzed=true, improvements_identified=true
- Cost: 4

## validate_command_detection_tests

**Description**: Validates test coverage and quality for command detection functionality, ensuring comprehensive edge case handling.

**Input Schema**:
- testType (enum): Type of test validation ['unit', 'integration', 'edge-case', 'performance']
- coverageThreshold (number): Minimum coverage percentage (default: 90)
- includeBenchmarks (boolean): Include performance benchmarking (default: true)

**Implementation Sequence**:
1. Execute test suite and collect coverage metrics
2. Analyze test cases for completeness
3. Identify missing edge cases and scenarios
4. Validate mock implementations for accuracy
5. Generate test improvement recommendations

**Output Format**:
- Test coverage report with line/branch/function metrics
- Missing test case identification
- Mock validation results
- Performance benchmark results
- Test quality improvement suggestions

**When to Use**:
- Before adding new detection patterns
- When test coverage drops below thresholds
- During code review of detection changes
- For quality assurance before releases

**GOAP Integration**:
- Action: validate_detection_tests
- Preconditions: test_suite_accessible=true, coverage_threshold_defined=true
- Effects: tests_validated=true, coverage_analyzed=true
- Cost: 3

## optimize_regex_performance

**Description**: Optimizes regular expression patterns used in command detection for better performance and accuracy.

**Input Schema**:
- patternType (enum): Type of regex to optimize ['command', 'exclusion', 'extraction']
- benchmarkSize (number): Size of test dataset for benchmarking (default: 10000)
- targetPerformance (number): Target execution time in milliseconds (default: 100)

**Implementation Sequence**:
1. Profile current regex performance with test dataset
2. Identify optimization opportunities (backtracking, alternation, grouping)
3. Implement optimized regex patterns
4. Validate accuracy is maintained
5. Benchmark and compare performance improvements

**Output Format**:
- Current performance baseline with metrics
- Optimized regex patterns with explanations
- Performance improvement percentages
- Accuracy validation results
- Implementation recommendations

**When to Use**:
- When command detection is slow on large files
- Before adding complex regex patterns
- During performance optimization cycles
- When scaling to larger codebases

**GOAP Integration**:
- Action: optimize_regex_performance
- Preconditions: regex_patterns_accessible=true, benchmark_data_available=true
- Effects: performance_optimized=true, accuracy_maintained=true
- Cost: 5

## detect_platform_specific_commands

**Description**: Extends command detection to handle platform-specific command patterns and variations.

**Input Schema**:
- platforms (array): Target platforms ['windows', 'linux', 'macos', 'cross-platform']
- commandTypes (array): Types of commands to analyze ['cli', 'powershell', 'batch', 'shell']
- includeAliases (boolean): Include command aliases and variations (default: true)

**Implementation Sequence**:
1. Analyze current platform support in detection patterns
2. Identify platform-specific command variations
3. Add support for platform-specific executables and paths
4. Test cross-platform compatibility
5. Document platform-specific considerations

**Output Format**:
- Platform support analysis with gaps identified
- New pattern implementations for each platform
- Cross-platform compatibility matrix
- Testing results for platform variations
- Documentation updates needed

**When to Use**:
- When adding support for new platforms
- Debugging platform-specific detection issues
- Before cross-platform releases
- When users report platform-specific problems

**GOAP Integration**:
- Action: detect_platform_commands
- Preconditions: platform_requirements_defined=true, existing_patterns_analyzed=true
- Effects: platform_support_extended=true, compatibility_validated=true
- Cost: 4

## integrate_custom_command_patterns

**Description**: Integrates custom command patterns from knowledge base or user configuration into the detection system.

**Input Schema**:
- source (enum): Source of custom patterns ['knowledge-base', 'config-file', 'user-input']
- validationLevel (enum): Strictness of validation ['strict', 'moderate', 'lenient']
- mergeStrategy (enum): How to merge with existing patterns ['override', 'append', 'merge']

**Implementation Sequence**:
1. Load custom patterns from specified source
2. Validate pattern syntax and security
3. Resolve conflicts with existing patterns
4. Apply merge strategy
5. Test integration with existing detection pipeline

**Output Format**:
- Custom pattern analysis and validation
- Conflict resolution results
- Integration success/failure report
- Updated pattern documentation
- Testing results for integrated patterns

**When to Use**:
- When adding project-specific command patterns
- Integrating user customizations
- Updating from knowledge base changes
- During configuration management

**GOAP Integration**:
- Action: integrate_custom_patterns
- Preconditions: custom_patterns_available=true, validation_level_defined=true
- Effects: patterns_integrated=true, conflicts_resolved=true
- Cost: 3