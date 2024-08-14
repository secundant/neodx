import type { Logger } from '@neodx/log';
import {
  entries,
  groupBy,
  invariant,
  isEmpty,
  isTypeOfString,
  keys,
  mapValues,
  not
} from '@neodx/std';
import { dropValue } from '@neodx/std/array';
import type { VfsLogMethod } from '@neodx/vfs';
import { type ParsedSvgNode } from './parser.ts';

export const parseViewBox = (viewBox: string) =>
  viewBox.split(' ').slice(2).map(Number.parseFloat) as [width: number, height: number] | [];

export const getSvgSizeProps = ({ props }: ParsedSvgNode) => {
  const [viewBoxWidth, viewBoxHeight] = parseViewBox(props.viewBox ?? '');
  const width = props.width ? Number.parseFloat(props.width) : viewBoxWidth;
  const height = props.height ? Number.parseFloat(props.height) : viewBoxHeight;
  const viewBox = props.viewBox ?? `0 0 ${width} ${height}`;

  invariant(width && height && viewBox, 'invalid svg props - width, height or viewBox is missing');
  return {
    width: width!,
    height: height!,
    viewBox
  };
};

export const defineSymbolMeta = (
  name: string,
  path: string,
  source: string,
  node: ParsedSvgNode
) => {
  const symbol = {
    name,
    path,
    node,
    /** The original SVG source */
    source,
    inlined: false,
    /** @internal */
    __: {
      id: name,
      sync: () => {
        Object.assign(symbol.__, calcNodeInternals(symbol.node));
      },
      ...calcNodeInternals(node)
    }
  };

  return symbol;
};

export const defineSpriteMeta = (name: string, symbols: SymbolMeta[]) => ({
  /**
   * Name of the sprite.
   * @example "common"
   */
  name,
  assets: [
    {
      type: 'external',
      symbols,
      fileName: `${name}.svg`
    }
  ] as SpriteAsset[]
});

export const compactSprites = (sprites: SpriteMeta[]) => sprites.filter(compactSprite);
export const compactSprite = (sprite: SpriteMeta) =>
  isEmpty((sprite.assets = sprite.assets.filter(it => !isEmpty(it.symbols)))) ? null : sprite;
export const getExternalAsset = (sprite: SpriteMeta) =>
  sprite.assets.find(it => it.type === 'external') as ExternalFileSpriteChunk;
export const getAllSymbols = (sprite: SpriteMeta) => sprite.assets.flatMap(it => it.symbols);

export const checkNode = (node: ParsedSvgNode) => {
  if (node.parent) {
    invariant(
      node.parent.children.includes(node),
      `node "${node.name}" is not a child of "${node.parent.name}"`
    );
  }
  node.children.forEach(child => !isTypeOfString(child) && checkNode(child));
};
export const replaceNodeParent = (node: ParsedSvgNode, parent?: ParsedSvgNode) => {
  if (parent === node.parent) return;
  checkNode(node);
  if (node.parent) dropValue(node.parent.children, node);
  node.parent = parent;
  parent?.children.push(node);
};
export const getChildNodes = (node?: ParsedSvgNode) =>
  node?.children.filter(not(isTypeOfString)) ?? [];

const calcNodeInternals = (node: ParsedSvgNode) => {
  const allNodes = flattenNode(node);
  const nodeById = mapValues(
    groupBy(allNodes, it => it.props.id),
    (it, id) => {
      invariant(it.length === 1, `duplicate id "${id}"`);
      return it[0]!;
    }
  );
  const references = groupBy(allNodes.flatMap(extractReferences(keys(nodeById))), 'id');

  return {
    allNodes,
    nodeById,
    references
  };
};
const extractReferences = (ids: string[]) => (node: ParsedSvgNode) =>
  entries(node.props).flatMap(([prop, value]) =>
    ids
      .filter(id =>
        value.match(
          // we want to be sure that we're not matching substrings
          new RegExp(`#${id}\\b`, 'ig')
        )
      )
      .map(id => ({ value, prop, node, id }))
  );

const flattenNode = (node: ParsedSvgNode): ParsedSvgNode[] => [
  node,
  ...getChildNodes(node).flatMap(flattenNode)
];

export type SymbolMeta = ReturnType<typeof defineSymbolMeta>;
export type SpriteMeta = ReturnType<typeof defineSpriteMeta>;
// We're expecting a logger compatible with `@neodx/vfs` to be passed to the builder
export type SvgLogger = Logger<VfsLogMethod>;

interface BaseSpriteAsset {
  /**
   * Optional name of the asset.
   * If omitted, the name will be generated from the sprite name.
   */
  assetName?: string;
  /**
   * Symbols in the asset.
   * The single sprite can hold multiple assets, so we need to track and distinguish them.
   */
  symbols: SymbolMeta[];
  additionalChildren?: ParsedSvgNode[];
}

/**
 * The asset will be saved as a file and used as a regular external SVG sprite (`<use href="/file.svg#symbol-name" />`).
 */
export interface ExternalFileSpriteChunk extends BaseSpriteAsset {
  type: 'external';
  /**
   * Name of the SVG file that will be referenced.
   * Will be actualized before writing to the disk.
   * @example "common.2eb4b56f.svg"
   */
  fileName: string;
}

/**
 * The asset content will be injected into the document for global usage (`<symbol id="symbol-name" />`).
 */
export interface InlinedSpriteAsset extends BaseSpriteAsset {
  type: 'inject';
  /**
   * Inlined SVG content.
   */
  content: string;
}

/**
 * Same as `inject`, but the sprite content will be saved as a file and then fetched from the server and injected into the document.
 */
export interface ExtractedSpriteAsset extends BaseSpriteAsset {
  type: 'fetch-and-inject';
  /**
   * Name of the SVG file that will be loaded and inlined.
   * Will be actualized before writing to the disk.
   * @example "inlined-common.2eb4b56f.svg"
   */
  fileName: string;
}

export type SpriteAsset = ExternalFileSpriteChunk | InlinedSpriteAsset | ExtractedSpriteAsset;
