# Knowledge Base Curator Skills

## design_knowledge_schema

**Description**: Designs comprehensive knowledge base schemas for command verification systems, ensuring extensibility and maintainability.

**Input Schema**:
- schemaType (enum): Type of schema design ['relational', 'document', 'graph', 'hybrid'])
- versioningStrategy (enum): Schema versioning approach ['semantic', 'timestamp', 'sequential'])
- validationLevel (enum): Validation strictness ['strict', 'moderate', 'lenient'])
- migrationSupport (boolean): Include migration strategy design (default: true)

**Implementation Sequence**:
1. Analyze current knowledge requirements and usage patterns
2. Design schema structure with relationships and constraints
3. Define validation rules and consistency checks
4. Plan versioning and migration strategies
5. Create documentation and usage examples

**Output Format**:
- Schema definition with detailed specifications
- Validation rules and constraints
- Versioning and migration strategy
- Relationship definitions and data flow
- Implementation guidelines and best practices

**When to Use**:
- When designing new knowledge base systems
- During schema evolution and refactoring
- When current schema is insufficient for needs
- For knowledge base standardization initiatives

**GOAP Integration**:
- Action: design_kb_schema
- Preconditions: requirements_analyzed=true, schema_type_defined=true
- Effects: schema_designed=true, validation_planned=true
- Cost: 5

## implement_learning_algorithms

**Description**: Implements machine learning algorithms for adaptive knowledge base improvement and pattern discovery.

**Input Schema**:
- algorithmType (enum): Type of ML algorithm ['classification', 'clustering', 'anomaly-detection', 'recommendation'])
- trainingData (string): Path to training dataset (optional, uses historical data)
- validationMethod (enum): Validation approach ['cross-validation', 'holdout', 'bootstrap'])
- performanceTarget (number): Target accuracy or performance metric (default: 0.90)

**Implementation Sequence**:
1. Prepare and preprocess training data from knowledge base history
2. Select and configure appropriate ML algorithm
3. Train model with feature extraction and optimization
4. Validate model performance with test data
5. Deploy model for real-time learning and prediction

**Output Format**:
- Trained model with performance metrics
- Feature importance and analysis results
- Validation results and accuracy measures
- Deployment configuration and monitoring setup
- Learning pipeline automation

**When to Use**:
- When manual rule creation becomes insufficient
- For pattern discovery in large datasets
- During optimization of classification accuracy
- When implementing predictive capabilities

**GOAP Integration**:
- Action: implement_ml_learning
- Preconditions: training_data_available=true, algorithm_selected=true
- Effects: ml_model_trained=true, learning_automated=true
- Cost: 7

## manage_knowledge_versioning

**Description**: Manages knowledge base versioning, migration, and rollback strategies for safe evolution.

**Input Schema**:
- versioningModel (enum): Versioning model ['semantic', 'timestamp', 'git-hash'])
- migrationStrategy (enum): Migration approach ['automatic', 'manual', 'hybrid'])
- rollbackPolicy (enum): Rollback strategy ['immediate', 'scheduled', 'approval-required'])
- conflictResolution (enum): Conflict handling ['merge', 'override', 'prompt'])

**Implementation Sequence**:
1. Design versioning system with compatibility tracking
2. Implement migration scripts and transformation rules
3. Create rollback mechanisms and safety checks
4. Set up conflict detection and resolution
5. Configure automated backup and recovery

**Output Format**:
- Versioning system implementation with migration scripts
- Rollback procedures and safety mechanisms
- Conflict resolution strategies and workflows
- Backup and recovery automation
- Version management documentation

**When to Use**:
- When knowledge base schema needs evolution
- During system upgrades and migrations
- When multiple knowledge base versions exist
- For team collaboration scenarios

**GOAP Integration**:
- Action: manage_kb_versioning
- Preconditions: versioning_model_defined=true, migration_strategy_selected=true
- Effects: versioning_implemented=true, migration_automated=true
- Cost: 6

## analyze_knowledge_quality

**Description**: Analyzes knowledge base quality metrics and provides insights for improvement and optimization.

**Input Schema**:
- qualityDimension (enum): Quality aspect to analyze ['accuracy', 'completeness', 'consistency', 'freshness'])
- analysisMethod (enum): Analysis approach ['statistical', 'rule-based', 'ml-based', 'hybrid'])
- timeWindow (string): Analysis time window (default: '30d')
- benchmarkDataset (string): Path to benchmark data (optional)

**Implementation Sequence**:
1. Collect quality metrics and performance data
2. Analyze knowledge base against quality dimensions
3. Identify quality issues and improvement opportunities
4. Compare against benchmarks and historical data
5. Generate quality reports and recommendations

**Output Format**:
- Quality assessment dashboard with detailed metrics
- Issue identification with root cause analysis
- Improvement recommendations with priorities
- Benchmark comparisons and trend analysis
- Action plan for quality enhancement

**When to Use**:
- During regular quality assessment cycles
- When knowledge base performance degrades
- For continuous improvement initiatives
- Before major system deployments

**GOAP Integration**:
- Action: analyze_kb_quality
- Preconditions: quality_metrics_available=true, analysis_method_defined=true
- Effects: quality_analyzed=true, improvements_identified=true
- Cost: 4

