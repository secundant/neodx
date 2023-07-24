export interface SpritesMap {
  common: 'close' | 'favourite';
  format: 'align-left' | 'tag';
}
export const SPRITES_META = {
  common: {
    filePath: 'common.2eb4b56f.svg',
    items: {
      close: {
        viewBox: '0 0 48 48',
        width: 48,
        height: 48
      },
      favourite: {
        viewBox: '0 0 48 48',
        width: 48,
        height: 48
      }
    }
  },
  format: {
    filePath: 'format.c890959d.svg',
    items: {
      'align-left': {
        viewBox: '0 0 48 48',
        width: 48,
        height: 48
      },
      tag: {
        viewBox: '0 0 48 48',
        width: 48,
        height: 48
      }
    }
  }
} satisfies Record<
  string,
  {
    filePath: string;
    items: Record<
      string,
      {
        viewBox: string;
        width: number;
        height: number;
      }
    >;
  }
>;
