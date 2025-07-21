import { hashUnknown } from '@neodx/internal/hash';
import { plural } from '@neodx/internal/intl';
import { formatList } from '@neodx/internal/log';
import { createTaskRunner } from '@neodx/internal/tasks';
import {
  concurrently,
  entries,
  False,
  identity,
  includesIn,
  invariant,
  isEmpty,
  isEmptyObject,
  isTypeOfString,
  mapValues,
  not,
  prop,
  True
} from '@neodx/std';
import { dropValue } from '@neodx/std/array';
import { match } from 'ts-pattern';
import type { ParsedSvgNode } from './parser.ts';
import {
  compactSprites,
  defineSpriteMeta,
  getAllSymbols,
  getChildNodes,
  getExternalAsset,
  replaceNodeParent,
  type SpriteMeta,
  type SvgLogger,
  type SymbolMeta
} from './shared.ts';

export type ExtractInlinedMode = 'extract-per-sprite' | 'merge-all';
export type FilterInlineMode = 'auto' | 'none' | 'all' | ((symbol: SymbolMeta) => boolean);
export type SvgSpriteInlining = ReturnType<typeof createSvgSpriteInlining>;

export interface SvgSpriteInliningParams {
  /**
   * Generates a unique ID for the symbol.
   * The ID will be used as a global ID for the symbol in the document.
   *
   * @default ({ spriteName, symbolName, contentHash }) => `${spriteName}-${symbolName}-${contentHash.slice(0, 8)}`
   * @example Single hash
   * { getId: it => it.hash(`${it.spriteName}-${it.symbolName}-${it.contentHash}`) }
   */
  getId?: (params: SymbolIdParams) => string;
  /**
   * Name of the generated asset for "extract: true" mode.
   * You can use "{name}" placeholder to include sprite name or a custom function.
   *
   * @default "inlined-{name}"
   */
  assetName?: string | ((sprite: SpriteMeta) => string);
  /**
   * Name of the merged sprite for "merge: true" mode.
   * @default "all"
   */
  mergeName?: string;
  /**
   * Extract inlined symbols from sprites.
   * - if `true`, inlined symbols will be extracted as separate assets and marked as "fetch-and-inject".
   * - if `false`, inlined symbols will be injected into the document as "inject" assets.
   *
   * @default false
   */
  extract?: boolean;
  /**
   * Inline recognition strategy.
   * - "auto" - (default) detects all symbols that reference other symbols
   * - "none" - disables inlining
   * - "all" - inlines all symbols
   * - (fn: (symbol: SymbolMeta) => boolean) - custom filter function
   *
   * @default 'auto'
   * @example Custom filter function
   * symbol => symbol.name.includes('illustration')
   */
  filter?: FilterInlineMode;
  /**
   * Merge all inlined symbols into a single sprite.
   * @default false
   */
  merge?: boolean;
  /**
   * Logger instance
   * @see `@neodx/log`
   */
  log: SvgLogger;
}

export interface SymbolIdParams {
  /**
   * Name of the symbol
   * @example "close"
   */
  symbolName: string;
  /**
   * Name of the sprite
   * @example "common"
   */
  spriteName: string;
  /** Hash of the symbol's content */
  contentHash: string;
  /** Hash function */
  hash: (value: unknown) => string;
}

/**
 * An API for detecting and extracting inline symbols from SVG sprites.
 * Inline symbols will be placed in the document and accessible via global IDs (e.g., `<use href="#sprite-symbol-name" />`).
 */
