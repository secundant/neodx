import { createElement, ReactElement, ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { INode } from 'svgson';

export const renderSvgNodesToSpriteString = (nodes: INode[]) =>
  renderToStaticMarkup(renderSpriteElement(nodes.map(renderSymbolElement)));

const renderSpriteElement = (icons: ReactElement[]) =>
  createElement('svg', { width: 0, height: 0, className: 'hidden' }, icons);

const renderSymbolElement = (node: INode) =>
  renderNodeToElement(
    {
      ...node,
      name: 'symbol'
    },
    node.attributes.id
  );

const renderNodeToElement = ({ children, name, attributes }: INode, key: string | number) =>
  createElement(
    name,
    { ...attributes, key },
    Array.isArray(children) ? children.map(renderSvgNodeToReactNode) : children
  );

const renderSvgNodeToReactNode = (node: INode, index: number): ReactNode => {
  switch (node.type) {
    case 'element':
      return renderNodeToElement(node, index);
    case 'text':
      return node.value;
    default:
      return undefined;
  }
};
