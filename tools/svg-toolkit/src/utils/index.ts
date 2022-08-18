import { access, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { Options } from 'prettier';

export const ensureUpward = (path: string) => ensure(dirname(path));
export const ensure = (path: string): Promise<void> =>
  access(path).catch(() => ensureUpward(path).then(() => mkdir(path)));

export async function prettify(path: string, content: string, options?: Options) {
  const prettier = await import('prettier').then(module => module.default).catch(() => null);

  if (prettier) {
    const prettierConfig = await prettier.resolveConfig(path, {
      editorconfig: true
    });

    return prettier.format(content, {
      ...prettierConfig,
      ...options
    });
  }
  return content;
}

export async function asyncReduce<T, R>(
  list: T[],
  reducer: (acc: R, item: T, index: number) => R | Promise<R>,
  initialValue: R
): Promise<R> {
  return list.reduce(
    (accPromise, item, index) => accPromise.then(acc => reducer(acc, item, index)),
    Promise.resolve(initialValue)
  );
}

export const isTruthy = <T>(value: T | Falsy): value is T => Boolean(value);

export type Falsy = 0 | '' | false | null | undefined;
