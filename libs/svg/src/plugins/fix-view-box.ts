import { omit } from '@neodx/std';
import type { SvgFileMeta, SvgNode } from '../core';
import { createPlugin } from './plugin-utils';

/**
 * Fix viewBox attribute if it's missing and width/height are present and remove width/height attributes
 */
export const fixViewBox = () =>
  createPlugin('fix-view-box', {
    transformNode({ node, meta: { viewBox } }) {
      return {
        ...node,
        attributes: {
          ...omit(node.attributes, ['width', 'height']),
          viewBox: viewBox as string
        }
      };
    }
  });

export function extractSvgMeta({
  attributes: { width: originalWidth, height: originalHeight, viewBox }
}: SvgNode): SvgFileMeta {
  const [parsedWidth, parsedHeight] = viewBox ? parseViewBox(viewBox) : [];
  const width = originalWidth ? Number.parseFloat(originalWidth) : parsedWidth;
  const height = originalHeight ? Number.parseFloat(originalHeight) : parsedHeight;

  return {
    width,
    height,
    viewBox: viewBox || (width && height ? `0 0 ${width} ${height}` : undefined)
  };
}

const parseViewBox = (viewBox: string): [number, number] => {
  const [, , width, height] = viewBox.split(' ').map(Number.parseFloat);

  return [width!, height!];
};
