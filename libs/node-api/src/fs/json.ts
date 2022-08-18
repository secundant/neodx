import { readFile, writeFile } from 'fs/promises';

export const readJsonFile = <T = unknown>(path: string) =>
  readFile(path, 'utf-8').then(JSON.parse) as Promise<T>;

export const writeJsonFile = (path: string, content: any) =>
  writeFile(path, JSON.stringify(content), 'utf-8');
