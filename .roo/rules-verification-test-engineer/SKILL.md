# Verification Test Engineer Skills

## design_comprehensive_test_suite

**Description**: Designs comprehensive test suites for command verification components, ensuring complete coverage and quality assurance.

**Input Schema**:
- component (enum): Component to test ['detection', 'extraction', 'categorization', 'cache', 'integration']
- testLevel (enum): Test level ['unit', 'integration', 'e2e', 'performance']
- coverageTarget (number): Target coverage percentage (default: 90)
- includeMocks (boolean): Include mock design (default: true)

**Implementation Sequence**:
1. Analyze component architecture and interfaces
2. Identify test scenarios and edge cases
3. Design test structure and organization
4. Create mock implementations for dependencies
5. Generate test files with comprehensive coverage

**Output Format**:
- Test suite structure with file organization
- Test case inventory with coverage analysis
- Mock implementations for external dependencies
- Performance benchmark definitions
- Test data fixtures and sample data

**When to Use**:
- When creating new test suites for components
- During feature development to ensure test coverage
- When refactoring existing components
- For quality assurance before releases

**GOAP Integration**:
- Action: design_test_suite
- Preconditions: component_analyzed=true, test_level_defined=true
- Effects: test_suite_designed=true, coverage_planned=true
- Cost: 5

## validate_test_coverage

**Description**: Validates and analyzes test coverage across all verification components, identifying gaps and improvement opportunities.

**Input Schema**:
- coverageType (enum): Type of coverage analysis ['current', 'trend', 'comparative']
- threshold (number): Minimum acceptable coverage percentage (default: 90)
- includeBranches (boolean): Include branch coverage analysis (default: true)
- generateReport (boolean): Generate detailed coverage report (default: true)

**Implementation Sequence**:
1. Execute test suite with coverage collection
2. Analyze coverage metrics across all components
3. Identify uncovered code paths and edge cases
4. Compare against historical coverage trends
5. Generate improvement recommendations

**Output Format**:
- Coverage metrics dashboard with detailed breakdown
- Uncovered code analysis with prioritization
- Historical trend analysis and predictions
- Coverage improvement recommendations
- Detailed HTML/JSON coverage reports

**When to Use**:
- During code reviews to ensure adequate testing
- Before releases to validate quality gates
- When coverage drops below thresholds
- For continuous integration quality monitoring

**GOAP Integration**:
- Action: validate_test_coverage
- Preconditions: test_suite_accessible=true, coverage_threshold_defined=true
- Effects: coverage_validated=true, gaps_identified=true
- Cost: 3

## create_mock_strategies

**Description**: Creates comprehensive mock strategies for external dependencies in verification testing, ensuring isolated and reproducible test environments.

**Input Schema**:
- dependency (enum): External dependency to mock ['fs', 'git', 'glob', 'child_process']
- mockType (enum): Type of mocking strategy ['stub', 'spy', 'fake', 'simulation'])
- complexity (enum): Mock complexity level ['simple', 'realistic', 'comprehensive']
- includeErrors (boolean): Include error scenario simulation (default: true)

**Implementation Sequence**:
1. Analyze dependency interface and usage patterns
2. Design mock strategy based on test requirements
3. Implement mock with realistic behavior simulation
4. Add error scenarios and edge case handling
5. Validate mock accuracy and performance

**Output Format**:
- Mock implementation with full API coverage
- Error scenario definitions and test cases
- Performance characteristics and benchmarks
- Usage documentation and examples
- Integration with existing test framework

**When to Use**:
- When writing tests that depend on external systems
- For creating reproducible test environments
- When testing error conditions and edge cases
- During CI/CD pipeline setup

**GOAP Integration**:
- Action: create_mock_strategies
- Preconditions: dependency_analyzed=true, mock_type_defined=true
- Effects: mocks_created=true, isolation_achieved=true
- Cost: 4

## performance_benchmark_tests

**Description**: Creates and executes performance benchmark tests for verification components, ensuring scalability and efficiency requirements are met.

**Input Schema**:
- component (enum): Component to benchmark ['detection', 'extraction', 'categorization', 'cache', 'pipeline'])
- benchmarkType (enum): Type of benchmark ['throughput', 'latency', 'memory', 'scalability'])
- datasetSize (number): Size of test dataset (default: 1000)
- targetMetrics (object): Performance targets to validate against

**Implementation Sequence**:
1. Define performance benchmarks and success criteria
2. Create test datasets of varying sizes
3. Execute performance tests with measurement
4. Analyze results against targets and baselines
5. Generate performance reports and recommendations

