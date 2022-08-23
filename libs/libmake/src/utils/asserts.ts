import { extname } from 'node:path';
import type { ModuleFormat } from '../types';

export const haveExtension = (path: string, ext: string) =>
  extname(path) === `.${ext.replace(/^\./, '')}`;

export const getModuleFormat = (path: string, fallback: ModuleFormat): ModuleFormat =>
  haveExtension(path, 'cjs') ? 'cjs' : haveExtension(path, 'mjs') ? 'esm' : fallback;
