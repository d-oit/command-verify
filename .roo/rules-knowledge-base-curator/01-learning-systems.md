# Self-Learning Knowledge Base Systems

## Knowledge Base Architecture

### Schema Design
```json
{
  "version": "1.0",
  "metadata": {
    "created": "2025-01-15T10:30:00.000Z",
    "lastUpdated": "2025-01-15T16:45:00.000Z",
    "projectId": "command-verify",
    "environment": "production"
  },
  "corrections": {
    "cliNames": {
      "claude-code": {
        "correct": "claude",
        "reason": "CLI renamed from claude-code to claude",
        "timestamp": "2025-01-15T14:20:00.000Z",
        "confidence": 0.95
      }
    },
    "commandPatterns": {
      "old-pattern": {
        "correct": "new-pattern",
        "reason": "Pattern updated for better accuracy",
        "timestamp": "2025-01-15T15:30:00.000Z",
        "confidence": 0.90
      }
    }
  },
  "patterns": {
    "commandPrefixes": ["npm", "yarn", "pnpm", "node", "npx", "git"],
    "fileExtensions": [".md", ".txt", ".rst"],
    "exclusionPatterns": ["^\\s*#", "^\\s*-", "^\\s*//"]
  },
  "validationRules": {
    "skip": {
      "patterns": ["^/verify$", "^/help$", "documentation.*example"],
      "exactMatches": ["/verify", "claude-code", "drop database"],
      "reason": "Documentation examples and meta-commands"
    },
    "safe": {
      "patterns": ["^git status$", "^npm run (build|test|lint)$", "^--version$"],
      "exactMatches": ["git status", "npm test", "node --version"],
      "reason": "Read-only and informational commands"
    },
    "conditional": {
      "patterns": ["^npm install", "^git commit", "^docker build"],
      "exactMatches": ["npm install", "git add", "docker run"],
      "reason": "Operations requiring user confirmation"
    },
    "dangerous": {
      "patterns": ["rm.*-rf", "git push.*--force", "drop database"],
      "exactMatches": ["rm -rf /", "git push --force", "DROP DATABASE"],
      "reason": "Destructive or irreversible operations"
    }
  },
  "learningHistory": [
    {
      "timestamp": "2025-01-15T14:20:00.000Z",
      "type": "correction",
      "category": "cliNames",
      "input": "claude-code",
      "output": "claude",
      "confidence": 0.95,
      "source": "user-feedback"
    }
  ],
  "statistics": {
    "totalCorrections": 15,
    "accuracyRate": 0.94,
    "lastWeekCorrections": 3,
    "mostCorrectedCategory": "cliNames"
  }
}
```

## Learning Mechanisms

### 1. Implicit Learning
**Concept**: Automatically learn patterns from user corrections and system behavior

**Implementation**:
```javascript
function learnFromCorrection(oldValue, newValue, context) {
  const correction = {
    timestamp: new Date().toISOString(),
    type: detectCorrectionType(oldValue, newValue),
    input: oldValue,
    output: newValue,
    confidence: calculateConfidence(oldValue, newValue, context),
    source: 'implicit-learning'
  };
  
  updateKnowledgeBase(correction);
  applyCorrectionToSimilarCases(correction);
}

function detectCorrectionType(oldValue, newValue) {
  if (isCommandName(oldValue) && isCommandName(newValue)) {
    return 'cliNames';
  }
  if (isCommandPattern(oldValue) && isCommandPattern(newValue)) {
    return 'commandPatterns';
  }
  return 'unknown';
}
```

### 2. Explicit Learning
**Concept**: Direct user input and explicit rule additions

**Implementation**:
```javascript
function addExplicitRule(category, pattern, type, reason) {
  const rule = {
    pattern: pattern,
    type: type, // 'exact' or 'regex'
    reason: reason,
    timestamp: new Date().toISOString(),
    confidence: 1.0,
    source: 'explicit-input'
  };
  
  if (!knowledgeBase.validationRules[category]) {
    knowledgeBase.validationRules[category] = {
      patterns: [],
      exactMatches: []
    };
  }
  
  if (type === 'exact') {
    knowledgeBase.validationRules[category].exactMatches.push(pattern);
  } else {
    knowledgeBase.validationRules[category].patterns.push(pattern);
  }
  
  saveKnowledgeBase();
}
```

