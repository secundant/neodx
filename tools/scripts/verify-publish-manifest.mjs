#!/usr/bin/env node
/**
 * Assert the on-disk publishable manifests have no `workspace:` after apply-all.
 *
 * That is the package.json npm copies into the registry packument. The tarball
 * gate (`verify-packed-manifest`) can be green while install still fails.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const rewrite = resolve(dirname(fileURLToPath(import.meta.url)), 'rewrite-workspace-protocol.mjs');
const SKIP = new Set(['@neodx/autobuild', '@neodx/codegen', '@neodx/internal']);
const DEP_FIELDS = ['dependencies', 'optionalDependencies', 'peerDependencies', 'devDependencies'];

const leakedRanges = pkg => {
  const hits = [];
  for (const field of DEP_FIELDS) {
    const deps = pkg[field];
    if (!deps || typeof deps !== 'object') continue;
    for (const [name, range] of Object.entries(deps)) {
      if (typeof range === 'string' && range.startsWith('workspace:')) {
        hits.push(`${field}.${name}=${range}`);
      }
    }
  }
  return hits;
};

const publishable = readdirSync(join(root, 'libs'), { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => join(root, 'libs', d.name, 'package.json'))
  .filter(existsSync)
  .map(pkgPath => ({ pkgPath, pkg: JSON.parse(readFileSync(pkgPath, 'utf8')) }))
  .filter(({ pkg }) => !pkg.private && !SKIP.has(pkg.name));

const apply = spawnSync(process.execPath, [rewrite, '--apply-all'], { stdio: 'inherit' });
if (apply.status !== 0) process.exit(apply.status ?? 1);

let failures = 0;
try {
  for (const { pkgPath, pkg } of publishable) {
    const manifest = JSON.parse(readFileSync(pkgPath, 'utf8'));
    const leaks = leakedRanges(manifest);
    if (leaks.length) {
      console.error(`✗ ${pkg.name}: apply-all left workspace: protocol`);
      for (const leak of leaks) console.error(`    ${leak}`);
      failures++;
    } else {
      console.log(`✓ ${pkg.name}: publish manifest has no workspace: protocol`);
    }
  }
} finally {
  spawnSync(process.execPath, [rewrite, '--restore-all'], { stdio: 'inherit' });
}

if (failures) {
  console.error(`\nverify-publish-manifest: ${failures} package(s) failed`);
  process.exit(1);
}

console.log(`\nverify-publish-manifest: ${publishable.length} publishable package(s) OK`);
