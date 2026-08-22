#!/usr/bin/env node
/**
 * Run `changeset publish` against on-disk manifests that already use registry
 * versions. npm records packument dependencies from those files, not from the
 * tarball that prepack rewrites.
 */
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const rewrite = resolve(here, 'rewrite-workspace-protocol.mjs');

const run = args => {
  const result = spawnSync(process.execPath, args, { stdio: 'inherit' });
  if (result.status !== 0) {
    throw new Error(`${args.join(' ')} exited ${result.status ?? 'null'}`);
  }
};

run([rewrite, '--apply-all']);
try {
  const published = spawnSync('yarn', ['changeset', 'publish', ...process.argv.slice(2)], {
    stdio: 'inherit'
  });
  process.exitCode = published.status ?? 1;
} finally {
  spawnSync(process.execPath, [rewrite, '--restore-all'], { stdio: 'inherit' });
}