### 3. Adaptive Learning
**Concept**: Adjust confidence scores based on success rates and user feedback

**Implementation**:
```javascript
function updateConfidenceScores() {
  const history = knowledgeBase.learningHistory;
  const corrections = history.filter(h => h.type === 'correction');
  
  // Calculate success rates for different rule types
  const rulePerformance = analyzeRulePerformance(corrections);
  
  // Adjust confidence scores based on performance
  Object.keys(rulePerformance).forEach(ruleType => {
    const performance = rulePerformance[ruleType];
    const newConfidence = calculateAdaptiveConfidence(performance);
    updateRuleConfidence(ruleType, newConfidence);
  });
}

function calculateAdaptiveConfidence(performance) {
  const successRate = performance.correct / performance.total;
  const baseConfidence = performance.baseConfidence;
  
  // Boost confidence for high success rates, reduce for low rates
  if (successRate > 0.95) {
    return Math.min(1.0, baseConfidence + 0.1);
  } else if (successRate < 0.80) {
    return Math.max(0.5, baseConfidence - 0.1);
  }
  
  return baseConfidence;
}
```

### 4. Cross-Project Learning
**Concept**: Share and port knowledge between different projects

**Implementation**:
```javascript
function exportKnowledgeBase() {
  return {
    version: knowledgeBase.version,
    patterns: knowledgeBase.patterns,
    validationRules: sanitizeForSharing(knowledgeBase.validationRules),
    statistics: knowledgeBase.statistics,
    exportedAt: new Date().toISOString()
  };
}

function importKnowledgeBase(externalKB, mergeStrategy = 'merge') {
  switch (mergeStrategy) {
    case 'replace':
      knowledgeBase = externalKB;
      break;
    case 'merge':
      knowledgeBase = mergeKnowledgeBases(knowledgeBase, externalKB);
      break;
    case 'append':
      knowledgeBase = appendKnowledgeBase(knowledgeBase, externalKB);
      break;
  }
  
  validateMergedKnowledgeBase();
  saveKnowledgeBase();
}
```

## Knowledge Integration

### Priority System
1. **Knowledge Base Exact Matches**: Priority 1.0
2. **Knowledge Base Patterns**: Priority 0.95
3. **Hardcoded Exact Matches**: Priority 0.95
4. **Hardcoded Patterns**: Priority 0.90
5. **Default Fallback**: Priority 0.50

### Conflict Resolution
```javascript
function resolveConflicts(kbRules, hardcodedRules) {
  const resolvedRules = {};
  
  // Knowledge base takes precedence
  Object.keys(kbRules).forEach(category => {
    resolvedRules[category] = {
      patterns: [...kbRules[category].patterns],
      exactMatches: [...kbRules[category].exactMatches]
    };
  });
  
  // Add hardcoded rules only if no conflict
  Object.keys(hardcodedRules).forEach(category => {
    if (!resolvedRules[category]) {
      resolvedRules[category] = {
        patterns: [...hardcodedRules[category].patterns],
        exactMatches: [...hardcodedRules[category].exactMatches]
      };
    } else {
      // Merge without conflicts
      resolvedRules[category].patterns.push(
        ...hardcodedRules[category].patterns.filter(p => 
          !resolvedRules[category].patterns.includes(p)
        )
      );
      resolvedRules[category].exactMatches.push(
        ...hardcodedRules[category].exactMatches.filter(e => 
          !resolvedRules[category].exactMatches.includes(e)
        )
      );
    }
  });
  
  return resolvedRules;
}
```

