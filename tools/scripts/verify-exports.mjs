#!/usr/bin/env node
/**
 * P-A: after `vp pack`, assert every publishable package export target exists on disk.
 * Skips private packages and the quarantined @neodx/autobuild package.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const libsDir = join(root, 'libs');

const SKIP = new Set(['@neodx/autobuild', '@neodx/codegen', '@neodx/internal']);

const collectTargets = (exportsField, acc = []) => {
  if (!exportsField) return acc;
  if (typeof exportsField === 'string') {
    acc.push(exportsField);
    return acc;
  }
  if (Array.isArray(exportsField)) {
    for (const item of exportsField) collectTargets(item, acc);
    return acc;
  }
  if (typeof exportsField === 'object') {
    for (const [key, value] of Object.entries(exportsField)) {
      if (key.startsWith('#')) continue;
      // Workspace-only source bridge — not a packed artifact.
      if (key === 'development') continue;
      collectTargets(value, acc);
    }
  }
  return acc;
};

const packages = readdirSync(libsDir, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => join(libsDir, d.name, 'package.json'))
  .filter(existsSync)
  .map(pkgPath => {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    return { pkgPath, dir: dirname(pkgPath), pkg };
  })
  .filter(({ pkg }) => !pkg.private && !SKIP.has(pkg.name));

let failures = 0;

for (const { dir, pkg } of packages) {
  const targets = [...new Set(collectTargets(pkg.exports))];
  if (targets.length === 0) {
    console.error(`✗ ${pkg.name}: no exports map`);
    failures++;
    continue;
  }

  const missing = targets.filter(target => {
    if (typeof target !== 'string' || !target.startsWith('./')) return false;
    // Conditional export values that are conditions objects already flattened by collectTargets
    const abs = join(dir, target);
    return !existsSync(abs);
  });

  if (missing.length) {
    console.error(`✗ ${pkg.name}: missing ${missing.length} export target(s)`);
    for (const m of missing.slice(0, 20)) console.error(`    ${m}`);
    if (missing.length > 20) console.error(`    … +${missing.length - 20} more`);
    failures++;
  } else {
    console.log(`✓ ${pkg.name}: ${targets.length} export targets present`);
  }
}

if (failures) {
  console.error(`\nverify-exports: ${failures} package(s) failed`);
  process.exit(1);
}

console.log(`\nverify-exports: ${packages.length} publishable package(s) OK`);
