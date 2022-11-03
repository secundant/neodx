import { createPlugin } from '@/utils';

export const setId = () =>
  createPlugin('set-id', {
    transformNode({ node, info }) {
      return {
        ...node,
        attributes: {
          ...node.attributes,
          id: info.name
        }
      };
    }
  });
