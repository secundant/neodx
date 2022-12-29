import { createPlugin } from '../plugin-utils';

export const setId = () =>
  createPlugin('set-id', {
    transformNode({ node, name }) {
      return {
        ...node,
        attributes: {
          ...node.attributes,
          id: name
        }
      };
    }
  });
