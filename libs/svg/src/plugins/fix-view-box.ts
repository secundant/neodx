import { createPlugin } from './plugin-utils';

/**
 * Fix viewBox attribute if it's missing and width/height are present
 */
export const fixViewBox = () =>
  createPlugin('fix-view-box', {
    transformNode({ node }) {
      const {
        attributes: { viewBox, width, height }
      } = node;

      if (viewBox || !width || !height) {
        return node;
      }
      return {
        ...node,
        attributes: {
          ...node.attributes,
          viewBox: `0 0 ${width} ${height}`
        }
      };
    }
  });
