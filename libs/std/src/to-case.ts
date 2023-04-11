const createCase =
  (pattern: string) =>
  (input: string, delimiters = DEFAULT_DELIMITERS) =>
    toCase(input, pattern, delimiters);

/**
 * Converts a string to a specified case pattern.
 * @param input The string to convert.
 * @param pattern The pattern to convert to.
 * @param delimiters The delimiters to use when splitting the string.
 * @example toCase('foo-bar baz', 'CaSe') // PascalCase 'FooBarBaz'
 * @example toCase('foo_bar baz', 'caSe') // camelCase 'fooBarBaz'
 * @example toCase('foo_bar baz', 'CASE') // upper case 'FOOBARBAZ'
 * @example toCase('foo_bar baz', 'case') // lower case 'foobarbaz'
 * @example toCase('foo_bar baz', 'CA_SE') // screaming snake case 'FOO_BAR_BAZ'
 * @example toCase('foo_bar baz', 'ca-se') // kebab case 'foo-bar-baz'
 * @example toCase('foo_bar baz', 'ca_se') // snake case 'foo_bar_baz'
 * @example toCase('foo_bar baz', 'Case') // capitalised 'Foobarbaz'
 */
export function toCase(input: string, pattern: string, delimiters = DEFAULT_DELIMITERS) {
  const end = pattern.slice(Math.max(0, pattern.length - 2));
  const sep = pattern.slice(2, -2);
  const start = pattern.slice(0, 2);

  return matches(input, delimiters)
    .map((match, index) => applyPattern(match, index === 0 ? start : end))
    .join(sep);
}

/**
 * Presets for common cases.
 */
export const cases = {
  camel: createCase('caSe'),
  kebab: createCase('ca-se'),
  snake: createCase('ca_se'),
  upper: createCase('CASE'),
  lower: createCase('case'),
  pascal: createCase('CaSe'),
  capital: createCase('Case'),
  screamingSnake: createCase('CA_SE')
};

const applyPattern = (str: string, pattern: string) =>
  apply(pattern[0], str[0]) + apply(pattern[1], str.slice(1));

function matches(str: string, delimiters: string): string[] {
  const regex = new RegExp('([A-Z]?)([^' + delimiters + ']*)', 'g');

  return str.match(regex)?.filter(Boolean) ?? [];
}

function apply(letter: string, str: string): string {
  if (letter === '-') return '';
  if (letter === '*') return str;
  const isUpperCase = letter === letter.toUpperCase();

  return isUpperCase ? str.toUpperCase() : str.toLowerCase();
}

const DEFAULT_DELIMITERS = 'A-Z\\s_-';
