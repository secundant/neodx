#!/usr/bin/env node
/**
 * Rewrite Yarn `workspace:` ranges to registry versions for npm pack/publish.
 *
 * Source manifests keep `workspace:^`. `yarn pack` already rewrites them;
 * `changeset publish` uses npm, which does not. prepack/postpack close that gap
 * without leaving the worktree rewritten.
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

const prepack = pkgDir => {
  if (!isNpmPackPublish()) return;
  const pkgPath = join(pkgDir, 'package.json');
  const original = readFileSync(pkgPath, 'utf8');
  const { next, changed } = rewriteManifest(JSON.parse(original), collectWorkspaceVersions());
  if (!changed) return;
  writeFileSync(backupPathFor(pkgDir), original);
  writeFileSync(pkgPath, `${JSON.stringify(next, null, 2)}\n`);
};

const postpack = pkgDir => {
  const backup = backupPathFor(pkgDir);
  if (!existsSync(backup)) return;
  writeFileSync(join(pkgDir, 'package.json'), readFileSync(backup, 'utf8'));
  rmSync(backup);
};

const flag = process.argv[2];
const pkgDir = process.cwd();

if (flag === '--prepack') {
  prepack(pkgDir);
} else if (flag === '--postpack') {
  postpack(pkgDir);
} else {
  console.error('usage: rewrite-workspace-protocol.mjs --prepack|--postpack');
  process.exit(1);
}
