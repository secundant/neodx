import { cases, hasOwn, toCase, uniq } from '@neodx/std';
import type { Vfs } from '@neodx/vfs';
import { render } from 'ejs';
import { extname, join } from 'node:path';

export async function generateFiles(
  vfs: Vfs,
  sourcePath: string,
  outputPath: string,
  variables: Record<string, unknown>
) {
  const sourceVfs = vfs.child(sourcePath);
  const files = await sourceVfs.scan({
    filter: ({ dirent }) => dirent.isFile()
  });

  if (files.length === 0) {
    throw new Error(
      `No files found in "${sourcePath}". Are you sure you specified the correct path?`
    );
  }
  await Promise.all(
    files.map(async filePath => {
      const keepUntouched = keepFileUntouchedRe.test(filePath);
      const relativePath = filePath.replace(keepFileUntouchedRe, '');
      const outputFilePath = join(
        outputPath,
        keepUntouched ? relativePath : injectTemplateVariables(relativePath, variables)
      );
      const content =
        keepUntouched || binaryExtensions.has(extname(outputFilePath))
          ? await sourceVfs.read(filePath)
          : await render(
              await sourceVfs.read(filePath, 'utf-8'),
              {
                ...variables,
                $: {
                  toCase,
                  cases
                }
              },
              { async: true }
            );

      await vfs.write(outputFilePath, content);
    })
  );
}

export function injectTemplateVariables(template: string, variables: Record<string, unknown>) {
  const names = uniq(Array.from(template.matchAll(/\[(\w+)]/gi)).map(([_, name]) => name!));
  const missed = names.filter(name => !hasOwn(variables, name));

  if (missed.length > 0) {
    throw new Error(
      `Unknown variables found in "${template}", not found variables "${missed.join(
        ', '
      )}", got ${JSON.stringify(variables)}`
    );
  }
  return names.reduce(
    (acc, name) => acc.replaceAll(`[${name}]`, String(variables[name])),
    template.replace(templateExtensionRe, '')
  );
}

const keepFileUntouchedRe = /(\._keep_$)|(_keep_\.)/i;
const templateExtensionRe = /\.(ejs|tmpl|template)$/i;
const binaryExtensions = new Set([
  // // Image types originally from https://github.com/sindresorhus/image-type/blob/5541b6a/index.js
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.flif',
  '.cr2',
  '.tif',
  '.bmp',
  '.jxr',
  '.psd',
  '.ico',
  '.bpg',
  '.jp2',
  '.jpm',
  '.jpx',
  '.heic',
  '.cur',
  '.tgz',

  // Font files
  '.ttf',
  '.otf',
  '.woff',
  '.woff2',
  '.eot'
]);
