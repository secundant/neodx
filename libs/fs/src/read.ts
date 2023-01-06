import { readdir } from 'fs/promises';
import { join, relative } from 'path';
import { isDirectory } from './checks';

interface Params {
  absolute?: boolean;
}

export async function deepReadDir(
  path: string,
  { absolute = true }: Params = {}
): Promise<string[]> {
  const childrenNames = await readdir(path);
  const groupedPaths = await Promise.all(
    childrenNames.map(async childName => {
      const childPath = join(path, childName);

      return (await isDirectory(childPath)) ? deepReadDir(childPath) : [childPath];
    })
  );
  const absolutePathsList = groupedPaths.flat();

  return absolute ? absolutePathsList.map(name => relative(path, name)) : absolutePathsList;
}
