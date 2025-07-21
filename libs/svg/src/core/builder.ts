import { hashContent, printHash } from '@neodx/internal/hash';
import { plural } from '@neodx/internal/intl';
import { formatList } from '@neodx/internal/log';
import { callable, type CallableParam } from '@neodx/internal/params';
import type { CreateSvgoConfigParams } from '@neodx/internal/svgo';
import { createTaskRunner } from '@neodx/internal/tasks';
import type { AutoLoggerInput } from '@neodx/log';
import { createAutoLogger, pretty } from '@neodx/log/node';
import {
  cases,
  concurrently,
  entries,
  groupBy,
  identity,
  isEmpty,
  isTypeOfFunction,
  pick,
  prop
} from '@neodx/std';
import { type AutoVfsInput, createAutoVfs, type VfsLogMethod } from '@neodx/vfs';
import { dirname } from 'node:path';
import { match, P } from 'ts-pattern';
import { createSpritesCleanup, type SpritesCleanupType } from './cleanup.ts';
import { createSvgCollector } from './collector.ts';
import {
  createSvgSpriteInlining,
  type FilterInlineMode,
  type SvgSpriteInliningParams
} from './inlining.ts';
import { createSpritesMetadata, type SpritesMetadataInput } from './metadata.ts';
import { createSvgOptimizer } from './optimizer.ts';
import { formatSvgAsset } from './parser.ts';
import { createSvgResetColors, type SvgResetColorsParams } from './reset-colors.ts';
import { defineSpriteMeta, type SpriteAsset, type SpriteMeta, type SymbolMeta } from './shared.ts';

export interface CreateSvgSpriteBuilderParams {
  /**
   * Logger instance
   * @see `@neodx/log`
   * @default built-in logger
   */
  log?: AutoLoggerInput<VfsLogMethod>;
  /**
   * VFS instance, a path or params for creating a VFS instance
   * @see `@neodx/vfs`
   * @default process.cwd()
   */
  vfs?: AutoVfsInput;
  /**
   * Sprite grouping mode
   *
   * - `true` - use `dirname` as sprite name (default),
   * - `false` - don't group sprites, `defaultSpriteName` will be used for all sprites,
   * - otherwise a function that accepts relative path and returns sprite name
   *
   * @default true
   * @example Grouping by path's dirname and specific attribute
   * { group: ({ node, path }) => `${dirname(path)}/${node.props['data-category']}` }
   */
  group?: CallableParam<(file: SymbolMeta) => string>;
  /**
   * Root path for the input files.
   * All paths will be relative to this path.
   * @default '.'
   */
  inputRoot?: string;
  /**
   * Sprite inlining mode, disabled by default
   *
   * - `'auto'` - we'll automatically detect all problematic svgs and extract them into separate sprite for future inlining
   * - `'all'` - all sprites will be inlined. Perfect for solving CDN compatibility
   * - `false` - no inlining. If we find any potential issues, we'll display corresponding errors in the console
   *
   * @default false
   */
  inline?: Partial<SvgSpriteInliningParams> | FilterInlineMode | false;
  /**
   * Path to generated sprite/sprites folder
   * @default 'public/sprites'
   */
  output?: string;
  /**
   * Sprite cleanup mode.
   *
   * - `'auto'` - smart cleanup, removes only outdated sprites and requires `metadata` option to identify current sprites
   * - `'force'` - delete the entire output directory before building sprites
   * - `false` - no cleanup
   *
   * @default 'auto' if `metadata` option is provided, otherwise `false`
   */
  cleanup?: false | SpritesCleanupType;
  /**
   * Template of sprite file name
   * @example {name}.svg
   * @example sprite-{name}.svg
   * @example {name}-{hash}.svg
   * @example {name}-{hash:8}.svg
   * @default {name}.svg
   */
  fileName?: string;
  /**
   * Resolves symbol name for the given file path.
   * By default, it's a kebab-cased file name without an extension.
   *
   * @default path => cases.kebab(basename(path, '.svg'))
   * @example path => basename(path, '.svg') // don't force any case
   */
  getSymbolName?: (path: string) => string;
  /**
   * Should we optimize icons?
   * - `true` - minify SVG files,
   * - `false` - don't minify,
   * - otherwise, a custom configuration (with an SVGO configuration as a part)
   *
   * @default true
   * @example With additional plugins
   * {
   *   optimize: {
   *     config: {
   *       plugins: [
   *         { name: 'sortDefsChildren' },
   *       ]
   *     }
   *   }
   * }
   */
  optimize?: boolean | CreateSvgoConfigParams;
  /**
   * Metadata generation rules.
   *
   * - `false` - don't generate metadata,
   * - `<string>` - path to generated metadata file, alias for `{ path: 'path/to/metadata.ts' }`,
   * - otherwise, a configuration object (`SpritesMetadataParams`)
   *
   * @see `SpritesMetadataParams`
   * @example
   * {
   *   metadata: {
   *     path: 'src/sprites/meta.ts',
   *     name: 'mySpritesVariableName', // default: 'sprites'
   *     typeName: 'MySpritesTypeName' // default: 'SpritesMeta'
   *   }
   * }
   */
  metadata?: SpritesMetadataInput;
  /**
   * Reset colors config.
   *
   * - `true` - converts all colors to `currentColor`,
   * - `false` - keeps original colors,
   * - otherwise custom config
   *
   * @default true
   * @example Complex config
   * {
   *   resetColors: {
   *     // 1. Don't touch our special static colors
   *     keep: Object.values(colors.static),
   *     // 2. Replace all brand colors with CSS variables
   *     replace: [
   *       { from: colors.brand.main, to: 'var(--color-brand-main)' },
   *       { from: colors.brand.secondary, to: 'var(--color-brand-secondary)' }
   *     ],
   *     // 3. Replace all other ("unknown" means "not defined implicitly in `replace.to` option") colors with `currentColor`
   *     replaceUnknown: 'currentColor',
   *     // 4. Preserve specific SVG files untouched
   *     exclude: /.*\.standalone\.svg$/
   *   }
   * }
   */
  resetColors?: SvgResetColorsParams | boolean;
  /**
   * Default sprite name. Will be used if `group` is `false` or for all root-level svg files.
   * @default 'sprite'
   */
  defaultSpriteName?: string;
}

