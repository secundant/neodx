#!/usr/bin/env node
/**
 * #164: run Are-the-Types-Wrong against packed publishable libs, after pack.
 * `--pack` builds the tarball from dist/ and analyzes it — the same layout npm
 * consumers receive.
 *
 * `--profile node16` checks node16 (from CJS and ESM) and bundler resolutions,
 * ignoring node10: subpaths of an exports-map package cannot resolve under
 * node10, so gating on it would stay permanently red for every multi-entry
 * package regardless of dts correctness.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const libsDir = join(root, 'libs');
const attwBin = join(root, 'node_modules', '.bin', 'attw');
const SKIP = new Set(['@neodx/autobuild', '@neodx/codegen', '@neodx/internal']);

const packages = readdirSync(libsDir, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => join(libsDir, d.name))
  .filter(dir => existsSync(join(dir, 'package.json')))
  .map(dir => {
    const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
    return { dir, pkg };
  })
  .filter(({ pkg }) => !pkg.private && !SKIP.has(pkg.name));

let errorCount = 0;

for (const { dir, pkg } of packages) {
  if (!existsSync(join(dir, 'dist'))) {
    console.error(`✗ ${pkg.name}: dist/ missing — pack before attw`);
    errorCount++;
    continue;
  }

  const args = ['--pack', '--profile', 'node16', '--no-emoji'];
  const result = spawnSync(attwBin, args, { cwd: dir, encoding: 'utf8' });

  if (result.status === 0) {
    console.log(`✓ ${pkg.name}`);
  } else {
    console.error(`✗ ${pkg.name}: attw failed (exit ${result.status})`);
    console.error(result.stdout?.trim());
    errorCount++;
  }
}

if (errorCount) {
  console.error(`\nattw-libs: ${errorCount} package(s) failed`);
  process.exit(1);
}

console.log(`\nattw-libs: ${packages.length} package(s) OK`);
