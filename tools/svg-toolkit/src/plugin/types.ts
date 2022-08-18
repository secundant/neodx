import type { INode } from 'svgson';
import type { Input } from '@/input';
import type { InputGroups } from '@/input/group-inputs';

export interface SvgPlugin extends Partial<SvgPluginHooks> {
  name: string;
}

export interface SvgPluginHooks {
  transformChunk(input: Input, content: string): string | Promise<string>;
  transformSprite(content: string): string | Promise<string>;

  afterWrite(info: WriteInfo): void | Promise<void>;
}

export interface WriteInfo {
  nodes: Map<Input, INode>;
  groups: InputGroups | null;
  outputRoot: string;
}
