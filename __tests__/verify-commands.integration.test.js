import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import { runVerification } from '../lib/verification.js';

async function createRepository() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'cmd-verify-repo-'));
  const docsDir = path.join(root, 'docs');
  await fs.mkdir(docsDir, { recursive: true });
  await fs.writeFile(path.join(docsDir, 'guide.md'), '```bash\nnpm test\n```');
  await fs.writeFile(path.join(root, 'command-verify.config.json'), JSON.stringify({
    knowledgeBasePath: null,
    cacheDir: '.cache',
  }));

  execSync('git init', { cwd: root, stdio: 'ignore' });
  execSync('git config user.email tester@example.com', { cwd: root });
  execSync('git config user.name Tester', { cwd: root });
  execSync('git add .', { cwd: root, stdio: 'ignore' });
  execSync('git commit -m "initial"', { cwd: root, stdio: 'ignore' });

  return root;
}

describe('Command verifier integration', () => {
  let repo;

  beforeEach(async () => {
    repo = await createRepository();
  });

  afterEach(async () => {
    if (!repo) return;
    await fs.rm(repo, { recursive: true, force: true });
  });

  it('runs verification and reuses cache on subsequent runs', async () => {
    const first = await runVerification({ cwd: repo, args: ['--silent'] });
    expect(first.results).toHaveLength(1);
    expect(first.results[0].validation.category).toBeDefined();
    expect(first.summary.cache.misses).toBeGreaterThan(0);

    const second = await runVerification({ cwd: repo, args: ['--silent'] });
    expect(second.summary.cache.hits).toBeGreaterThanOrEqual(1);
    expect(second.summary.cache.misses).toBe(0);
  });
});
