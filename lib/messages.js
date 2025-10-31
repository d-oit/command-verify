const INSTALL_HINTS = {
  npm: 'Install Node.js (which includes npm) and re-run the verification once available.',
  yarn: 'Install Yarn globally (npm install -g yarn) or switch the documentation to npm commands.',
  pnpm: 'Install pnpm globally (npm install -g pnpm) or document the installation step.',
  node: 'Install Node.js from https://nodejs.org/ and ensure it is on your PATH.',
  npx: 'Install Node.js so that npx becomes available for command execution.',
  python: 'Install Python 3 and make sure python is available on the PATH (check py launcher on Windows).',
  python3: 'Install Python 3 and ensure the python3 alias is available on your system PATH.',
  pip: 'Install pip (bundled with recent Python distributions) or reference python -m pip in documentation.',
  pip3: 'Install Python 3 and use python -m pip to ensure consistent availability.',
  git: 'Install Git from https://git-scm.com/downloads and restart the shell to refresh PATH.',
  docker: 'Install Docker Desktop or the Docker CLI and ensure the daemon is running before running this command.',
};

function getCommandName(command) {
  if (!command) return '';
  return command.trim().split(/\s+/)[0];
}

function buildLocationPrefix(locations = []) {
  if (!locations || locations.length === 0) return '';
  const { file, line } = locations[0];
  if (file && line) return `${file}:${line}: `;
  if (file) return `${file}: `;
  return '';
}

export function buildValidationMessage({
  command,
  category,
  available,
  locations,
  treatUnknownAsWarnings = true,
}) {
  const prefix = buildLocationPrefix(locations);
  const commandName = getCommandName(command);
  const suggestion = [];

  if (category === 'skip') {
    return {
      message: `${prefix}Skipped documentation-only command`,
      severity: 'info',
    };
  }

  if (!available) {
    if (INSTALL_HINTS[commandName]) {
      suggestion.push(INSTALL_HINTS[commandName]);
    } else {
      suggestion.push('Install the required CLI or adjust the documentation to reference an available command.');
    }
  }

  if (category === 'dangerous') {
    suggestion.push('Add a warning to the documentation or provide a safer alternative command.');
    return {
      message: `${prefix}Flagged as dangerous. Do not auto-run this command.`,
      severity: 'error',
      suggestion: suggestion.join(' '),
    };
  }

  if (category === 'conditional') {
    suggestion.push('Document any pre-requisites or required confirmations for this command.');
    return {
      message: `${prefix}Requires manual review before execution.`,
      severity: 'warning',
      suggestion: suggestion.join(' '),
    };
  }

  if (category === 'unknown') {
    if (treatUnknownAsWarnings) {
      suggestion.push('Add this command to the knowledge base or configuration so it can be categorized.');
      if (!available) {
        suggestion.push('Verify the command name or provide installation instructions.');
      }
      return {
        message: `${prefix}Unknown command pattern${available ? '' : ' and not found on this system'}.`,
        severity: 'warning',
        suggestion: suggestion.join(' '),
      };
    }

    return {
      message: `${prefix}Unknown command pattern.`,
      severity: 'error',
      suggestion: suggestion.join(' '),
    };
  }

  if (!available) {
    return {
      message: `${prefix}${commandName} is not available on this system.`,
      severity: 'warning',
      suggestion: suggestion.join(' '),
    };
  }

  return {
    message: `${prefix}Validated as ${category}.`,
    severity: 'info',
    suggestion: suggestion.join(' ') || undefined,
  };
}
