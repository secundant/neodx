import { writeFile } from 'fs/promises';
import { resolve } from 'path';
import ora from 'ora';
import { createElement, ReactElement, ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Context, CwdPath, SvgNode, SvgOutputEntry } from '@/types';

export class Generator {
  private entries = new Map<string, SvgOutputEntry[]>();
  private progress = ora();

  constructor(readonly context: Context) {}

  add(name: string, nodes: Iterable<SvgOutputEntry>) {
    this.entries.set(name, Array.from(nodes));
  }

  async generate() {
    let generated = 0;
    const entries = this.context.hooks.resolveEntriesMap(this.entries, this.context);

    this.progress.start(`[0/${entries.size}] generating...`);
    for (const [name, items] of entries) {
      const content = await this.context.hooks.transformOutputEntryContent(
        renderSvgNodesToSpriteString(items.map(item => item.node))
      );

      for (const output of this.context.outputRoot) {
        await this.write(name, output, content);
        await this.context.hooks.afterWriteEntry(name, items, this.context);
      }
      this.progress.text = `[${++generated}/${entries.size}] generating...`;
    }
    await this.context.hooks.afterWrite(entries, this.context);
    this.progress.succeed(`[${entries.size}/${entries.size}] generated`);
  }

  protected async write(name: string, output: CwdPath, content: string) {
    await writeFile(
      resolve(output.absolute, this.context.fileName.replace('{name}', name)),
      content,
      'utf-8'
    );
  }
}

const renderSvgNodesToSpriteString = (nodes: SvgNode[]) =>
  renderToStaticMarkup(renderSpriteElement(nodes.map(renderSymbolElement)));

const renderSpriteElement = (icons: ReactElement[]) =>
  createElement('svg', { width: 0, height: 0, className: 'hidden' }, icons);

const renderSymbolElement = (node: SvgNode) =>
  renderNodeToElement(
    {
      ...node,
      name: 'symbol'
    },
    node.attributes.id
  );

const renderNodeToElement = ({ children, name, attributes }: SvgNode, key: string | number) =>
  createElement(
    name,
    { ...attributes, key },
    Array.isArray(children) ? children.map(renderSvgNodeToReactNode) : children
  );

const renderSvgNodeToReactNode = (node: SvgNode, index: number): ReactNode => {
  switch (node.type) {
    case 'element':
      return renderNodeToElement(node, index);
    case 'text':
      return node.value;
    default:
      return undefined;
  }
};
