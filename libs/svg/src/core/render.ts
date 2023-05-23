import type { ReactElement, ReactNode } from 'react';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { SvgNode } from './types';

export const renderSvgNodesToString = (nodes: SvgNode[]) =>
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
