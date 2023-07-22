export interface SpritesMap {
  common: 'close' | 'favourite';
  format: 'align-left' | 'tag';
}

export const SPRITES_META = {
  common: {
    filePath: 'common.2eb4b56f.svg',
    items: {
      close: {
        viewBox: '0 0 48 48'
      },
      favourite: {
        viewBox: '0 0 48 48'
      }
    }
  },
  format: {
    filePath: 'format.c890959d.svg',
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
