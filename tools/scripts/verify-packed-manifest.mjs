#!/usr/bin/env node
/**
 * After pack, assert publishable tarball manifests have no `workspace:` protocol
 * and no source-bridge exports (#180): `files` ships `dist` only, so a
 * `development` condition or all-`src` subpath would point at files consumers
 * cannot have, and every remaining export target must exist in the tarball.
 *
 * `changeset publish` uses npm, which does not rewrite Yarn workspace ranges.
 * `yarn pack` already does — this gate uses `npm pack` so it matches publish.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const libsDir = join(root, 'libs');
const SKIP = new Set(['@neodx/autobuild', '@neodx/codegen', '@neodx/internal']);
const DEP_FIELDS = ['dependencies', 'optionalDependencies', 'peerDependencies', 'devDependencies'];

const packages = readdirSync(libsDir, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => join(libsDir, d.name))
  .filter(dir => existsSync(join(dir, 'package.json')))
  .map(dir => {
    const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
    return { dir, pkg };
  })
  .filter(({ pkg }) => !pkg.private && !SKIP.has(pkg.name));

const leakedRanges = manifest => {
  const hits = [];
  for (const field of DEP_FIELDS) {
    const deps = manifest[field];
    if (!deps || typeof deps !== 'object') continue;
    for (const [name, range] of Object.entries(deps)) {
      if (typeof range === 'string' && range.startsWith('workspace:')) {
        hits.push(`${field}.${name}=${range}`);
      }
    }
  }
  return hits;
};

const developmentConditions = (exportsField, hits = []) => {
  if (Array.isArray(exportsField)) {
    exportsField.forEach(value => developmentConditions(value, hits));
  } else if (exportsField && typeof exportsField === 'object') {
    for (const [key, value] of Object.entries(exportsField)) {
      if (key === 'development') hits.push(key);
      else developmentConditions(value, hits);
    }
  }
  return hits;
};

const exportTargets = (exportsField, acc = []) => {
  if (typeof exportsField === 'string') {
    acc.push(exportsField);
  } else if (Array.isArray(exportsField)) {
    exportsField.forEach(value => exportTargets(value, acc));
  } else if (exportsField && typeof exportsField === 'object') {
    for (const [key, value] of Object.entries(exportsField)) {
      // `#imports` are internal package specifiers, not packed paths.
      if (key.startsWith('#')) continue;
      exportTargets(value, acc);
    }
  }
  return acc;
};

const packManifest = dir => {
  const dest = mkdtempSync(join(tmpdir(), 'neodx-packed-manifest-'));
  try {
    execFileSync('npm', ['pack', '--pack-destination', dest, '--silent'], {
      cwd: dir,
      stdio: ['ignore', 'pipe', 'pipe']
    });
    const tgz = readdirSync(dest).find(name => name.endsWith('.tgz'));
    if (!tgz) throw new Error(`npm pack produced no tarball in ${dest}`);
    const json = execFileSync('tar', ['-xOf', join(dest, tgz), 'package/package.json'], {
      encoding: 'utf8'
    });
    const files = execFileSync('tar', ['-tzf', join(dest, tgz)], { encoding: 'utf8' })
      .split('\n')
      .filter(Boolean);
    return { manifest: JSON.parse(json), files };
  } finally {
    rmSync(dest, { recursive: true, force: true });
  }
};

let failures = 0;

for (const { dir, pkg } of packages) {
  try {
    const { manifest, files } = packManifest(dir);
    const leaks = leakedRanges(manifest);
    const bridges = developmentConditions(manifest.exports);
    // `?query` fragments and `*` patterns are not literal packed paths.
    const missing = [...new Set(exportTargets(manifest.exports))].filter(
      target =>
        target.startsWith('./') &&
        !target.includes('*') &&
        !files.includes(`package/${target.slice(2).split('?')[0]}`)
    );
    if (leaks.length || bridges.length || missing.length) {
      console.error(`✗ ${pkg.name}: tarball manifest is not publish-shaped`);
      for (const leak of leaks) console.error(`    workspace: ${leak}`);
      for (const bridge of bridges) console.error(`    source bridge: exports ... ${bridge}`);
      for (const target of missing) console.error(`    target missing from tarball: ${target}`);
      failures++;
    } else {
      console.log(`✓ ${pkg.name}: packed manifest has no workspace: or source bridges`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`✗ ${pkg.name}: ${message}`);
    failures++;
  }
}

if (failures) {
  console.error(`\nverify-packed-manifest: ${failures} package(s) failed`);
  process.exit(1);
}

console.log(`\nverify-packed-manifest: ${packages.length} publishable package(s) OK`);
