const DEFAULT_DELIMITERS = 'A-Z\\s_-';

function matches(str: string, delimiters = DEFAULT_DELIMITERS): string[] {
  const regex = new RegExp('([A-Z]?)([^' + delimiters + ']*)', 'g');

  return str.match(regex)?.filter(Boolean) ?? [];
}

function toCase(letter: string, str: string): string {
  if (letter === '-') return '';
  if (letter === '*') return str;
  const isUpperCase = letter === letter.toUpperCase();

  return isUpperCase ? str.toUpperCase() : str.toLowerCase();
}

const applyPattern = (str: string, pattern: string) =>
  toCase(pattern[0], str[0]) + toCase(pattern[1], str.slice(1));

export function casex(str: string, pattern: string, delimiters?: string) {
  const end = pattern.slice(Math.max(0, pattern.length - 2));
  const glue = pattern.slice(2, -2);
  const start = pattern.slice(0, 2);

  return matches(str, delimiters)
    .map((match, index) => applyPattern(match, index === 0 ? start : end))
    .join(glue);
}
