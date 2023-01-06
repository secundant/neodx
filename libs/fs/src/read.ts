import { readdir } from 'fs/promises';
import { join } from 'path';
import { isDirectory } from './checks';

export async function deepReadDir(path: string): Promise<string[]> {
  const childrenNames = await readdir(path);
  const result = await Promise.all(
    childrenNames.map(async childName => {
      const childPath = join(path, childName);

      return (await isDirectory(childPath)) ? deepReadDir(childPath) : [childPath];
    })
  );

  return result.flat();
}
