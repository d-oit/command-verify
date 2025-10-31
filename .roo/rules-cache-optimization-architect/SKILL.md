# Cache Optimization Architect Skills

## analyze_cache_performance

**Description**: Analyzes cache performance metrics and identifies optimization opportunities for command verification caching system.

**Input Schema**:
- metricType (enum): Type of performance analysis ['hit-rate', 'latency', 'memory', 'throughput', 'overall'])
- timeRange (string): Analysis time range (default: '7d')
- includeBenchmarks (boolean): Include performance benchmarks (default: true)
- targetEnvironment (enum): Target environment ['development', 'staging', 'production'])

**Implementation Sequence**:
1. Collect cache performance metrics and logs
2. Analyze hit rates, lookup times, and memory usage
3. Compare against benchmarks and historical data
4. Identify bottlenecks and optimization opportunities
5. Generate performance improvement recommendations

**Output Format**:
- Performance dashboard with key metrics
- Bottleneck analysis with root causes
- Benchmark comparisons and trend analysis
- Optimization recommendations with priorities
- Implementation roadmap with expected improvements

**When to Use**:
- When cache performance is below expectations
- During performance optimization cycles
- Before scaling to larger deployments
- When users report slow verification times

**GOAP Integration**:
- Action: analyze_cache_performance
- Preconditions: cache_metrics_available=true, analysis_range_defined=true
- Effects: performance_analyzed=true, bottlenecks_identified=true
- Cost: 4

## optimize_cache_invalidation

**Description**: Optimizes cache invalidation strategies to maximize hit rates while ensuring data consistency.

**Input Schema**:
- invalidationStrategy (enum): Strategy to optimize ['git-diff', 'file-watch', 'hybrid', 'predictive'])
- targetHitRate (number): Target cache hit rate percentage (default: 90)
- consistencyLevel (enum): Data consistency requirement ['strict', 'eventual', 'relaxed'])
- analysisDepth (enum): Analysis detail level ['shallow', 'deep', 'comprehensive'])

**Implementation Sequence**:
1. Analyze current invalidation patterns and effectiveness
2. Model file-to-command dependency relationships
3. Optimize invalidation rules for minimal disruption
4. Implement predictive invalidation based on change patterns
5. Validate hit rate improvements and consistency

**Output Format**:
- Current invalidation analysis with effectiveness metrics
- Optimized invalidation rules and strategies
- Dependency mapping and impact analysis
- Predictive invalidation models
- Performance improvement projections

**When to Use**:
- When cache hit rates are below targets
- During system architecture optimization
- When invalidation logic needs improvement
- For scaling to larger codebases

**GOAP Integration**:
- Action: optimize_invalidation
- Preconditions: invalidation_patterns_available=true, target_hit_rate_defined=true
- Effects: invalidation_optimized=true, hit_rate_improved=true
- Cost: 5

## design_cache_architecture

**Description**: Designs comprehensive cache architecture for command verification systems, balancing performance, memory usage, and consistency.

**Input Schema**:
- architectureType (enum): Cache architecture type ['in-memory', 'persistent', 'hybrid', 'distributed'])
- scaleRequirement (enum): Scale requirement ['small', 'medium', 'large', 'enterprise'])
- consistencyModel (enum): Consistency model ['strong', 'eventual', 'weak'])
- performanceTargets (object): Performance requirements and constraints

**Implementation Sequence**:
1. Analyze current system requirements and constraints
2. Design cache topology and data flow architecture
3. Select appropriate caching algorithms and data structures
4. Plan cache invalidation and consistency mechanisms
5. Design monitoring and optimization strategies

**Output Format**:
- Cache architecture design with detailed specifications
- Data structure recommendations with performance analysis
- Invalidation and consistency strategy design
- Scalability analysis and growth projections
- Implementation roadmap with migration strategy

**When to Use**:
- When designing new caching systems
- During system architecture reviews
- When scaling beyond current limitations
- For performance-critical deployments

**GOAP Integration**:
- Action: design_cache_architecture
- Preconditions: requirements_analyzed=true, scale_defined=true
- Effects: architecture_designed=true, implementation_planned=true
- Cost: 6

## implement_memory_optimization

**Description**: Implements memory optimization strategies for cache systems, reducing memory footprint while maintaining performance.

**Input Schema**:
- optimizationTechnique (enum): Technique to implement ['compression', 'lru', 'tiering', 'pooling'])
- memoryTarget (number): Target memory usage in MB (default: 100)
- performanceConstraint (number): Maximum performance degradation percentage (default: 10)
- monitoringLevel (enum): Monitoring detail level ['basic', 'detailed', 'comprehensive'])

