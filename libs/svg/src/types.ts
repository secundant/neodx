import type { Tree } from '@neodx/codegen';

export interface Context {
  tree: Tree;
}

export interface SvgSpritePlugin extends Partial<SvgSpritePluginHooks> {
  name: string;
}

export interface SvgSpritePluginHooks {
  afterWrite(groups: SpriteGroupsMap, context: Context): unknown | Promise<unknown>;
  afterWriteGroup(group: SpriteGroup, context: Context): unknown | Promise<unknown>;
  resolveEntriesMap(groups: SpriteGroupsMap, context: Context): SpriteGroupsMap;
  transformNode(node: SvgFile): SvgNode;
  transformSourceContent(path: string, content: string): string | Promise<string>;
  transformOutputEntryContent(content: string): string | Promise<string>;
}

export type SpriteGroupsMap = Map<string, SpriteGroup>;

export interface SpriteGroup {
  name: string;
  files: SvgFile[];
}

export interface SvgFile {
  node: SvgNode;
  path: string;
  name: string;
}

export interface SvgNode {
  name: string;
  type: string;
  value: string;
  children: SvgNode[];
  attributes: Record<string, string>;
}
