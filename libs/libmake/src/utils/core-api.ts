export const toArray = <T>(value: T | T[]) => (Array.isArray(value) ? value : [value]);

export const compact = <T>(list: Array<T | null | '' | 0 | void | false | undefined>): T[] =>
  list.filter(Boolean) as any;

export const toRegExpPart = (ext: string | RegExp) =>
  ext instanceof RegExp ? ext.source : escapeString(ext);

const escapeString = (value: string) =>
  value.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d');
