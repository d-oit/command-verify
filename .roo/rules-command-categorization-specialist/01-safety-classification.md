# Command Safety Classification Framework

## Safety Category Hierarchy

### 1. DANGEROUS (Never Auto-Execute)
**Risk Level**: Critical - High potential for data loss or system damage

**Examples**:
- File destruction: `rm -rf /`, `del /s /q`
- Force operations: `git push --force`, `npm install --force`
- Database operations: `DROP DATABASE`, `TRUNCATE TABLE`
- System changes: `format --yes`, `fdisk`, `mkfs`
- Privilege escalation: `sudo rm`, `runas /admin`

**Characteristics**:
- Irreversible operations
- Data destruction potential
- System configuration changes
- High privilege requirements
- Network-wide impact

### 2. CONDITIONAL (Requires User Confirmation)
**Risk Level**: Moderate - Manageable risk with user oversight

**Examples**:
- Package management: `npm install`, `yarn add`, `pip install`
- Container operations: `docker build`, `docker run -p`
- Version control: `git commit`, `git push`, `git add`
- Build operations: `make`, `npm run build`, `cargo build`
- Configuration: `npx husky`, `npm run format`

**Characteristics**:
- Reversible but may require cleanup
- Resource consumption impact
- Network dependencies
- Environment modifications
- Time-consuming operations

### 3. SAFE (Can Auto-Execute)
**Risk Level**: Low - Minimal risk, read-only or benign operations

**Examples**:
- Informational: `git status`, `git log`, `git diff`
- Version checks: `node --version`, `npm --version`
- File operations: `ls`, `cat`, `find`, `grep --help`
- Navigation: `cd /tmp`, `pwd`
- Testing: `npm test`, `cargo test`, `go test`

**Characteristics**:
- Read-only operations
- No system state changes
- Minimal resource usage
- No external dependencies
- Instantaneous execution

### 4. SKIP (Documentation Examples)
**Risk Level**: N/A - Not real commands

**Examples**:
- Documentation placeholders: `/verify`, `/help`
- Meta-commands: `claude-code`, `drop database` (in docs)
- Tutorial examples: `example-command`, `your-tool here`
- Template commands: `npm run <script-name>`

**Characteristics**:
- Not executable on system
- Documentation artifacts
- Placeholder text
- Template references
- Meta-documentation commands

### 5. UNKNOWN (Insufficient Information)
**Risk Level**: Undefined - Cannot determine safety

**Examples**:
- Custom tools: `my-custom-tool --flag`
- Obscure commands: `obscure-binary option`
- Ambiguous syntax: `command with unclear intent`
- New/unknown tools: `newly-released-tool`

**Characteristics**:
- No prior classification data
- Unfamiliar command patterns
- Insufficient context
- Requires manual analysis
- May need user input

## Confidence Scoring System

### Score Ranges
- **1.0**: Exact match in knowledge base or hardcoded rules
- **0.95**: Strong pattern match with high specificity
- **0.90**: Good pattern match with moderate specificity
- **0.80**: Weak pattern match or ambiguous context
- **0.50**: Unknown command, no pattern match

### Confidence Factors
1. **Exact Match Priority**: Knowledge base exact matches override all patterns
2. **Pattern Specificity**: More specific patterns get higher scores
3. **Context Analysis**: Code blocks vs inline code affects confidence
4. **Historical Accuracy**: Past classification success rates
5. **Cross-Reference**: Multiple pattern agreement increases confidence

## Security Considerations

### Privilege Escalation Detection
- Identify sudo, runas, admin operations
- Flag commands requiring elevated privileges
- Consider context for legitimate admin use
- Warn about potential security implications

### Data Loss Prevention
- Detect file deletion and modification patterns
- Identify recursive operations (-r, -rf flags)
- Flag destructive operations on system directories
- Consider backup and recovery implications

### Network Security
- Identify commands that make network connections
- Flag data exfiltration potential
- Consider firewall and security policy impacts
- Validate remote command execution risks

### Resource Consumption
- Detect commands that consume significant resources
- Identify potential denial of service risks
- Consider system impact and performance
- Flag resource exhaustion scenarios

## Knowledge Base Integration

### Rule Priority System
1. **Knowledge Base Exact Matches**: Highest priority (1.0 confidence)
2. **Knowledge Base Patterns**: High priority (0.95 confidence)
3. **Hardcoded Exact Matches**: Medium priority (0.95 confidence)
4. **Hardcoded Patterns**: Low priority (0.90 confidence)
5. **Default Fallback**: Lowest priority (0.50 confidence)

### Learning Mechanisms
- **Implicit Learning**: Pattern discovery from user corrections
- **Explicit Learning**: Direct user feedback integration
- **Adaptive Learning**: Confidence adjustment based on success rates
- **Cross-Project Learning**: Portable rule sharing

### Conflict Resolution
- **Rule Hierarchy**: Higher priority rules override lower ones
- **Category Precedence**: Dangerous > Conditional > Safe > Skip > Unknown
- **Context Awareness**: Consider file context and usage patterns
- **User Preferences**: Respect user-defined overrides

## Pattern Development Guidelines

### Dangerous Pattern Creation
- Focus on destructive operations and system changes
- Include common flag combinations (-rf, --force, --yes)
- Consider platform-specific dangerous commands
- Account for privilege escalation scenarios
- Test against real dangerous command examples

### Conditional Pattern Creation
- Include package management operations
- Cover build and deployment processes
- Consider version control workflows
- Account for container and orchestration tools
- Test against common development workflows

### Safe Pattern Creation
- Focus on informational and read-only operations
- Include version and status checks
- Cover navigation and file inspection tools
- Consider testing and validation commands
- Test against benign command examples

### Pattern Testing
- **Positive Testing**: Validate correct classification of known commands
- **Negative Testing**: Ensure non-commands aren't misclassified
- **Edge Case Testing**: Test boundary conditions and unusual inputs
- **Performance Testing**: Ensure efficient pattern matching
- **Cross-Platform Testing**: Validate across different operating systems