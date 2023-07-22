export interface SpritesMap {
  common: 'close' | 'double-color' | 'favourite';
  format: 'align-left' | 'tag';
}

export const SPRITES_META = {
  common: {
    filePath: 'common.9dbcf17b.svg',
    items: {
      close: {
        viewBox: '0 0 48 48'
      },
      'double-color': {
        viewBox: '0 0 16 16'
      },
      favourite: {
        viewBox: '0 0 48 48'
      }
    }
  },
  format: {
    filePath: 'format.22c911b9.svg',
    items: {
      'align-left': {
        viewBox: '0 0 48 48'
      },
      tag: {
        viewBox: '0 0 48 48'
      }
    }
  }
} satisfies {
  [SpriteName in keyof SpritesMap]: {
    filePath: string;
    items: {
      [ItemName in SpritesMap[SpriteName]]: {
        viewBox: string;
      };
    };
  };
};
