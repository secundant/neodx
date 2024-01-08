import { False, memoize, type Nil, test, toArray, True } from '@neodx/std';
import { convert } from './parsers/convert';
import { normalize } from './parsers/normalize';
import { inlineChars } from './shared.ts';

export const matchGlob = (glob: string | string[], path: string) => createGlobMatcher(glob)(path);
export const globToRegExp = (glob: string) => new RegExp(`^${convert(normalize(glob))}$`, 's');

export function createGlobMatcher(glob: string | string[]) {
  const patterns = toArray(glob);
  const matchers = patterns.map(createGlobPatternMatch);
  const shouldKeepTrailingSlash = patterns.every(glob => /(\/(?:\*\*)?|\[\/])$/.test(glob));

  if (patterns.length === 0) return False;
  return (path: string) => {
    const normalizedPath = path
      .replaceAll(/[\\/]+/g, '/')
      .replace(/\/$/, shouldKeepTrailingSlash ? '/' : '');

    return matchers.some(matcher => matcher(normalizedPath));
  };
}

const createGlobPatternMatch = memoize((pattern: string) =>
  isAllPassGlob(pattern) ? True : tryCreateSimpleMatch(pattern) || test(globToRegExp(pattern))
);
const tryCreateSimpleMatch = (pattern: string) => {
  const match = pattern.match(simpleMatchRe);

  if (!match) return null;
  const { single, prefix = '', variants = single } = match.groups!;
  /** @example "**\/*.config.{js,ts}" -> [ ".config.js", ".config.ts" ] */
  const extensions = variants!.split(',').map(variant => `${prefix}${variant}`);

  return (path: string) =>
    extensions.some(extension => isMatchSimplePattern(path, extension, match[1]));
};

// **/*ext, **/ext, **/*{ext1,ext2}, etc.
const simpleMatchRe = new RegExp(
  `^\\*\\*\\/(\\*)?((?<single>(${inlineChars}+))|((?<prefix>(${inlineChars}*))\\{(?<variants>(${inlineChars}+(?:,${inlineChars}+)*))}))$`
);

const isPathSeparator = (char: string) => char === '/' || char === '\\';
/**
 * "Simple" pattern starts with glob and ends with some static part.
 * It could be either:
 * - **\/*.json
 * - *.json
 * - file.json
 * - **\/*.{json,ts}
 */
const isMatchSimplePattern = (path: string, extension: string, dynamic: boolean | string | Nil) =>
  path.endsWith(extension) &&
  (Boolean(dynamic) ||
    path.length === extension.length ||
    isPathSeparator(path.at(-(extension.length + 1))!));
const isAllPassGlob = (value: string) => !value || value === '**/*';
