import { render } from 'ejs';
import { readFile } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';
import type { Tree } from '@/tree';
import { has, uniq } from '@/utils/core';
import { deepReadDir } from '@/utils/node-api';

export async function generateFiles(
  tree: Tree,
  sourcePath: string,
  outputPath: string,
  variables: Record<string, unknown>
) {
  const files = await deepReadDir(sourcePath);

  if (files.length === 0) {
    throw new Error(
      `No files found in "${sourcePath}". Are you sure you specified the correct path?`
    );
  }
  await Promise.all(
    files.map(async filePath => {
      const outputFilePath = join(
        outputPath,
        injectTemplateVariables(relative(sourcePath, filePath), variables)
      );
      const content = binaryExtensions.has(extname(outputFilePath))
        ? await readFile(filePath)
        : await renderTemplateFromFile(filePath, variables);

      await tree.write(outputFilePath, content);
    })
  );
}

export function injectTemplateVariables(template: string, variables: Record<string, unknown>) {
  const names = uniq(Array.from(template.matchAll(/\[(\w+)]/gi)).map(([_, name]) => name));
  const missed = names.filter(name => !has(variables, name));

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

const renderTemplateFromFile = async (path: string, variables: Record<string, unknown>) => {
  const content = await readFile(path, 'utf-8');

  return render(content, variables, { async: true });
};

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
