import { deepReadDir } from '@neodx/fs';
import { compactObject, mapObject } from '@neodx/std';
import type { VFS } from '@neodx/vfs';
import { resolve } from 'node:path';
import type { ExportsField, ProjectPackageJSON } from '../types';

export interface FlattenDistParams {
  vfs: VFS;
  outDir?: string;
}

export async function flattenDist({ vfs, outDir = 'dist' }: FlattenDistParams) {
  const files = await deepReadDir(resolve(vfs.root, outDir), {
    absolute: false
  });

  for (const file of files) {
    await vfs.write(file, await vfs.read(`./${outDir}/${file}`));
  }
  await vfs.delete(outDir);
  await vfs.updateJson<ProjectPackageJSON>('package.json', ({ exports, ...packageJson }) => {
    const newExports = flattenExports(exports ?? {}, outDir);

    return {
      ...packageJson,
      ...compactObject(
        Object.fromEntries(
          packageJsonEntryFields.map(field => {
            const value = packageJson[field];

            return [field, value && removePrefix(value, outDir)] as const;
          })
        )
      ),
      files: [
        ...files,
        ...(packageJson.files?.filter(
          (file: string) => !file.match(new RegExp(`^(./)?${outDir}`))
        ) ?? [])
      ],
      exports: {
        ...(typeof newExports === 'string' ? { '.': newExports as `./${string}` } : newExports),
        './package.json': './package.json' as const
      }
    };
  });
}

function flattenExports(exportsValue: ExportsField, outDir: string): ExportsField {
  if (typeof exportsValue === 'string') {
    return removePrefix(exportsValue, outDir);
  }
  return mapObject(exportsValue, value => flattenExports(value as any, outDir)) as ExportsField;
}

const removePrefix = (original: string, outDir: string) =>
  original.replace(new RegExp(`^(./)?${outDir}/`), './');

const packageJsonEntryFields = [
  'main',
  'module',
  'browser',
  'types',
  'umd:main',
  'typings'
] as const;
