# Documentation Validator Skills

## validate_documentation_accuracy

**Description**: Validates documentation accuracy by testing commands, verifying information, and checking for correctness.

**Input Schema**:
- validationScope (enum): Scope of validation ['commands', 'examples', 'configuration', 'comprehensive'])
- testEnvironment (enum): Testing environment ['development', 'staging', 'production', 'multi-platform'])
- strictness (enum): Validation strictness ['lenient', 'moderate', 'strict'])
- autoFix (boolean): Attempt automatic fixes for issues (default: false)

**Implementation Sequence**:
1. Extract commands and examples from documentation
2. Test command availability and execution (if safe)
3. Verify configuration options and parameters
4. Check links, references, and version information
5. Generate accuracy report with recommendations

**Output Format**:
- Accuracy validation results with detailed findings
- Command test results and error analysis
- Configuration verification with discrepancies
- Link and reference validation
- Fix recommendations and priority rankings

**When to Use**:
- Before documentation publication or releases
- During documentation review cycles
- When users report accuracy issues
- For quality assurance initiatives

**GOAP Integration**:
- Action: validate_doc_accuracy
- Preconditions: documentation_available=true, validation_scope_defined=true
- Effects: accuracy_validated=true, issues_identified=true
- Cost: 5

## analyze_documentation_coverage

**Description**: Analyzes documentation coverage to identify gaps, missing information, and improvement opportunities.

**Input Schema**:
- coverageType (enum): Type of coverage analysis ['commands', 'scenarios', 'platforms', 'user-levels'])
- targetAudience (array): Target user groups ['beginners', 'intermediate', 'advanced', 'experts'])
- benchmarkLevel (enum): Coverage benchmark ['industry-standard', 'competitive', 'custom'])
- generateGapReport (boolean): Generate detailed gap analysis (default: true)

**Implementation Sequence**:
1. Map current documentation structure and content
2. Identify coverage gaps and missing sections
3. Analyze against benchmarks and requirements
4. Assess coverage for different user levels
5. Generate improvement recommendations and roadmap

**Output Format**:
- Coverage analysis with percentage metrics
- Gap identification with prioritization
- Benchmark comparison and competitive analysis
- User level coverage assessment
- Improvement roadmap with action items

**When to Use**:
- During documentation planning and strategy
- When expanding to new features or platforms
- For competitive analysis and improvement
- During user experience optimization

**GOAP Integration**:
- Action: analyze_doc_coverage
- Preconditions: doc_structure_mapped=true, coverage_type_defined=true
- Effects: coverage_analyzed=true, gaps_identified=true
- Cost: 4

## improve_documentation_clarity

**Description**: Improves documentation clarity by analyzing language, structure, and user comprehension factors.

**Input Schema**:
- clarityAspect (enum): Aspect to improve ['language', 'structure', 'examples', 'navigation'])
- targetAudience (enum): Primary audience ['technical', 'mixed', 'non-technical'])
- readabilityLevel (enum): Target readability score ['basic', 'intermediate', 'advanced'])
- includeVisuals (boolean): Include visual organization analysis (default: true)

**Implementation Sequence**:
1. Analyze current language complexity and terminology
2. Evaluate structure and information organization
3. Assess example quality and completeness
4. Test navigation and findability
5. Generate clarity improvement recommendations

**Output Format**:
- Clarity assessment with detailed metrics
- Language improvement suggestions with alternatives
- Structure optimization recommendations
- Example enhancement guidelines
- Navigation and usability improvements

**When to Use**:
- When user feedback indicates confusion
- During documentation redesign projects
- For accessibility and usability improvement
- When targeting new user demographics

**GOAP Integration**:
- Action: improve_doc_clarity
- Preconditions: clarity_analyzed=true, target_audience_defined=true
- Effects: clarity_improved=true, readability_enhanced=true
- Cost: 4

## create_documentation_templates

**Description**: Creates standardized documentation templates and patterns for consistent, high-quality documentation.

**Input Schema**:
- templateType (enum): Type of template ['command-reference', 'tutorial', 'api-docs', 'readme'])
- documentationStyle (enum): Documentation style guide ['google', 'microsoft', 'github', 'custom'])
- includeExamples (boolean): Include example sections (default: true)
- automationLevel (enum): Template automation level ['static', 'dynamic', 'interactive'])

**Implementation Sequence**:
1. Analyze existing documentation patterns and requirements
2. Design template structure with placeholders
3. Create style guide compliance rules
4. Implement automation and validation features
5. Generate template documentation and usage guidelines

**Output Format**:
- Template definitions with structure and placeholders
- Style guide compliance rules and checks
- Automation features and dynamic content rules
- Usage documentation and best practices
- Validation rules for template usage

**When to Use**:
- When standardizing documentation across projects
- During documentation system implementation
- For team collaboration and consistency
- When improving documentation efficiency

**GOAP Integration**:
- Action: create_doc_templates
- Preconditions: template_requirements_defined=true, style_guide_selected=true
- Effects: templates_created=true, consistency_standardized=true
- Cost: 5

## integrate_command_verification

**Description**: Integrates command verification system with documentation workflows for automated accuracy checking.

