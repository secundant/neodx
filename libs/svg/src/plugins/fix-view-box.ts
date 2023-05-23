import { omit } from '@neodx/std';
import { createPlugin } from './plugin-utils';

/**
 * Fix viewBox attribute if it's missing and width/height are present and remove width/height attributes
 */
export const fixViewBox = () =>
  createPlugin('fix-view-box', {
    transformNode({ node }) {
      const {
        attributes: { viewBox, width, height }
      } = node;

      return {
        ...node,
        attributes: {
          ...omit(node.attributes, ['width', 'height']),
          viewBox: viewBox || !width || !height ? viewBox : `0 0 ${width} ${height}`
        }
      };
    }
  });
