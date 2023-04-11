export { assertDir, assertFile, exists, isDirectory, isFile, isValidStats } from './checks';
export { ensureDir, ensureFile } from './ensure';
export type { ParseJsonParams, SerializeJsonParams } from './json';
export { parseJson, serializeJson } from './json';
export { deepReadDir } from './read';
export type { ScanParams } from './scan';
export { scan } from './scan';

// re-exported from fs/promises

export {
  access,
  appendFile,
  chmod,
  chown,
  copyFile,
  cp,
  lstat,
  mkdir,
  mkdtemp,
  opendir,
  readdir,
  readFile,
  rename,
  rm,
  stat,
  unlink,
  watch,
  writeFile
} from 'node:fs/promises';