**Output Format**:
- Performance benchmark results with detailed metrics
- Comparison against targets and historical data
- Bottleneck analysis and optimization opportunities
- Scalability analysis with growth projections
- Performance regression detection

**When to Use**:
- When optimizing component performance
- Before scaling to larger deployments
- During performance regression testing
- For capacity planning and resource allocation

**GOAP Integration**:
- Action: performance_benchmark
- Preconditions: component_accessible=true, benchmarks_defined=true
- Effects: performance_measured=true, bottlenecks_identified=true
- Cost: 5

## debug_test_failures

**Description**: Systematically debugs test failures in verification components, identifying root causes and providing fix recommendations.

**Input Schema**:
- failureType (enum): Type of test failure ['assertion', 'timeout', 'error', 'flaky'])
- scope (enum): Debug scope ['individual', 'suite', 'integration', 'environmental'])
- diagnosticLevel (enum): Level of diagnostic detail ['basic', 'detailed', 'comprehensive'])
- autoFix (boolean): Attempt automatic fix suggestions (default: true)

**Implementation Sequence**:
1. Analyze test failure patterns and error messages
2. Examine test environment and dependencies
3. Isolate failure to specific components or conditions
4. Identify root causes and contributing factors
5. Generate fix recommendations and preventive measures

**Output Format**:
- Root cause analysis with failure classification
- Debugging logs and diagnostic information
- Fix recommendations with code examples
- Preventive measures for future failures
- Test improvement suggestions

**When to Use**:
- When tests are failing and causes are unclear
- For debugging flaky or intermittent test failures
- During CI/CD pipeline failure investigation
- When troubleshooting test environment issues

**GOAP Integration**:
- Action: debug_test_failures
- Preconditions: failure_logs_available=true, diagnostic_level_defined=true
- Effects: root_cause_identified=true, fixes_recommended=true
- Cost: 4

## automate_ci_cd_testing

**Description**: Designs and implements automated testing pipelines for CI/CD integration, ensuring continuous quality assurance.

**Input Schema**:
- platform (enum): CI/CD platform ['github-actions', 'gitlab-ci', 'jenkins', 'azure-devops'])
- pipelineType (enum): Type of pipeline ['pull-request', 'merge', 'release', 'scheduled'])
- qualityGates (array): Quality gate definitions ['coverage', 'performance', 'security', 'linting'])
- notificationLevel (enum): Failure notification level ['silent', 'team', 'organization']

**Implementation Sequence**:
1. Analyze project structure and testing requirements
2. Design CI/CD pipeline with appropriate stages
3. Configure quality gates and failure handling
4. Set up notifications and reporting
5. Validate pipeline execution and performance

**Output Format**:
- CI/CD pipeline configuration files
- Quality gate definitions and thresholds
- Notification and reporting setup
- Pipeline documentation and runbooks
- Performance monitoring and optimization

**When to Use**:
- When setting up new CI/CD pipelines
- For improving existing pipeline quality
- During DevOps process optimization
- When automating quality assurance workflows

**GOAP Integration**:
- Action: automate_cicd_testing
- Preconditions: platform_selected=true, quality_gates_defined=true
- Effects: pipeline_automated=true, quality_gates_implemented=true
- Cost: 6

## analyze_test_quality_metrics

**Description**: Analyzes test quality metrics and provides insights for improving test effectiveness and maintainability.

**Input Schema**:
- metricType (enum): Type of quality analysis ['complexity', 'maintainability', 'effectiveness', 'trend'])
- timeRange (string): Analysis time range (default: '30d')
- includeRecommendations (boolean): Include improvement recommendations (default: true)
- exportFormat (enum): Output format ['dashboard', 'report', 'json', 'csv']

**Implementation Sequence**:
1. Collect test execution data and metrics
2. Analyze test quality indicators and trends
3. Identify areas for improvement and optimization
4. Generate insights and recommendations
5. Create visualizations and reports

**Output Format**:
- Test quality dashboard with key metrics
- Trend analysis and predictive insights
- Improvement recommendations with priorities
- Quality score calculations and benchmarks
- Actionable insights for test optimization

**When to Use**:
- During regular quality assessment cycles
- When test quality metrics are declining
- For test process optimization initiatives
- During team performance reviews

**GOAP Integration**:
- Action: analyze_test_quality
- Preconditions: test_data_available=true, metric_type_defined=true
- Effects: quality_analyzed=true, insights_generated=true
- Cost: 4