export function createSvgSpriteInlining({
  assetName = 'inlined-{name}',
  mergeName = 'all',
  extract,
  getId = ({ spriteName, symbolName, contentHash }) =>
    `${spriteName}-${symbolName}-${contentHash.slice(0, 8)}`,
  filter = 'auto',
  merge,
  log
}: SvgSpriteInliningParams) {
  const isInlinedSymbol = match(filter)
    .with('auto', () => hasReferences)
    .with('none', () => False)
    .with('all', () => True)
    .otherwise(identity);
  const { task } = createTaskRunner({ log });
  const getAssetName = isTypeOfString(assetName)
    ? (sprite: SpriteMeta) => assetName.replace('{name}', sprite.name)
    : assetName;

  const extractSprite = task('analyze', (sprite: SpriteMeta) => {
    const external = getExternalAsset(sprite);
    const inlined = external.symbols.filter(isInlinedSymbol);

    if (isEmpty(inlined)) log.debug('No inlined symbols found in "%s"', sprite.name);
    else if (inlined.length === getAllSymbols(sprite).length) {
      log.debug('All symbols are inlined in "%s"', sprite.name);
    } else {
      log.info(
        'Sprite "%s" inlines %s: %s',
        sprite.name,
        plural(inlined.length, { one: '%d symbol', other: '%d symbols' }),
        formatList(inlined.map(prop('name')))
      );
    }
    external.symbols = external.symbols.filter(not(includesIn(inlined))) as SymbolMeta[];
    return { sprite, inlined };
  });

  const compileSymbol = task(
    'inline symbol',
    async (symbol: SymbolMeta, spriteName: string, virtualNode: ParsedSvgNode) => {
      const contentHash = hashUnknown(symbol.source);
      const createId = (symbolName: string) =>
        getId({ spriteName, symbolName, contentHash, hash: hashUnknown });
      const moveToVirtual = (node: ParsedSvgNode) => replaceNodeParent(node, virtualNode);
      const mappedIds = mapValues(
        symbol.__.nodeById,
        (node, id) => (node.props.id = createId(`${symbol.name}-ref-${id}`))
      );

      symbol.inlined = true;
      // Extract all defs
      symbol.__.allNodes
        .filter(it => it.name === 'defs')
        .forEach(node => {
          // 1. Move all defs children to virtual defs node
          getChildNodes(node).forEach(moveToVirtual);
          // 2. Remove defs node itself
          dropValue(node.parent!.children, node);
        });

      // Extract all referenced nodes
      entries(symbol.__.references).forEach(([id, affected]) => {
        const node = symbol.__.nodeById[id];

        invariant(node, `Referenced node "${id}" is not found in the symbol "${symbol.name}"`);
        // Each dependent node will be updated with new id
        affected.forEach(({ node, prop, value }) => {
          node.props[prop] = value.replace(`#${id}`, `#${mappedIds[id]}`);
        });
        moveToVirtual(node);
      });
      symbol.__.id = createId(symbol.name);
      // TODO Rethink SVG Node API
      symbol.__.sync();
    }
  );
  const compileSymbols = task(
    'inline symbols',
    async (spriteName: string, symbols: SymbolMeta[]) => {
      const defs = {
        name: 'defs',
        props: {},
        children: []
      } satisfies ParsedSvgNode;

      await concurrently(symbols, symbol => compileSymbol(symbol, spriteName, defs));
      return defs;
    }
  );

  const apply = task(
    'apply',
    async (sprites: SpriteMeta[]) => {
      const allSymbols = sprites.flatMap(it => getAllSymbols(it));
      const extracted = await concurrently(sprites, extractSprite);
      const inlined = extracted.flatMap(it => it.inlined);

      if (inlined.length > 0) {
        log.info(
          '%d/%s in %s will be inlined',
          inlined.length,
          plural(allSymbols.length, { one: '%d symbol', other: '%d symbols' }),
          plural(sprites.length, { one: '%d sprite', other: '%d sprites' })
        );
      } else {
        log.info(
          'No symbols will be inlined in any of %s',
          plural(sprites.length, { one: '%d sprite', other: '%d sprites' })
        );
      }
      if (inlined.length === 0) return sprites;
      const addInlinedAsset = async (sprite: SpriteMeta, symbols: SymbolMeta[]) => {
        sprite.assets.push({
          type: extract ? 'fetch-and-inject' : 'inject',
          symbols,
          content: '',
          fileName: '',
          assetName: getAssetName(sprite),
          additionalChildren: [await compileSymbols(sprite.name, symbols)]
        });
        return sprite;
      };

      return compactSprites(
        merge
          ? [
              ...extracted.map(prop('sprite')),
              await addInlinedAsset(defineSpriteMeta(mergeName, []), inlined)
            ]
          : await concurrently(extracted, it => addInlinedAsset(it.sprite, it.inlined))
      );
    },
    {
      mapSuccessMessage: sprites =>
        sprites
          ? `inline ${plural(sprites.length, { one: '%d sprite', other: '%d sprites' })}`
          : 'skip inlining'
    }
  );

  return {
    apply
  };
}

const hasReferences = (symbol: SymbolMeta) => !isEmptyObject(symbol.__.references);
