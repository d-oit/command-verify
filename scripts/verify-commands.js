#!/usr/bin/env node

import path from 'path';
import { fileURLToPath } from 'url';

import { runVerification, ConfigurationError } from '../lib/verification.js';

const CURRENT_FILE = fileURLToPath(import.meta.url);

async function cli() {
  try {
    await runVerification();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`❌ Command verification failed: ${message}`);
    if (error instanceof ConfigurationError && error.hints?.length) {
      for (const hint of error.hints) {
        console.error(`↳ Hint: ${hint}`);
      }
    }
    process.exitCode = 1;
  }
}

if (path.resolve(process.argv[1] ?? '') === CURRENT_FILE) {
  cli();
}