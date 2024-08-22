import { type Awaitable, compact, concurrently, type Falsy, invariant, once } from '@neodx/std';
import { z } from 'zod';
import { compare } from '../intl.ts';
import { parseAs, StringListSchema } from '../zod.ts';
import type { CacheContext } from './context.ts';

export interface Hasher {
  /**
   * Add new input to the hasher.
   * It will be available for the next call to `.get()` method.
   *
   * @example
   * hasher.add({ type: 'npm', name: ['@neodx/log'] });
   * hasher.add({ type: 'file', path: ['package.json'] });
   * hasher.add({ type: 'env', name: ['NODE_ENV'] });
   * hasher.add({ type: 'hash', value: '123' }, { type: 'hash', value: '456' });
   */
  add: (...input: AnyHashInput[]) => Promise<void>;
  get: () => Promise<string>;
  fork: () => Promise<Hasher>;
}

/**
 * Hashes multiple inputs and returns a unique hash for the current environment.
 *
 * Supported inputs:
 * - `env:VAR_NAME` - Environment variable value
 * - `npm:package-name` - NPM dependency version in "dependencies" or "peerDependencies" section
 * - `file:path/to/file` - File content. Path could be relative to the passed `vfs` or an absolute path
 * - `hash:any-string` - Custom hash, can be anything
 *
 * @example Different inputs
 * // npm
 * hasher.add('npm:react'); // Shorthand
 * hasher.add({ type: 'npm', name: 'react' }); // Single dependency
 * hasher.add({ type: 'npm', name: ['react', 'react-dom'] }); // Multiple dependencies
 * // file
 * hasher.add('file:package.json'); // Shorthand
 * hasher.add({ type: 'file', path: 'package.json' }); // Single file
 * hasher.add({ type: 'file', path: ['package.json', 'package-lock.json'] }); // Multiple files
 * // env
 * hasher.add('env:NODE_ENV'); // Shorthand
 * hasher.add({ type: 'env', name: 'NODE_ENV' }); // Single env variable
 * hasher.add({ type: 'env', name: ['NODE_ENV', 'DEBUG'] }); // Multiple env variables
 * // custom
 * hasher.add('hash:123'); // Shorthand
 * hasher.add({ type: 'hash', value: '123' }); // Full syntax
 *
 * @example Mixed inputs
 * hasher.add('npm:react', 'env:NODE_ENV', 'hash:123', {
 *   type: 'file',
 *   path: ['package.json', 'package-lock.json']
 * });
 */
export function createHasher(ctx: CacheContext): Hasher {
  const { vfs, task, npm, inject } = ctx;
  const inputs = new Set<AnyHashConfig>();
  const readers = {
    env: input => input.name.map(name => process.env[name]),
    npm: input => concurrently(input.name, npm.tryGetDependencyVersion),
    hash: input => input.value,
    file: input => concurrently(input.path, path => vfs.read(inject(path), 'utf-8'))
  } satisfies {
    [Key in keyof typeof hashSchemaTypes]: (
      input: z.infer<(typeof hashSchemaTypes)[Key]>
    ) => Awaitable<Falsy | string | Array<Falsy | string>>;
  };
  const readInput = async (input: AnyHashConfig) => await readers[input.type](input as any);
  const get = once(
    task('get hash', async () =>
      compact((await concurrently(inputs, readInput)).flat())
        .sort(compare.locale)
        .join(';')
    )
  );

  return {
    fork: task('fork', async () => {
      const next = createHasher(ctx);
      await next.add({
        type: 'hash',
        value: await get()
      });

      return next;
    }),
    get,
    add: task('add hash input', (...input: AnyHashInput[]) => {
      invariant(
        !get.called,
        'You can\'t add new inputs to the hasher after the first call to ".get()". Check the ".fork()" method.'
      );
      input
        .flat()
        .flatMap(it => parseAs('input', AnyHashInputSchema, it))
        .filter(Boolean)
        .forEach(it => inputs.add(it));
    })
  };
}

export const hashSchemaTypes = {
  /** Version of the package */
  npm: z
    .string()
    .startsWith('npm:')
    .transform(it => ({
      type: 'npm' as const,
      name: it.replace(/^npm:/, '').split(',')
    }))
    .or(
      z.object({
        type: z.literal('npm'),
        name: StringListSchema
      })
    ),
  /** File content */
  file: z
    .string()
    .startsWith('file:')
    .transform(it => ({
      type: 'file' as const,
      path: it.replace(/^file:/, '')
    }))
    .or(
      z.object({
        type: z.literal('file'),
        path: StringListSchema
      })
    ),
  /** Environment variable */
  env: z
    .string()
    .startsWith('env:')
    .transform(it => ({
      type: 'env' as const,
      name: it.replace(/^env:/, '').split(',')
    }))
    .or(
      z.object({
        type: z.literal('env'),
        name: StringListSchema
      })
    ),
  /** Custom hash string */
  hash: z
    .string()
    .transform(it => ({
      type: 'hash' as const,
      value: it.replace(/^hash:/, '')
    }))
    .or(
      z.object({
        type: z.literal('hash'),
        value: z.string()
      })
    )
};

export const AnyHashInputSchema = z.union([
  hashSchemaTypes.npm,
  hashSchemaTypes.env,
  hashSchemaTypes.file,
  hashSchemaTypes.hash
]);
export type AnyHashInput = z.input<typeof AnyHashInputSchema>;
export type AnyHashConfig = z.infer<typeof AnyHashInputSchema>;