### Rule Validation
```javascript
function validateRule(rule, category) {
  const validation = {
    isValid: true,
    errors: [],
    warnings: []
  };
  
  // Syntax validation for regex patterns
  if (rule.type === 'regex') {
    try {
      new RegExp(rule.pattern);
    } catch (e) {
      validation.isValid = false;
      validation.errors.push(`Invalid regex: ${e.message}`);
    }
  }
  
  // Security validation
  const securityIssues = checkSecurityImplications(rule, category);
  if (securityIssues.length > 0) {
    validation.warnings.push(...securityIssues);
  }
  
  // Performance validation
  const performanceIssues = checkPerformanceImplications(rule);
  if (performanceIssues.length > 0) {
    validation.warnings.push(...performanceIssues);
  }
  
  return validation;
}
```

## Quality Assurance

### Knowledge Base Health Metrics
- **Accuracy Rate**: Percentage of correct classifications
- **Correction Frequency**: How often corrections are made
- **Rule Effectiveness**: Success rate of knowledge base rules
- **Coverage**: Percentage of commands covered by knowledge base
- **Freshness**: Age of most recent corrections

### Validation Checks
```javascript
function validateKnowledgeBase(kb) {
  const validation = {
    isValid: true,
    errors: [],
    warnings: [],
    score: 0
  };
  
  // Schema validation
  const schemaErrors = validateSchema(kb);
  if (schemaErrors.length > 0) {
    validation.isValid = false;
    validation.errors.push(...schemaErrors);
  }
  
  // Rule validation
  const ruleValidation = validateAllRules(kb.validationRules);
  validation.errors.push(...ruleValidation.errors);
  validation.warnings.push(...ruleValidation.warnings);
  
  // Consistency validation
  const consistencyIssues = checkRuleConsistency(kb.validationRules);
  validation.warnings.push(...consistencyIssues);
  
  // Calculate overall score
  validation.score = calculateKnowledgeBaseScore(kb, validation);
  
  return validation;
}
```

### Backup and Recovery
```javascript
function backupKnowledgeBase() {
  const backup = {
    timestamp: new Date().toISOString(),
    version: knowledgeBase.version,
    data: JSON.stringify(knowledgeBase, null, 2)
  };
  
  const backupFile = `.claude/knowledge-backup-${Date.now()}.json`;
  fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
  
  return backupFile;
}

function restoreKnowledgeBase(backupFile) {
  try {
    const backup = JSON.parse(fs.readFileSync(backupFile, 'utf-8'));
    knowledgeBase = JSON.parse(backup.data);
    validateKnowledgeBase(knowledgeBase);
    return true;
  } catch (error) {
    console.error('Failed to restore knowledge base:', error);
    return false;
  }
}
```

## Advanced Features

### Machine Learning Integration
```javascript
function trainPatternClassifier() {
  const trainingData = prepareTrainingData(knowledgeBase.learningHistory);
  
  // Extract features from command patterns
  const features = extractFeatures(trainingData);
  
  // Train simple classifier (could be enhanced with ML library)
  const classifier = {
    classify: function(command) {
      const features = extractCommandFeatures(command);
      return predictCategory(features, this.model);
    },
    model: trainModel(features, trainingData.labels)
  };
  
  return classifier;
}
```

### Knowledge Graph
```javascript
function buildKnowledgeGraph() {
  const graph = {
    nodes: [],
    edges: []
  };
  
  // Add command nodes
  Object.keys(knowledgeBase.corrections).forEach(category => {
    Object.keys(knowledgeBase.corrections[category]).forEach(item => {
      graph.nodes.push({
        id: item,
        type: category,
        properties: knowledgeBase.corrections[category][item]
      });
    });
  });
  
  // Add relationship edges
  graph.edges = extractRelationships(knowledgeBase);
  
  return graph;
}
```

### Predictive Learning
```javascript
function predictCorrections(command, context) {
  const similarCases = findSimilarCases(command, context);
  const predictions = similarCases.map(case => ({
    correction: case.output,
    confidence: case.confidence * similarityScore(command, case.input)
  }));
  
  return predictions.sort((a, b) => b.confidence - a.confidence);
}