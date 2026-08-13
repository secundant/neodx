#!/usr/bin/env node
/**
 * Drift gate: package.json workspace deps ↔ tsconfig.build.json references.
 *
 * Soft edges (no project reference required — would form a TS reference cycle;
 * both sides stay in the root solution and resolve via package exports):
 *   @neodx/internal ↔ @neodx/vfs
 *
 * Usage:
 *   node tools/scripts/check-references.mjs
 *   node tools/scripts/check-references.mjs --check
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const checkOnly = process.argv.includes('--check');

/** Every lib under libs/ that participates in the root solution. */
const COMPOSITE = new Set([
  'std',
  'colors',
  'fs',
  'log',
  'glob',
  'pkg-misc',
  'vfs',
  'internal',
  'svg',
  'figma',
  'codegen',
  'autobuild'
]);

/** Undirected soft pairs — declared deps OK, references intentionally omitted. */
const SOFT_PAIRS = new Set(['internal|vfs', 'vfs|internal']);

function softKey(a, b) {
  return `${a}|${b}`;
}

function readJson(p) {
  return JSON.parse(readFileSync(p, 'utf8'));
}

function pkgNameToFolder(name) {
  return name.replace('@neodx/', '');
}

function workspaceNeodxDeps(pkg) {
  const out = new Set();
  for (const section of ['dependencies', 'peerDependencies']) {
    for (const [name, range] of Object.entries(pkg[section] || {})) {
      if (!name.startsWith('@neodx/')) continue;
      if (typeof range === 'string' && range.startsWith('workspace:')) {
        out.add(name);
      }
    }
  }
  return out;
}

let failed = false;
const libsRoot = join(root, 'libs');

for (const folder of [...COMPOSITE].sort()) {
  const pkgPath = join(libsRoot, folder, 'package.json');
  const tsPath = join(libsRoot, folder, 'tsconfig.build.json');
  if (!existsSync(pkgPath) || !existsSync(tsPath)) {
    console.error(`missing package or tsconfig.build.json for ${folder}`);
    failed = true;
    continue;
  }
  const pkg = readJson(pkgPath);
  const ts = readJson(tsPath);
  const depFolders = new Set(
    [...workspaceNeodxDeps(pkg)]
      .map(pkgNameToFolder)
      .filter(f => COMPOSITE.has(f) && f !== folder)
      .filter(f => !SOFT_PAIRS.has(softKey(folder, f)))
  );
  const refFolders = new Set(
    (ts.references || [])
      .map(r => {
        const parts = r.path.replace(/\\/g, '/').split('/').filter(Boolean);
        return parts.find(p => COMPOSITE.has(p));
      })
      .filter(Boolean)
  );

  const missing = [...depFolders].filter(f => !refFolders.has(f)).sort();
  const extra = [...refFolders].filter(f => !depFolders.has(f)).sort();

  if (missing.length || extra.length) {
    failed = true;
    console.error(`@neodx/${folder}:`);
    if (missing.length) console.error(`  missing references: ${missing.join(', ')}`);
    if (extra.length) console.error(`  extra references: ${extra.join(', ')}`);
  } else if (!checkOnly) {
    console.log(`@neodx/${folder}: ok`);
  }
}

const rootTs = readJson(join(root, 'tsconfig.json'));
const rootRefs = new Set(
  (rootTs.references || [])
    .map(r => {
      const m = r.path.match(/libs\/([^/]+)/);
      return m?.[1];
    })
    .filter(Boolean)
);
const rootMissing = [...COMPOSITE].filter(f => !rootRefs.has(f)).sort();
const rootExtra = [...rootRefs].filter(f => !COMPOSITE.has(f)).sort();
if (rootMissing.length || rootExtra.length) {
  failed = true;
  console.error('root tsconfig.json:');
  if (rootMissing.length) console.error(`  missing: ${rootMissing.join(', ')}`);
  if (rootExtra.length) console.error(`  extra: ${rootExtra.join(', ')}`);
} else if (!checkOnly) {
  console.log('root solution: ok');
}

if (failed) {
  console.error('references drift detected');
  process.exit(1);
}

if (checkOnly) {
  console.log('references check passed');
}
