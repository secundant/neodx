import type { Options } from 'prettier';
import prettier from 'prettier';

export async function tryFormatPrettier(path: string, content: string) {
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

  if (path.endsWith('.swcrc')) {
    prettierOptions.parser = 'json';
  }
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
    console.warn(`Could not format ${prettierOptions} with prettier. Error: "${error.message}"`);
    return null;
  }
}
