import { serializeJSON } from '@/utils/serialize-json';

/**
 * Tiny implementation of printf function.
 * Supports only "%s" (string) and "%d" (number).
 * @see https://github.com/floatdrop/pff
 * @example printf('%s in %ds.', ['Done', 12]) => "Done on 12s."
 */
export function printf(template: string, replaces: unknown[]) {
  const [leading, ...parts] = template.split('%');
  const { result } = parts.reduce(
    (acc, currentValue) => {
      const tokenName = currentValue[0] as keyof typeof tokenFormatters;

      if (Object.hasOwn(tokenFormatters, tokenName)) {
        acc.result.push(
          tokenFormatters[tokenName](replaces[acc.index]),
          currentValue.slice(tokenName.length)
        );
        acc.index++;
      } else {
        acc.result.push('%', currentValue);
      }
      return acc;
    },
    {
      index: 0,
      result: [leading] as unknown[]
    }
  );

  return result.join('');
}

const tokenFormatters = {
  s: (value: unknown) => String(value),
  d: (value: unknown) => Math.floor(Number(value)),
  o: serializeJSON,
  O: serializeJSON,
  j: serializeJSON
};