export type SvgSpriteBuilder = Awaited<ReturnType<typeof createSvgSpriteBuilder>>;

export function createSvgSpriteBuilder({
  vfs: vfsInput = process.cwd(),
  log: logInput = 'warn',
  group = true,
  inline = 'auto',
  output = 'public/sprites',
  inputRoot = '.',
  fileName = '{name}.svg',
  optimize = true,
  metadata: metadataInput = false,
  cleanup: cleanupType = metadataInput ? 'auto' : false,
  resetColors: resetColorsParams = true,
  getSymbolName,
  defaultSpriteName = 'sprite'
}: CreateSvgSpriteBuilderParams = {}) {
  const log = createAutoLogger(logInput, { name: 'svg', target: pretty() });
  const vfs = createAutoVfs(vfsInput, {
    log: log.child('vfs'),
    // TODO Figure out why eslint is so slow
    eslint: false
  });
  const inputVfs = vfs.child(inputRoot);
  const outputVfs = vfs.child(output);

  const getSpriteName = callable(
    group,
    file => cases.kebab(getNameByDirname(file.path) || defaultSpriteName),
    () => defaultSpriteName
  );
  // todo move options normalization to the inlining module itself
  const inlining = inline
    ? createSvgSpriteInlining(
        Object.assign(
          { log: log.child('inline') },
          match(inline)
            .with(P.string.or(P.when(isTypeOfFunction)), filter => ({ filter }))
            .otherwise(identity)
        )
      )
    : null;
  const { task } = createTaskRunner({ log });

  const resetColors = createSvgResetColors(resetColorsParams);
  const optimizer = createSvgOptimizer(optimize);
  const metadata = createSpritesMetadata(metadataInput, {
    log,
    vfs
  });
  const cleanup = createSpritesCleanup({
    cleanupType,
    metadata,
    outputVfs,
    log,
    vfs
  });
  const collector = createSvgCollector({
    vfs: inputVfs,
    log: log.child('collect'),
    ignore: inputVfs.relative(outputVfs.path),
    getName: getSymbolName,
    optimizer,
    resetColors
  });

  const buildSprite = task(
    'build sprite',
    async (sprite: SpriteMeta) =>
      await concurrently(sprite.assets, async asset => {
        const content = optimizer.sprite(formatSvgAsset(asset));

        if (asset.type === 'inject') asset.content = content;
        else {
          asset.fileName = printHash(
            fileName.replace('{name}', asset.assetName ?? sprite.name),
            hashContent(content)
          );
        }

        return { sprite, asset, content };
      }),
    {
      mapSuccessMessage: (_, sprite) =>
        `build sprite '${sprite.name}' (${plural(sprite.assets.length, {
          one: '%d asset',
          other: '%d assets'
        })})`,
      mapError: (_, sprite) => `Failed to generate sprite '${sprite.name}'`
    }
  );
  const build = task(
    'build',
    async ({ apply = true } = {}) => {
      await cleanup?.preload();

      const collectedSprites = entries(groupBy(collector.getAll(), getSpriteName)).map(
        ([name, files]) => defineSpriteMeta(name, files)
      );
      const sprites = (await inlining?.apply(collectedSprites)) ?? collectedSprites;
      const spriteNames = sprites.map(prop('name'));
      const inlinedSprites = sprites.filter(it => it.assets.some(it => it.type !== 'external'));

      if (isEmpty(sprites)) {
        log.error('No symbols found, nothing to build');
        return [];
      }
      if (!isEmpty(inlinedSprites) && !metadata) {
        log.error(
          `Required 'metadata' option due to %s was inlined, you won't be able to use sprites without access to actual information about them.
Please, provide following options:

svg({
  // ...
  metadata: 'path/to/metadata.ts'
});

You can read more about metadata in https://neodx.pages.dev/svg/metadata.html
        `,
          plural(inlinedSprites.length, { one: '%d sprite', other: '%d sprites' })
        );
        return [];
      }
      log.info(
        'Building %s: %s...',
        plural(sprites.length, { one: '%d sprite', other: '%d sprites' }),
        formatList(spriteNames)
      );
      // todo rework cleanup logic, currently it's required to cleanup BEFORE writing new sprites, so we should make the following hack with delayed write
      const results = (await concurrently(sprites, buildSprite)).flat();

      await cleanup?.actualize(results.map(it => it.asset));
      await metadata?.render(sprites);
      await concurrently(
        results.filter(it => it.asset.type !== 'inject'),
        async ({ asset, content }) =>
          await outputVfs.write(
            (asset as Exclude<SpriteAsset, { type: 'inject' }>).fileName,
            content
          )
      );
      if (apply) await vfs.apply();

      return sprites;
    },
    {
      mapSuccessMessage: sprites =>
        sprites
          ? `build ${plural(sprites.length, { one: '%d sprite', other: '%d sprites' })}`
          : 'skip build'
    }
  );

  return {
    ...pick(collector, ['load', 'add', 'remove', 'clear']),
    build,
    __: {
      resetColors,
      collector,
      optimizer,
      outputVfs,
      metadata,
      cleanup,
      vfs,
      log
    }
  };
}

const getNameByDirname = (path: string) => (dirname(path) === '.' ? null : dirname(path));
