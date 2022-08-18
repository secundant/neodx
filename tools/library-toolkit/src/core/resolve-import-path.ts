import { access, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

export const DEFAULT_RESOLVED_EXTENSION = ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'];

/**
 * Factory for customizing resolving. Probably will be changed/extended
 */
export function createImportResolver(extensions = DEFAULT_RESOLVED_EXTENSION) {
  return function resolver(target: string) {
    return resolveImportPath(target, extensions);
  };
}

/**
 * Resolves path without extension as full file path
 * @param target - your import path (ex. "./foo/bar")
 * @param extensions - ordered list of supported extensions (ex. [".js", ".mjs"])
 */
export async function resolveImportPath(target: string, extensions: string[]) {
  /**
   * Firstly we're trying to find relative path.
   * @example "./foo/bar" => "./foo/bar.tsx"
   * @example "/abs/.../foo/bar" => "/abs/.../foo/bar.js"
   */
  const relativeFilePath = await tryResolvePath(target, extensions, false);

  if (relativeFilePath) {
    return relativeFilePath;
  }
  const targetExists = await exists(target);
  const stats = targetExists ? await stat(target) : null;
  /**
   * If exists, just return
   * @example "./foo/bar.json" => "./foo/bar.json"
   */
  if (targetExists && stats?.isFile()) {
    return target;
  }
  if (targetExists && stats?.isDirectory()) {
    /**
     * If a directory, append it using index.<extension> to resolve
     * @example "./foo/bar" => "./foo/bar/index.ts"
     */
    const indexFilePath = await tryResolvePath(target, extensions, true);

    if (indexFilePath) {
      return indexFilePath;
    }
  }
  throw new Error(`Could not resolve "${target}"`);
}

async function tryResolvePath(target: string, extensions: string[], shouldResolveIndex = false) {
  for (const ext of extensions) {
    const path = shouldResolveIndex ? resolve(target, `index${ext}`) : `${target}${ext}`;

    if (await exists(path)) {
      return path;
    }
  }
  return null;
}

const exists = (path: string) =>
  access(path)
    .then(() => true)
    .catch(() => false);
