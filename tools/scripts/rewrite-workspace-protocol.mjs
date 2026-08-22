#!/usr/bin/env node
/**
 * Rewrite Yarn `workspace:` ranges to registry versions for npm pack/publish.
 *
 * Source manifests keep `workspace:^`. `yarn pack` already rewrites them;
 * `changeset publish` uses npm, which does not. Two npm surfaces diverge:
 * prepack rewrites the tarball; `--apply-all` must run before publish so the
 * registry packument matches (npm install reads packument, not the tarball).
 * `postpack` must not restore during `npm publish` — npm reads package.json
 * for the packument after postpack (1.0.1–1.0.2 leaked that way).
 *
 * The same rewrite strips source-bridge exports (#180): `files` ships `dist`
 * only, so the `development` condition and all-`src` subpaths (`vfs/testing`)
 * would point at files consumers cannot have. npm does not apply
 * `publishConfig.exports`, so the strip must ride this on-disk path too.
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const DEP_FIELDS = ['dependencies', 'optionalDependencies', 'peerDependencies', 'devDependencies'];

const collectWorkspaceVersions = () => {
  const versions = new Map();
  const walk = dir => {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name.startsWith('.')) {
        continue;
      }
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(path);
        continue;
      }
      if (entry.name !== 'package.json') continue;
      const pkg = JSON.parse(readFileSync(path, 'utf8'));
      if (pkg.name && pkg.version) versions.set(pkg.name, pkg.version);
    }
  };
  walk(join(root, 'libs'));
  return versions;
};

const registryRange = (spec, version) => {
  if (spec === '*') return version;
  if (spec === '^' || spec === '~') return `${spec}${version}`;
  return spec;
};

// Subpath keys always start with `.` or `#`, so a `development` key is a
// condition at any depth, never a subpath name.
const stripSourceBridges = value => {
  if (Array.isArray(value)) return value.map(stripSourceBridges);
  if (!value || typeof value !== 'object') return value;
  const next = {};
  for (const [key, entry] of Object.entries(value)) {
    if (key === 'development') continue;
    next[key] = stripSourceBridges(entry);
  }
  return next;
};

const isSourceBridge = value => {
  if (typeof value === 'string') return value.startsWith('./src/');
  if (Array.isArray(value)) return value.every(isSourceBridge);
  if (value && typeof value === 'object') return Object.values(value).every(isSourceBridge);
  return false;
};

const stripExportSourceBridges = exportsField => {
  if (!exportsField || typeof exportsField !== 'object' || Array.isArray(exportsField)) {
    return exportsField;
  }
  const next = {};
  for (const [subpath, entry] of Object.entries(exportsField)) {
    if (isSourceBridge(entry)) continue;
    next[subpath] = stripSourceBridges(entry);
  }
  return next;
};

const rewriteManifest = (pkg, versions) => {
  let changed = false;
  const next = { ...pkg };
  for (const field of DEP_FIELDS) {
    const deps = pkg[field];
    if (!deps || typeof deps !== 'object') continue;
    const rewritten = { ...deps };
    let fieldChanged = false;
    for (const [name, range] of Object.entries(deps)) {
      if (typeof range !== 'string' || !range.startsWith('workspace:')) continue;
      const version = versions.get(name);
      if (!version) {
        throw new Error(`Cannot rewrite ${field}.${name}=${range}: workspace version not found`);
      }
      rewritten[name] = registryRange(range.slice('workspace:'.length), version);
      fieldChanged = true;
    }
    if (fieldChanged) {
      next[field] = rewritten;
      changed = true;
    }
  }
  if (pkg.exports) {
    const stripped = stripExportSourceBridges(pkg.exports);
    if (JSON.stringify(stripped) !== JSON.stringify(pkg.exports)) {
      next.exports = stripped;
      changed = true;
    }
  }
  return { next, changed };
};

const backupPathFor = pkgDir => {
  const id = createHash('sha1').update(pkgDir).digest('hex');
  const dir = join(tmpdir(), 'neodx-workspace-protocol');
  mkdirSync(dir, { recursive: true });
  return join(dir, `${id}.json`);
};

// `vp run pack` also runs the `prepack` script name. Only npm pack/publish
// need a rewrite; Yarn already substitutes workspace: in its own tarball.
const isNpmPackPublish = () => {
  const command = process.env.npm_command;
  return command === 'pack' || command === 'publish';
};

const SKIP = new Set(['@neodx/autobuild', '@neodx/codegen', '@neodx/internal']);

const publishableDirs = () =>
  readdirSync(join(root, 'libs'), { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => join(root, 'libs', d.name))
    .filter(dir => existsSync(join(dir, 'package.json')))
    .filter(dir => {
      const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
      return !pkg.private && !SKIP.has(pkg.name);
    });

const rewriteOnDisk = pkgDir => {
  const pkgPath = join(pkgDir, 'package.json');
  const original = readFileSync(pkgPath, 'utf8');
  const { next, changed } = rewriteManifest(JSON.parse(original), collectWorkspaceVersions());
  if (!changed) return;
  writeFileSync(backupPathFor(pkgDir), original);
  writeFileSync(pkgPath, `${JSON.stringify(next, null, 2)}\n`);
};

const restoreOnDisk = pkgDir => {
  const backup = backupPathFor(pkgDir);
  if (!existsSync(backup)) return;
  writeFileSync(join(pkgDir, 'package.json'), readFileSync(backup, 'utf8'));
  rmSync(backup);
};

const prepack = pkgDir => {
  if (!isNpmPackPublish()) return;
  rewriteOnDisk(pkgDir);
};

const applyAll = () => {
  for (const dir of publishableDirs()) rewriteOnDisk(dir);
};

const restoreAll = () => {
  for (const dir of publishableDirs()) restoreOnDisk(dir);
};

const flag = process.argv[2];
const pkgDir = process.cwd();

if (flag === '--prepack') {
  prepack(pkgDir);
} else if (flag === '--postpack') {
  // `npm pack` should leave source as workspace:^. `npm publish` must keep
  // the rewritten file until the release wrapper restores after upload.
  if (process.env.npm_command !== 'publish') restoreOnDisk(pkgDir);
} else if (flag === '--apply-all') {
  applyAll();
} else if (flag === '--restore-all') {
  restoreAll();
} else {
  console.error(
    'usage: rewrite-workspace-protocol.mjs --prepack|--postpack|--apply-all|--restore-all'
  );
  process.exit(1);
}
