import { describe, expectTypeOf, test } from 'vitest';
import {
  defineExternalAssetMeta,
  defineSprite,
  defineSpriteAsset,
  defineSpriteMap,
  defineSpriteSymbol,
  type SpritePrepareConfig,
  type SvgSprite,
  type SvgSpriteAsset,
  type SvgSpriteSymbol
} from '../core/metadata-runtime-template.ts';

describe('generated runtime type contracts', () => {
  const sprite = defineSprite('common', [
    defineSpriteAsset(
      [defineSpriteSymbol('close', 16, 16), defineSpriteSymbol('open-in-tool-window', 16, 16)],
      defineExternalAssetMeta('path')
    )
  ]);

  test("factories' return values should match the type aliases", () => {
    expectTypeOf(defineSpriteSymbol('inline', 16, 16, '0 0 48 48')).toEqualTypeOf<
      SvgSpriteSymbol<'inline'>
    >();

    expectTypeOf(sprite).toEqualTypeOf<
      SvgSprite<
        'common',
        [
          SvgSpriteAsset<
            readonly [SvgSpriteSymbol<'close'>, SvgSpriteSymbol<'open-in-tool-window'>]
          >
        ]
      >
    >();
  });

  test('should infer symbol type', () => {
    expectTypeOf(defineSpriteSymbol('name', 16, 16)).toEqualTypeOf<{
      id: string;
      name: 'name';
      width: number;
      height: number;
      viewBox: string;
    }>();

    const externalName = 'name';

    expectTypeOf(defineSpriteSymbol(externalName, 16, 16)).toEqualTypeOf<{
      id: string;
      name: 'name';
      width: number;
      height: number;
      viewBox: string;
    }>();

    const unknownName = 'unknown' as string;

    expectTypeOf(defineSpriteSymbol(unknownName, 16, 16)).toEqualTypeOf<{
      id: string;
      name: string;
      width: number;
      height: number;
      viewBox: string;
    }>();
  });

  test('should infer sprite type', () => {
    expectTypeOf(sprite.symbols.names).toEqualTypeOf<readonly ['close', 'open-in-tool-window']>();
    expectTypeOf(sprite.symbols.all).toEqualTypeOf<
      readonly [SvgSpriteSymbol<'close'>, SvgSpriteSymbol<'open-in-tool-window'>]
    >();
    expectTypeOf(sprite.symbols.byName).toEqualTypeOf<{
      close: SvgSpriteSymbol<'close'>;
      ['open-in-tool-window']: SvgSpriteSymbol<'open-in-tool-window'>;
    }>();
    expectTypeOf(sprite).toMatchTypeOf<{
      name: 'common';
      prepare(asset: SvgSpriteAsset, symbol: SvgSpriteSymbol, config?: SpritePrepareConfig): void;
    }>();
  });

  test('should preserve order of symbols', () => {
    const left = defineSprite('left', [
      defineSpriteAsset(
        [
          defineSpriteSymbol('close', 16, 16),
          defineSpriteSymbol('open-in-tool-window', 16, 16),
          defineSpriteSymbol('external-name', 16, 16)
        ],
        defineExternalAssetMeta('path')
      )
    ]);

    const right = defineSprite('right', [
      defineSpriteAsset(
        [
          defineSpriteSymbol('external-name', 16, 16),
          defineSpriteSymbol('open-in-tool-window', 16, 16),
          defineSpriteSymbol('close', 16, 16)
        ],
        defineExternalAssetMeta('path')
      )
    ]);

    expectTypeOf(left.symbols.names).toEqualTypeOf<
      readonly ['close', 'open-in-tool-window', 'external-name']
    >();
    expectTypeOf(right.symbols.names).toEqualTypeOf<
      readonly ['external-name', 'open-in-tool-window', 'close']
    >();
  });

  test('should infer sprites map', () => {
    const map = defineSpriteMap([
      defineSprite('common', [
        defineSpriteAsset(
          [defineSpriteSymbol('close', 16, 16), defineSpriteSymbol('accept', 16, 16)],
          defineExternalAssetMeta('path')
        )
      ]),
      defineSprite('editor', [
        defineSpriteAsset(
          [defineSpriteSymbol('open-in-tool-window', 16, 16), defineSpriteSymbol('test', 16, 16)],
          defineExternalAssetMeta('path')
        )
      ])
    ]);

    type CommonSprite = SvgSprite<
      'common',
      [SvgSpriteAsset<readonly [SvgSpriteSymbol<'close'>, SvgSpriteSymbol<'accept'>]>]
    >;
    type EditorSprite = SvgSprite<
      'editor',
      [SvgSpriteAsset<readonly [SvgSpriteSymbol<'open-in-tool-window'>, SvgSpriteSymbol<'test'>]>]
    >;

    expectTypeOf(map.byName.common).toEqualTypeOf<CommonSprite>();
    expectTypeOf(map.byName.editor).toEqualTypeOf<EditorSprite>();
    expectTypeOf(map).toEqualTypeOf<{
      all: readonly [CommonSprite, EditorSprite];
      names: readonly ['common', 'editor'];
      byName: {
        common: CommonSprite;
        editor: EditorSprite;
      };
      experimental_get(
        spriteName: string,
        symbolName: string,
        config?: SpritePrepareConfig
      ): {
        sprite: CommonSprite | EditorSprite;
        symbol: SvgSpriteSymbol;
        asset: SvgSpriteAsset;
        href: string;
      } | null;
    }>();
  });
});
