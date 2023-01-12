import { dirname, extname } from 'node:path';
import type { ModuleFormat } from '../types';

export const toRegExpPart = (ext: string | RegExp) =>
  ext instanceof RegExp ? ext.source : escapeString(ext);

export const rootDirname = (path: string): string => {
  const dir = dirname(path);

  return dirname(dir) === emptyDirname ? dir : rootDirname(dir);
};

export const haveExtension = (path: string, ext: string) =>
  extname(path) === `.${ext.replace(/^\./, '')}`;

export const getModuleFormat = (path: string, fallback: ModuleFormat): ModuleFormat =>
  haveExtension(path, 'cjs') ? 'cjs' : haveExtension(path, 'mjs') ? 'esm' : fallback;

const escapeString = (value: string) =>
  value.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d');

const emptyDirname = dirname('');