**Input Schema**:
- integrationMode (enum): Integration approach ['pre-commit', 'ci-cd', 'real-time', 'scheduled'])
- verificationLevel (enum): Verification depth ['syntax-only', 'availability', 'execution', 'comprehensive'])
- failureHandling (enum): Failure response ['block', 'warn', 'notify', 'auto-fix'])
- reportingFormat (enum): Report output ['json', 'html', 'markdown', 'dashboard'])

**Implementation Sequence**:
1. Configure command verification integration points
2. Set up verification triggers and schedules
3. Implement failure handling and reporting
4. Configure notification and escalation workflows
5. Test integration and validate effectiveness

**Output Format**:
- Integration configuration with workflow setup
- Verification rules and failure handling
- Notification and reporting configuration
- Performance monitoring and metrics
- Integration testing and validation results

**When to Use**:
- When implementing documentation quality automation
- During CI/CD pipeline setup
- For continuous documentation quality monitoring
- When scaling documentation processes

**GOAP Integration**:
- Action: integrate_cmd_verification
- Preconditions: verification_system_available=true, integration_mode_defined=true
- Effects: verification_integrated=true, quality_automated=true
- Cost: 6

## optimize_documentation_search

**Description**: Optimizes documentation searchability and information retrieval for better user experience.

**Input Schema**:
- searchOptimization (enum): Area to optimize ['content', 'structure', 'metadata', 'full-text'])
- searchTechnology (enum): Search implementation ['elastic', 'algolia', 'lunr', 'native'])
- userBehavior (array): User search patterns to support ['keyword', 'natural-language', 'browse', 'task-oriented'])
- performanceTarget (number): Target search response time in ms (default: 200)

**Implementation Sequence**:
1. Analyze current search performance and user behavior
2. Optimize content structure and metadata
3. Implement search technology and configuration
4. Configure search analytics and monitoring
5. Test search effectiveness and user satisfaction

**Output Format**:
- Search optimization implementation with configuration
- Content structure improvements and recommendations
- Search analytics and monitoring setup
- Performance benchmarks and improvements
- User behavior analysis and insights

**When to Use**:
- When users report difficulty finding information
- During documentation platform optimization
- For large documentation sites with complex content
- When implementing advanced search features

**GOAP Integration**:
- Action: optimize_doc_search
- Preconditions: search_analyzed=true, optimization_target_defined=true
- Effects: search_optimized=true, findability_improved=true
- Cost: 5

## create_documentation_analytics

**Description**: Creates comprehensive analytics system for tracking documentation usage, effectiveness, and user behavior.

**Input Schema**:
- analyticsType (enum): Type of analytics ['usage', 'performance', 'user-behavior', 'quality'])
- trackingLevel (enum): Tracking detail level ['basic', 'detailed', 'comprehensive'])
- privacyCompliance (enum): Privacy standard ['gdpr', 'ccpa', 'custom', 'minimal'])
- dashboardType (enum): Dashboard interface ['simple', 'detailed', 'interactive', 'api'])

**Implementation Sequence**:
1. Design analytics data collection and storage
2. Implement tracking mechanisms and privacy controls
3. Create data processing and analysis pipelines
4. Build dashboard and visualization interfaces
5. Configure reporting and alerting systems

**Output Format**:
- Analytics system implementation with data collection
- Privacy compliance and data protection measures
- Dashboard configuration and visualization setup
- Reporting automation and alerting
- Analytics API and integration points

**When to Use**:
- When measuring documentation effectiveness
- During user experience optimization
- For data-driven documentation improvement
- When implementing documentation metrics programs

**GOAP Integration**:
- Action: create_doc_analytics
- Preconditions: analytics_requirements_defined=true, privacy_compliance_selected=true
- Effects: analytics_implemented=true, insights_available=true
- Cost: 6

## validate_documentation_accessibility

**Description**: Validates and improves documentation accessibility for users with different abilities and needs.

**Input Schema**:
- accessibilityStandard (enum): Compliance standard ['wcag-2.1', 'section-508', 'en-301549', 'custom'])
- userNeeds (array): User needs to address ['visual', 'motor', 'cognitive', 'hearing'])
- testingTools (array): Accessibility testing tools ['axe', 'lighthouse', 'screen-reader', 'keyboard'])
- remediationLevel (enum): Fix implementation level ['assessment', 'recommendations', 'full-remediation'])

**Implementation Sequence**:
1. Audit documentation against accessibility standards
2. Test with assistive technologies and tools
3. Identify barriers and improvement opportunities
4. Implement accessibility fixes and enhancements
5. Validate improvements and measure effectiveness

**Output Format**:
- Accessibility audit results with compliance scores
- Barrier identification with impact analysis
- Remediation recommendations and implementation
- Testing results and tool validation
- Compliance certification and documentation

**When to Use**:
- For regulatory compliance requirements
- During accessibility improvement initiatives
- When serving diverse user populations
- For inclusive design and development

**GOAP Integration**:
- Action: validate_doc_accessibility
- Preconditions: accessibility_standard_defined=true, testing_tools_selected=true
- Effects: accessibility_validated=true, compliance_achieved=true
- Cost: 5