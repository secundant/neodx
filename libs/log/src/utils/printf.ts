import { hasOwn } from '@neodx/std';
import { serializeJSON } from './serialize-json';

/**
 * Tiny implementation of printf function.
 * Supports only "%s" (string) and "%d" (number).
 * @see https://github.com/floatdrop/pff
 * @example printf('%s in %ds.', ['Done', 12]) => "Done on 12s."
 */
export function printf(template: string, replaces: unknown[]) {
  const currentReplaces = Array.from(replaces);
  const [leading, ...parts] = template.split('%');
  const result = parts.reduce(
    (acc, part) => {
      const tokenName = part[0];
      const format = hasOwn(tokenFormatters, tokenName) ? tokenFormatters[tokenName] : null;

      acc.push(format ? format(currentReplaces.shift()) : '%');
      acc.push(format ? part.slice(tokenName.length) : part);
      return acc;
    },
    [leading] as unknown[]
  );

  return result.join('');
}

const tokenFormatters = {
  s: (value: unknown) => String(value),
  d: (value: unknown) => Math.floor(Number(value)),
  i: (value: unknown) => Number.parseInt(String(value), 10),
  f: (value: unknown) => Number.parseFloat(String(value)),
  o: serializeJSON,
  O: serializeJSON,
  j: serializeJSON
};