**Implementation Sequence**:
1. Profile current memory usage patterns and bottlenecks
2. Implement selected optimization techniques
3. Configure memory limits and eviction policies
4. Set up monitoring and alerting for memory usage
5. Validate performance impact and effectiveness

**Output Format**:
- Memory usage analysis with optimization opportunities
- Implementation details for selected techniques
- Performance impact assessment and validation
- Monitoring configuration and alerting setup
- Memory optimization results and recommendations

**When to Use**:
- When memory usage is excessive or growing
- During system resource optimization
- When deploying to memory-constrained environments
- For cost optimization in cloud deployments

**GOAP Integration**:
- Action: optimize_memory_usage
- Preconditions: memory_profile_available=true, optimization_technique_selected=true
- Effects: memory_optimized=true, performance_validated=true
- Cost: 4

## benchmark_cache_algorithms

**Description**: Benchmarks different caching algorithms and data structures to identify optimal solutions for specific use cases.

**Input Schema**:
- algorithmType (enum): Algorithm category ['eviction', 'lookup', 'compression', 'consistency'])
- datasetSize (number): Size of test dataset (default: 10000)
- accessPattern (enum): Access pattern to simulate ['sequential', 'random', 'lru-heavy', 'uniform'])
- performanceMetrics (array): Metrics to measure ['latency', 'throughput', 'memory', 'cpu'])

**Implementation Sequence**:
1. Define benchmark scenarios and success criteria
2. Implement multiple algorithm variants
3. Generate test datasets with realistic patterns
4. Execute benchmarks with comprehensive measurements
5. Analyze results and provide recommendations

**Output Format**:
- Algorithm performance comparison with detailed metrics
- Trade-off analysis (memory vs performance)
- Use case recommendations with justifications
- Implementation guidance for optimal solutions
- Performance projections for different scales

**When to Use**:
- When selecting caching algorithms for new systems
- During performance optimization initiatives
- When current cache implementation is suboptimal
- For academic research and comparison studies

**GOAP Integration**:
- Action: benchmark_algorithms
- Preconditions: algorithms_defined=true, test_dataset_available=true
- Effects: benchmarks_completed=true, optimal_algorithm_identified=true
- Cost: 7

## analyze_scalability_limits

**Description**: Analyzes scalability limits and growth patterns of cache systems, planning for future expansion needs.

**Input Schema**:
- growthScenario (enum): Growth scenario to analyze ['linear', 'exponential', 'seasonal', 'spike'])
- timeHorizon (string): Analysis time horizon (default: '12m')
- resourceConstraints (object): Available resources and limitations
- scalingStrategy (enum): Scaling approach ['vertical', 'horizontal', 'hybrid'])

**Implementation Sequence**:
1. Analyze current system capacity and utilization
2. Model growth scenarios and resource requirements
3. Identify scaling bottlenecks and breaking points
4. Design scaling strategies and migration paths
5. Create capacity planning roadmap

**Output Format**:
- Current capacity analysis with utilization metrics
- Growth projections with resource requirements
- Bottleneck identification and breaking point analysis
- Scaling strategy design with implementation roadmap
- Cost analysis and resource optimization recommendations

**When to Use**:
- During capacity planning exercises
- When approaching current system limits
- For long-term infrastructure planning
- When designing for rapid growth scenarios

**GOAP Integration**:
- Action: analyze_scalability
- Preconditions: current_capacity_known=true, growth_scenario_defined=true
- Effects: scalability_analyzed=true, scaling_plan_created=true
- Cost: 5

## optimize_io_operations

**Description**: Optimizes I/O operations for cache systems, reducing file system overhead and improving throughput.

**Input Schema**:
- ioType (enum): I/O operation type ['reads', 'writes', 'metadata', 'batch'])
- optimizationTarget (enum): Optimization goal ['latency', 'throughput', 'efficiency', 'reduction'])
- batchSize (number): Target batch size for operations (default: 100)
- concurrencyLevel (number): Number of concurrent operations (default: 4)

**Implementation Sequence**:
1. Profile current I/O operation patterns and bottlenecks
2. Implement optimization techniques (batching, async, caching)
3. Configure operation parameters and concurrency settings
4. Set up I/O monitoring and performance tracking
5. Validate improvements and measure effectiveness

**Output Format**:
- I/O performance analysis with bottleneck identification
- Optimization implementation details and configuration
- Performance improvement measurements and validation
- Monitoring setup and alerting configuration
- I/O optimization results and best practices

**When to Use**:
- When I/O operations are causing performance issues
- During system performance optimization
- When file system latency is high
- For high-throughput deployment scenarios

**GOAP Integration**:
- Action: optimize_io_operations
- Preconditions: io_profile_available=true, optimization_target_defined=true
- Effects: io_optimized=true, throughput_improved=true
- Cost: 4