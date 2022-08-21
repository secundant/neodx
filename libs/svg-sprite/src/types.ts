export interface Context {
  cwd: string;
  input: string[];
  inputRoot: CwdPath;
  outputRoot: CwdPath[];
  fileName: string;
  hooks: SvgSpritePluginHooks;
}

export interface Configuration {
  input: string | string[];
  inputRoot: string;
  outputRoot: string | string[];
  fileName: string;
  plugins: SvgSpritePlugin[];
}

export interface SvgSpritePlugin extends Partial<SvgSpritePluginHooks> {
  name: string;
}

export interface SvgSpritePluginHooks {
  afterWrite(entries: SvgOutputEntriesMap, context: Context): unknown | Promise<unknown>;
  afterWriteEntry(
    name: string,
    nodes: SvgOutputEntry[],
    context: Context
  ): unknown | Promise<unknown>;
  resolveEntriesMap(entries: SvgOutputEntriesMap, context: Context): SvgOutputEntriesMap;
  transformNode(node: SvgOutputEntry): SvgNode;
  transformSourceContent(source: SvgSourceInfo, content: string): string | Promise<string>;
  transformOutputEntryContent(content: string): string | Promise<string>;
}

export type SvgOutputEntriesMap = Map<string, SvgOutputEntry[]>;

export interface SvgOutputEntry {
  info: SvgSourceInfo;
  node: SvgNode;
}

export interface SvgNode {
  name: string;
  type: string;
  value: string;
  children: SvgNode[];
  attributes: Record<string, string>;
}

export interface SvgSource extends SvgSourceInfo {
  content: string;
}

export interface SvgSourceInfo extends InputPath {
  // File name without extension
  name: string;
}

export interface InputPath extends CwdPath {
  relativeToInputRoot: string;
}

export interface CwdPath {
  absolute: string;
  relativeToCwd: string;
}
