import type { WalkIgnoreInput } from '@neodx/glob';
import { plural } from '@neodx/internal/intl';
import { createTaskRunner } from '@neodx/internal/tasks';
import type { Logger } from '@neodx/log';
import { type Awaitable, cases, concurrently, toArray, True } from '@neodx/std';
import { setMapValue } from '@neodx/std/shared';
import { type Vfs, type VfsLogMethod } from '@neodx/vfs';
import type { GlobVfsParams } from '@neodx/vfs/plugins/glob';
import { basename } from 'pathe';
import type { SvgOptimizer } from './optimizer.ts';
import { parseSvg } from './parser.ts';
import type { SvgResetColors } from './reset-colors.ts';
import { defineSymbolMeta, type SymbolMeta } from './shared.ts';

export interface SvgCollectorParams {
  /**
   * Logger instance
   * @see `@neodx/log`
   */
  log: Logger<VfsLogMethod>;
  /**
   * VFS instance
   * @see `@neodx/vfs`
   */
  vfs: Vfs;
  /**
   * Filter unwanted files by their path
   * @param path
   */
  filter?: (path: string) => Awaitable<boolean>;
  /**
   * @default path => cases.kebab(basename(path, '.svg'))
   */
  getName?: (path: string) => string;
  optimizer: SvgOptimizer;
  resetColors: SvgResetColors;
  ignore?: WalkIgnoreInput;
}

export type SvgCollector = ReturnType<typeof createSvgCollector>;

/**
 * Abstraction for collecting SVG files.
 * Should be used in conjunction with `createSvgBuilder`.
 * @example
 * const collector = createSvgCollector({ vfs, log });
 * const builder = createSvgBuilder({ vfs, log, collector });
 *
 * await collector.load('**\/*.svg');
 * await builder.build();
 */
export function createSvgCollector({
  vfs,
  log,
  optimizer,
  resetColors,
  filter = True,
  getName = getDefaultName,
  ignore
}: SvgCollectorParams) {
  const symbols = new Map<string, SymbolMeta>();
  const { task } = createTaskRunner({ log });

  const add = task('add', async (path: string) => {
    if (!(await filter(path))) return;
    const name = getName(path);
    const content = optimizer.symbol(await vfs.read(path, 'utf-8'));
    // prevent unnecessary parsing and invalidating references to the unchanged file
    if (symbols.has(path) && symbols.get(path)!.source === content) return;
    return setMapValue(
      symbols,
      path,
      defineSymbolMeta(name, path, content, resetColors.apply(path, parseSvg(content)))
    );
  });
  const addMany = task('add many', async (paths: string[]) => await concurrently(paths, add), {
    mapSuccessMessage: (_, paths) =>
      `added ${plural(paths.length, { one: '%d file', other: '%d files' })}`
  });

  return {
    /**
     * Returns all the files in the current directory.
     */
    getAll() {
      if (symbols.size === 0) {
        log.error(
          `
Probably, you've started building sprites before the first file was added or you have defined wrong source path.

Please, check the following:

- You've added at least one .svg file to the source path
- You've defined the correct source path (currently it's "${vfs.path}")
- If you've defined the "inputRoot" option, you've added at least one file to it

If you've done all of the above, please, open an issue at https://github.com/secundant/neodx/issues/new
        `.trim()
        );
      }
      return [...symbols.values()].sort((a, b) => a.path.localeCompare(b.path));
    },
    /**
     * Adds new source svg files.
     * Could be used for adding new files or updating existing ones.
     */
    add,
    addMany,
    /**
     * Add source files by glob pattern(s)
     * @see `@neodx/vfs`: `glob` method
     */
    load: task('load', async (patterns: string | string[], params?: GlobVfsParams) => {
      log.debug('Loading %s...', patterns);
      return await addMany(
        await vfs.glob(patterns, {
          ignore,
          ...params
        })
      );
    }),
    /**
     * Removes previously added files
     */
    remove(paths: string | string[]) {
      toArray(paths)
        .filter(path => symbols.has(path))
        .forEach(path => symbols.delete(path));
    },
    /**
     * Clears all stored files
     */
    clear: () => symbols.clear(),
    __: {
      vfs,
      log
    }
  };
}

const getDefaultName = (path: string) => cases.kebab(basename(path, '.svg'));
