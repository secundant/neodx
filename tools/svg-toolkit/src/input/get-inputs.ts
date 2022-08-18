import { basename, resolve } from 'node:path';
import glob from 'tiny-glob';

export async function getInputs(cwd: string, include: string[]) {
  const filesLists = await Promise.all(
    include.map(pattern =>
      glob(pattern, {
        cwd,
        filesOnly: true
      })
    )
  );

  return filesLists.flat().map(path => createInput(path, cwd));
}

const createInput = (path: string, cwd: string) => ({
  absolutePath: resolve(cwd, path),
  path,
  name: basename(path, '.svg')
});

export type Input = ReturnType<typeof createInput>;