## create_knowledge_workflows

**Description**: Creates automated workflows for knowledge base curation, validation, and deployment.

**Input Schema**:
- workflowType (enum): Type of workflow ['curation', 'validation', 'deployment', 'backup'])
- automationLevel (enum): Automation degree ['manual', 'semi-automated', 'fully-automated'])
- integrationPoints (array): System integrations ['git', 'ci-cd', 'monitoring', 'notification'])
- qualityGates (array): Quality checkpoints ['validation', 'testing', 'review', 'approval'])

**Implementation Sequence**:
1. Design workflow stages and decision points
2. Configure automation and integration points
3. Set up quality gates and validation checks
4. Implement monitoring and alerting mechanisms
5. Create documentation and runbooks

**Output Format**:
- Workflow definitions with automation configuration
- Quality gate specifications and validation rules
- Integration setup and monitoring configuration
- Documentation and standard operating procedures
- Performance metrics and success criteria

**When to Use**:
- When knowledge base management becomes complex
- For team collaboration and process standardization
- During DevOps and automation initiatives
- When scaling knowledge base operations

**GOAP Integration**:
- Action: create_kb_workflows
- Preconditions: workflow_type_defined=true, automation_level_selected=true
- Effects: workflows_created=true, automation_implemented=true
- Cost: 5

## optimize_knowledge_storage

**Description**: Optimizes knowledge base storage for performance, scalability, and resource efficiency.

**Input Schema**:
- storageOptimization (enum): Optimization focus ['performance', 'size', 'query-speed', 'memory'])
- storageFormat (enum): Storage format ['json', 'binary', 'database', 'hybrid'])
- indexingStrategy (enum): Indexing approach ['basic', 'full-text', 'semantic', 'hybrid'])
- compressionLevel (enum): Compression level ['none', 'basic', 'aggressive', 'adaptive'])

**Implementation Sequence**:
1. Analyze current storage performance and bottlenecks
2. Design optimized storage structure and indexing
3. Implement compression and optimization techniques
4. Configure query optimization and caching
5. Validate performance improvements and resource usage

**Output Format**:
- Storage optimization implementation with performance metrics
- Indexing strategy and query optimization
- Compression results and space savings
- Performance benchmarks and improvements
- Resource usage analysis and recommendations

**When to Use**:
- When knowledge base queries are slow
- During storage optimization initiatives
- When resource usage is excessive
- For scaling to larger knowledge bases

**GOAP Integration**:
- Action: optimize_kb_storage
- Preconditions: storage_analyzed=true, optimization_target_defined=true
- Effects: storage_optimized=true, performance_improved=true
- Cost: 5

## integrate_external_knowledge

**Description**: Integrates external knowledge sources and APIs to enrich the knowledge base with additional context and rules.

**Input Schema**:
- sourceType (enum): External source type ['api', 'database', 'file', 'feed', 'scraper'])
- integrationPattern (enum): Integration approach ['real-time', 'batch', 'on-demand', 'hybrid'])
- validationRules (array): Rules for external content validation
- updateFrequency (enum): Update frequency ['continuous', 'hourly', 'daily', 'weekly'])

**Implementation Sequence**:
1. Analyze external knowledge sources and formats
2. Design integration patterns and data transformation
3. Implement validation and quality control mechanisms
4. Configure update schedules and conflict resolution
5. Set up monitoring and error handling

**Output Format**:
- Integration implementation with data flow mapping
- Validation rules and quality control measures
- Update automation and scheduling configuration
- Monitoring and error handling setup
- Performance metrics and integration results

**When to Use**:
- When internal knowledge is insufficient
- For enriching knowledge with external context
- During system integration projects
- When building comprehensive knowledge ecosystems

**GOAP Integration**:
- Action: integrate_external_kb
- Preconditions: external_source_identified=true, integration_pattern_defined=true
- Effects: external_kb_integrated=true, knowledge_enriched=true
- Cost: 6

## create_feedback_loops

**Description**: Creates feedback mechanisms for continuous knowledge base improvement based on user interactions and corrections.

**Input Schema**:
- feedbackType (enum): Type of feedback ['explicit', 'implicit', 'behavioral', 'automated'])
- collectionMethod (enum): Collection approach ['survey', 'analytics', 'correction-tracking', 'performance-monitoring'])
- processingPipeline (enum): Processing workflow ['real-time', 'batch', 'hybrid'])
- learningRate (number): Learning adaptation speed (default: 0.1)

**Implementation Sequence**:
1. Design feedback collection mechanisms and interfaces
2. Implement processing pipelines and analysis
3. Configure learning algorithms and adaptation
4. Set up monitoring and quality control
5. Create feedback visualization and reporting

**Output Format**:
- Feedback system implementation with collection mechanisms
- Processing pipeline and learning algorithms
- Monitoring and quality control configuration
- Feedback analysis and insight generation
- Continuous improvement automation

**When to Use**:
- When knowledge base accuracy needs improvement
- For adaptive learning system implementation
- During user experience optimization
- When building self-improving systems

**GOAP Integration**:
- Action: create_feedback_loops
- Preconditions: feedback_type_defined=true, collection_method_selected=true
- Effects: feedback_system_created=true, adaptive_learning_enabled=true
- Cost: 6