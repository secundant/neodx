import { isFile } from '@neodx/fs';
import { resolve } from 'pathe';
import type { Options } from 'prettier';

export interface TransformPrettierOptions {
  (path: string, options: Options): Partial<Options> | void;
}

/**
 * Tries to format a file with prettier and returns the formatted content or null if it fails.
 * @param path Path to the file
 * @param content Content of the file
 * @param transform Optional function to transform prettier options
 * @return Formatted content or null if it fails or the file is ignored
 * @example
 * tryFormatPrettier('package.json', JSON.stringify({ a: 1, b: 2 }, null, 2));
 * // {
 * //   "a": 1,
 * //   "b": 2
 * // }
 * tryFormatPrettier('src/index.ts', 'const a=11,b=22;');
 * // const a = 11;
 * // const b = 22;
 * tryFormatPrettier('ignored.ts', 'const a=11,b=22;');
 * // null
 */
export async function tryFormatPrettier(
  path: string,
  content: string,
  transform: TransformPrettierOptions = markSwcRcAsJson
) {
  const prettier = await tryImportPrettier();

  if (!prettier) {
    return null;
  }
  const configPath = await prettier.resolveConfigFile(path);
  // TODO: Cache .prettierignore lookup
  const possibleIgnorePath = configPath && resolve(configPath, '../.prettierignore');
  const resolvedOptions = await prettier.resolveConfig(path, {
    editorconfig: true
  });

  if (!resolvedOptions) {
    return null;
  }
  const prettierOptions: Options = {
    filepath: path,
    ...resolvedOptions
  };

  Object.assign(prettierOptions, transform(path, prettierOptions));
  const support = await prettier.getFileInfo(path, {
    ignorePath:
      possibleIgnorePath && (await isFile(possibleIgnorePath)) ? possibleIgnorePath : undefined
  });

  if (support.ignored || !support.inferredParser) {
    return null;
  }
  try {
    return prettier.format(content, prettierOptions);
  } catch (error) {
    if (!(error instanceof Error)) {
      throw error;
    }
    console.warn(`Could not format ${path} with prettier. Error: "${error.message}"`);
    return null;
  }
}

const tryImportPrettier = () => import('prettier').then(module => module.default).catch(() => null);

const markSwcRcAsJson = (path: string) => (path.endsWith('.swcrc') ? { parser: 'json' } : {});
