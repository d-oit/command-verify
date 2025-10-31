# Command Categorization Specialist Skills

## analyze_safety_classification_rules

**Description**: Analyzes and improves command safety classification rules, ensuring accurate risk assessment across different command types.

**Input Schema**:
- category (enum): Safety category to analyze ['dangerous', 'conditional', 'safe', 'skip', 'unknown']
- scope (enum): Analysis scope ['patterns', 'knowledge-base', 'integration', 'performance']
- includeTestData (boolean): Include test case analysis (default: true)

**Implementation Sequence**:
1. Read classification rules from `lib/command-categorization.js`
2. Analyze pattern effectiveness and coverage
3. Review knowledge base integration and priority handling
4. Test classification accuracy against known command sets
5. Generate improvement recommendations

**Output Format**:
- Current rule analysis with effectiveness metrics
- Pattern coverage gaps and overlaps
- Knowledge base integration validation
- Test case analysis with misclassifications
- Recommended rule improvements and additions

**When to Use**:
- When classification accuracy needs improvement
- Adding new safety categories or risk levels
- Debugging misclassified commands
- Analyzing security implications of new tools

**GOAP Integration**:
- Action: analyze_safety_rules
- Preconditions: classification_rules_accessible=true, category_defined=true
- Effects: rules_analyzed=true, improvements_identified=true
- Cost: 4

## validate_confidence_scoring

**Description**: Validates and optimizes confidence scoring algorithms for command categorization, ensuring reliable risk assessment.

**Input Schema**:
- scoringModel (enum): Scoring model to validate ['current', 'proposed', 'hybrid']
- testDataset (string): Path to test dataset (optional, uses built-in dataset)
- targetAccuracy (number): Target accuracy percentage (default: 95)

**Implementation Sequence**:
1. Analyze current confidence scoring implementation
2. Test against known command classifications
3. Identify scoring inconsistencies and edge cases
4. Optimize scoring weights and factors
5. Validate improvements with test dataset

**Output Format**:
- Current scoring model analysis
- Accuracy metrics and confidence distribution
- Identified scoring issues and inconsistencies
- Optimized scoring model with improvements
- Validation results and performance metrics

**When to Use**:
- When confidence scores seem unreliable
- Before deploying new classification rules
- During quality assurance cycles
- When users report classification confidence issues

**GOAP Integration**:
- Action: validate_confidence_scoring
- Preconditions: scoring_model_accessible=true, test_data_available=true
- Effects: scoring_validated=true, accuracy_optimized=true
- Cost: 5

## integrate_knowledge_base_rules

**Description**: Integrates and manages knowledge base rules for command categorization, ensuring proper priority and conflict resolution.

**Input Schema**:
- source (enum): Knowledge base source ['file', 'database', 'api']
- mergeStrategy (enum): How to merge rules ['override', 'merge', 'append']
- validationLevel (enum): Rule validation strictness ['strict', 'moderate', 'lenient']

**Implementation Sequence**:
1. Load knowledge base from specified source
2. Validate rule syntax and security
3. Resolve conflicts with existing rules
4. Apply priority hierarchy and merge strategy
5. Test integration with classification pipeline

**Output Format**:
- Knowledge base rule analysis and validation
- Conflict resolution results and decisions
- Updated rule hierarchy with priorities
- Integration success/failure report
- Testing results for new rule combinations

**When to Use**:
- When updating knowledge base from user corrections
- Adding project-specific classification rules
- Debugging knowledge base integration issues
- During configuration management and deployment

**GOAP Integration**:
- Action: integrate_kb_rules
- Preconditions: knowledge_base_available=true, merge_strategy_defined=true
- Effects: kb_rules_integrated=true, conflicts_resolved=true
- Cost: 3

## create_security_policy_rules

**Description**: Creates and manages security policy rules for command categorization, focusing on enterprise and compliance requirements.

**Input Schema**:
- policyType (enum): Type of security policy ['enterprise', 'compliance', 'team', 'custom'])
- complianceStandards (array): Relevant compliance standards ['SOC2', 'GDPR', 'HIPAA', 'PCI-DSS']
- riskTolerance (enum): Organization risk tolerance ['conservative', 'moderate', 'aggressive']

**Implementation Sequence**:
1. Analyze security requirements and compliance standards
2. Map compliance requirements to command restrictions
3. Create policy-specific classification rules
4. Implement audit logging and reporting
5. Test policy enforcement and effectiveness

**Output Format**:
- Security policy analysis and requirements mapping
- Custom classification rules for policy compliance
- Audit logging and reporting configuration
- Policy testing and validation results
- Documentation for security team integration

**When to Use**:
- When implementing enterprise security policies
- For compliance with regulatory requirements
- Creating team-specific command restrictions
- During security audits and assessments

**GOAP Integration**:
- Action: create_security_rules
- Preconditions: policy_requirements_defined=true, compliance_standards_identified=true
- Effects: security_rules_created=true, compliance_validated=true
- Cost: 6

## optimize_classification_performance

**Description**: Optimizes command classification performance for large-scale deployments and high-throughput scenarios.

**Input Schema**:
- optimizationTarget (enum): Performance area to optimize ['lookup', 'matching', 'scoring', 'overall']
- throughputGoal (number): Target classifications per second (default: 1000)
- memoryLimit (number): Maximum memory usage in MB (default: 100)

**Implementation Sequence**:
1. Profile current classification performance
2. Identify bottlenecks and optimization opportunities
3. Implement performance improvements (caching, indexing, algorithms)
4. Benchmark against throughput and memory goals
5. Validate accuracy is maintained during optimization

**Output Format**:
- Current performance baseline and profiling results
- Identified bottlenecks and optimization opportunities
- Implemented optimizations with explanations
- Performance improvement metrics and benchmarks
- Accuracy validation after optimization

**When to Use**:
- When classification is slow on large command sets
- Before scaling to enterprise deployments
- During performance optimization cycles
- When memory usage is excessive

**GOAP Integration**:
- Action: optimize_classification_perf
- Preconditions: performance_baseline_available=true, optimization_target_defined=true
- Effects: performance_optimized=true, throughput_improved=true
- Cost: 5

## audit_classification_decisions

**Description**: Audits and analyzes classification decisions for bias, fairness, and consistency across different command types and sources.

**Input Schema**:
- auditScope (enum): Scope of audit ['historical', 'current', 'comparative']
- biasDetection (boolean): Enable bias detection analysis (default: true)
- consistencyCheck (boolean): Enable consistency validation (default: true)
- reportFormat (enum): Output format ['summary', 'detailed', 'json']

**Implementation Sequence**:
1. Collect classification decisions and metadata
2. Analyze for bias patterns (tool preference, platform bias)
3. Validate consistency across similar commands
4. Check for systematic classification errors
5. Generate audit report with recommendations

**Output Format**:
- Classification decision analysis with statistics
- Bias detection results and patterns identified
- Consistency validation with inconsistencies found
- Systematic error analysis and recommendations
- Audit summary with action items

**When to Use**:
- During regular security and quality audits
- When users report biased or inconsistent classifications
- Before major rule updates or deployments
- For compliance and governance requirements

**GOAP Integration**:
- Action: audit_classification_decisions
- Preconditions: classification_history_available=true, audit_scope_defined=true
- Effects: audit_completed=true, bias_analyzed=true, consistency_validated=true
- Cost: 6