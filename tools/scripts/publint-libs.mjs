#!/usr/bin/env node
/**
 * Run publint against packed publishable libs. Fail the process on errors.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { publint } from 'publint';
import { formatMessage } from 'publint/utils';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const libsDir = join(root, 'libs');
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
    console.error(`✗ ${pkg.name}: dist/ missing — pack before publint`);
    errorCount++;
    continue;
  }

  const { messages } = await publint({ pkgDir: dir, level: 'error' });
  const errors = messages.filter(m => m.type === 'error');
  const warnings = messages.filter(m => m.type === 'warning');

  if (errors.length) {
    console.error(`✗ ${pkg.name}: ${errors.length} publint error(s)`);
    for (const message of errors) {
      console.error(`    ${formatMessage(message, pkg) ?? message.code}`);
    }
    errorCount += errors.length;
  } else {
    console.log(
      `✓ ${pkg.name}${warnings.length ? ` (${warnings.length} warning(s) ignored at level=error)` : ''}`
    );
  }
}

if (errorCount) {
  console.error(`\npublint-libs: ${errorCount} error(s)`);
  process.exit(1);
}

console.log(`\npublint-libs: ${packages.length} package(s) OK`);
