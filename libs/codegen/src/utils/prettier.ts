import type { Options } from 'prettier';
import prettier from 'prettier';

export interface TransformPrettierOptions {
  (path: string, options: Options): Partial<Options> | void;
}

export async function tryFormatPrettier(
  path: string,
  content: string,
  transform: TransformPrettierOptions = markSwcRcAsJson
) {
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
  const support = await prettier.getFileInfo(path);

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

const markSwcRcAsJson = (path: string) => (path.endsWith('.swcrc') ? { parser: 'json' } : {});
