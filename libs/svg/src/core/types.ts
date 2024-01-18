import type { Vfs } from '@neodx/vfs';

export interface Context {
  vfs: Vfs;
}

export interface SvgSpritePlugin extends Partial<SvgSpritePluginHooks> {
  name: string;
}

export interface SvgSpritePluginHooks {
  afterWriteAll(sprites: GeneratedSprites, context: Context): unknown | Promise<unknown>;
  afterWriteSprite(sprite: GeneratedSprite, context: Context): unknown | Promise<unknown>;
  resolveEntriesMap(groups: SpriteGroupsMap, context: Context): SpriteGroupsMap;
  transformNode(node: SvgFile): SvgNode;
  transformSourceContent(path: string, content: string): string | Promise<string>;
  transformOutputEntryContent(content: string): string | Promise<string>;
}

export type SpriteGroupsMap = Map<string, SpriteGroup>;
export type GeneratedSprites = Map<string, GeneratedSprite>;

export interface SpriteGroup {
  name: string;
  files: SvgFile[];
}

export interface GeneratedSprite extends SpriteGroup {
  /**
   * Sprite file name relative to the output directory
   * @example 'sprite.svg'
   */
  filePath: string;
  /**
   * Full sprite file path relative to the root directory
   * @example 'public/sprites/sprite.svg'
   */
  fullFilePath: string;
}

export interface SvgFile {
  meta: SvgFileMeta;
  node: SvgNode;
  path: string;
  name: string;
  content: string;
}

export interface SvgFileMeta {
  width?: number;
  height?: number;
  viewBox?: string;
}

export interface SvgNode {
  name: string;
  type: string;
  value: string;
  children: SvgNode[];
  attributes: Record<string, string>;
}
