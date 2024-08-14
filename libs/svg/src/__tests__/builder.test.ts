import {
  concurrently,
  isTypeOfString,
  keys,
  mapEntries,
  mapKeysToObject,
  mapValues,
  not,
  pick,
  prop,
  toArray
} from '@neodx/std';
import type { VirtualInitializer } from '@neodx/vfs';
import { createTmpVfs, getChangesDump } from '@neodx/vfs/testing';
import type { AsyncReturnType } from 'type-fest';
import { describe, expect, test } from 'vitest';
import {
  createSvgSpriteBuilder,
  type CreateSvgSpriteBuilderParams,
  type SvgSpriteBuilder
} from '../core/builder.ts';
import { createSvgCollector } from '../core/collector.ts';
import { createSvgOptimizer } from '../core/optimizer.ts';
import { parseSvg } from '../core/parser.ts';
import { createSvgResetColors, type SvgResetColorsParams } from '../core/reset-colors.ts';
import {
  defineSymbolMeta,
  getChildNodes,
  type SpriteAsset,
  type SpriteMeta
} from '../core/shared.ts';
import { createSvgTestVfs, getSvgStubs, svgTestLog } from './testing-utils.ts';

describe('sprites builder', async () => {
  const createTestBuilder = async (
    stubs: VirtualInitializer,
    params?: CreateSvgSpriteBuilderParams
  ) => {
    const builder = createSvgSpriteBuilder({
      vfs: await createSvgTestVfs(stubs),
      ...params
    });

    await builder.load(['**/*.svg']);
    return { builder, sprites: await builder.build({ apply: false }) };
  };
  const stubs = await getSvgStubs();

  test('should ignore output path', async () => {
    const vfs = await createSvgTestVfs(mapKeysToObject(['common/add', 'flags/au']), {
      files: {
        'public/sprites/other.svg': '<svg></svg>'
      }
    });
    const builder = createSvgSpriteBuilder({ vfs, group: false, inline: false });

    await builder.load(['**/*.svg']);
    expect(await builder.build()).toEqual([
      expect.objectContaining({
        name: 'sprite',
        assets: [
          {
            fileName: 'sprite.svg',
            type: 'external',
            symbols: [
              expect.objectContaining({
                name: 'add',
                path: 'common/add.svg'
              }),
              expect.objectContaining({
                name: 'au',
                path: 'flags/au.svg'
              })
            ]
          }
        ]
      })
    ]);
  });

  test('should guarantee deterministic order', async () => {
    const builderA = createSvgSpriteBuilder({
      vfs: await createTmpVfs()
    });
    const builderB = createSvgSpriteBuilder({
      vfs: await createTmpVfs()
    });
    const add = (builder: SvgSpriteBuilder, commonStubNames: string[]) =>
      concurrently(commonStubNames, name =>
        builder.__.vfs.write(`common/${name}`, stubs.common![name]!)
      );

    await add(builderA, ['add.svg', 'close.svg', 'help.svg']);
    await add(builderB, ['help.svg', 'add.svg', 'close.svg']);
    await builderA.__.vfs.apply();
    await builderB.__.vfs.apply();

    await builderA.load('**/*.svg');
    const resultA = await builderA.build({ apply: false });
    await builderB.load('**/*.svg');
    const resultB = await builderB.build({ apply: false });
    const extract = (sprites: SpriteMeta[]) =>
      sprites.flatMap(it => it.assets.flatMap(it => it.symbols.map(prop('name'))));

    expect(extract(resultA)).toEqual(extract(resultB));
    expect(await getChangesDump(builderA.__.vfs)).toEqual(await getChangesDump(builderB.__.vfs));
  });

  describe('reset colors', () => {
    const run = async ({
      only,
      params
    }: {
      only?: string[];
      params?: SvgResetColorsParams;
    } = {}) => {
      const { builder } = await createTestBuilder(
        mapEntries(only ? pick(stubs.colors!, only) : stubs.colors!, ([name, stub]) => [
          `assets/${name}`,
          `colors/${name}`
        ]),
        {
          optimize: false,
          metadata: false,
          inline: false,
          output: 'dist',
          fileName: 'sprite.svg',
          resetColors: params
        }
      );

      const result = await builder.__.vfs.read('dist/sprite.svg', 'utf-8');

      return {
        vfs: builder.__.vfs,
        result
      };
    };

    const whiteVariants = [
      '#fff',
      '#FFF',
      '#FFFFFF',
      '#fffFFF',
      '#ffffff',
      'white',
      'rgb(255,255,255)'
    ];
    const hexA = '#6C707E';
    const hexB = '#818594';
    const allColors = [...whiteVariants, 'red', hexA, hexB];
    const whiteFiles = [
      'simple-hex-mixed-with-red.svg',
      'simple-hex-lower.svg',
      'simple-hex-upper.svg',
      'simple-hex-short.svg',
      'simple-keyword.svg',
      'simple-rgb.svg'
    ];

    test.each(whiteVariants.map(toArray))(
      'should reset "%s" white color variant to currentColor',
      async (color: string) => {
        const { result } = await run({
          only: whiteFiles,
          params: {
            replace: color
          }
        });

        expect(result).toMatch('currentColor');
        expect(result).toMatch('stroke="red"');
        expect(result).not.toEqual(expect.stringContaining(color));
      }
    );

    test.each([
      [{ replace: '#fff' }, ['currentColor', 'red']],
      [{ replace: { from: 'white' } }, ['currentColor', 'red']],
      [{ replace: { from: 'white', to: 'red' } }, ['red']],
      [{ replace: { from: 'white', to: 'currentColor' } }, ['currentColor', 'red']],
      [{ replace: [{ from: '#FFF' }] }, ['currentColor', 'red']],
      [{ replace: [{ from: 'white', to: 'currentColor' }] }, ['currentColor', 'red']],
      [{ replace: [{ from: 'rgba(255,255,255)', to: 'currentColor' }, 'red'] }, ['currentColor']]
    ])(
      'Configuration "%j" config should replace colors to "%j"',
      async (params, expectedColors) => {
        const { result } = await run({
          only: whiteFiles,
          params
        });

        expectedColors.forEach(color => {
          expect(result).toMatch(color);
        });
      }
    );

    test('should support multiple colors', async () => {
      const { result } = await run({
        only: whiteFiles,
        params: [
          {
            replace: '#fff'
          },
          {
            replace: 'red'
          }
        ]
      });

      expect(result).toMatch('"currentColor"');
      expect(result).not.toMatch('"red"');
    });

    test('by default should replace all colors to "currentColor"', async () => {
      const { result } = await run();

      expect(result).toMatch('currentColor');

      for (const color of allColors) {
        expect(result).not.toMatch(`"${color}"`);
      }
    });

    test('should support multi-config', async () => {
      const { result } = await run({
        params: [
          {
            replace: {
              from: ['#fff', 'red'],
              to: 'currentColor'
            }
          },
          {
            replace: ['#6C707E']
          },
          {
            properties: ['fill'],
            replaceUnknown: 'currentColor'
          }
        ]
      });

      expect(result).toMatch('currentColor');
      expect(result).not.toMatch(hexA);
      expect(result).not.toMatch(`fill="${hexB}"`);
      expect(result).toMatch(`stroke="${hexB}"`);
    });

    test('should preserve non-color values', async () => {
      const resetColors = createSvgResetColors();
      const rectWithFillReference = stubs.references!['animated-pattern.svg']!;
      const result = resetColors.apply('animated-pattern.svg', parseSvg(rectWithFillReference));

      expect(
        result.children.filter(not(isTypeOfString)).find(it => it.name === 'rect')?.props.fill
      ).toBe('url(#animatedPattern)');
    });
  });

  describe('collector', () => {
    const createSvgTestCollector = async (files: VirtualInitializer = {}) =>
      createSvgCollector({
        log: svgTestLog,
        vfs: await createTmpVfs({
          files
        }),
        optimizer: createSvgOptimizer(false),
        resetColors: createSvgResetColors(false)
      });

    test('should collect provided files', async () => {
      const collector = await createSvgTestCollector({
        'a.svg': stubs.mask!['flag-uk.svg']!,
        'b.svg': stubs.mask!['flag-us.svg']!,
        c: {
          'd.svg': stubs.colors!['hex-b-stroke.svg']!
        }
      });

      await collector.load('*.svg');
      expect(collector.getAll()).toEqual([
        expect.objectContaining({ path: 'a.svg', name: 'a' }),
        expect.objectContaining({ path: 'b.svg', name: 'b' })
      ]);

      collector.clear();
      await collector.load('a.svg');
      expect(collector.getAll()).toEqual([expect.objectContaining({ path: 'a.svg', name: 'a' })]);

      await collector.load('**/*.svg');
      expect(collector.getAll()).toEqual([
        expect.objectContaining({ path: 'a.svg', name: 'a' }),
        expect.objectContaining({ path: 'b.svg', name: 'b' }),
        expect.objectContaining({ path: 'c/d.svg', name: 'd' })
      ]);
    });

    test('should remove files', async () => {
      const collector = await createSvgTestCollector({
        common: pick(stubs.common!, ['add.svg', 'close.svg']),
        flags: pick(stubs.flags!, ['au.svg', 'us.svg'])
      });

      await collector.load('**/*.svg');
      expect(collector.getAll().map(prop('path'))).toEqual([
        'common/add.svg',
        'common/close.svg',
        'flags/au.svg',
        'flags/us.svg'
      ]);

      collector.remove('common/add.svg');
      expect(collector.getAll().map(prop('path'))).toEqual([
        'common/close.svg',
        'flags/au.svg',
        'flags/us.svg'
      ]);
      collector.remove(['common/close.svg', 'flags/au.svg']);
      expect(collector.getAll().map(prop('path'))).toEqual(['flags/us.svg']);
    });

    test('should preserve order', async () => {
      const left = await createSvgTestCollector();
      const right = await createSvgTestCollector();

      await left.__.vfs.write('a.svg', stubs.mask!['flag-uk.svg']!);
      await left.__.vfs.write('b.svg', stubs.mask!['flag-us.svg']!);
      await left.__.vfs.apply();
      await left.load('*.svg');
      expect(left.getAll().map(prop('path'))).toEqual(['a.svg', 'b.svg']);

      await right.__.vfs.write('b.svg', stubs.mask!['flag-us.svg']!);
      await right.__.vfs.write('a.svg', stubs.mask!['flag-uk.svg']!);
      await left.__.vfs.apply();
      await right.load('*.svg');
      expect(right.getAll().map(prop('path'))).toEqual(['a.svg', 'b.svg']);
    });

    test('should collect files from nested directories', async () => {
      const collector = await createSvgTestCollector({
        mask: stubs.mask!,
        // pick in non-alphabetical order for testing sorting
        common: pick(stubs.common!, ['help.svg', 'add.svg', 'close.svg']),
        deep: {
          nested: {
            'z.svg': stubs.colors!['hex-b-stroke.svg']!,
            'a.svg': stubs.colors!['hex-b-stroke.svg']!,
            dir: {
              'icon.svg': stubs.colors!['hex-b-stroke.svg']!
            }
          }
        }
      });

      await collector.load('**/*.svg');
      expect(collector.getAll().map(prop('path'))).toEqual([
        'common/add.svg',
        'common/close.svg',
        'common/help.svg',
        'deep/nested/a.svg',
        'deep/nested/dir/icon.svg',
        'deep/nested/z.svg',
        'mask/flag-uk.svg',
        'mask/flag-us.svg'
      ]);
    });
  });

  describe('inlining', () => {
    describe('options', () => {
      const prepare = async (params?: CreateSvgSpriteBuilderParams) =>
        await createTestBuilder(mapKeysToObject(['common/close', 'flags/au']), {
          metadata: 'src/metadata.ts',
          ...params
        });
      const everySpriteIsExternal = ({ sprites }: AsyncReturnType<typeof createTestBuilder>) =>
        sprites.flatMap(it => it.assets).every(it => it.type === 'external');

      test('should support disabling inlining', async () => {
        expect(everySpriteIsExternal(await prepare())).toBe(false);
        expect(
          everySpriteIsExternal(
            await prepare({
              inline: false
            })
          )
        ).toBe(true);
        expect(
          everySpriteIsExternal(
            await prepare({
              inline: 'none'
            })
          )
        ).toBe(true);
      });

      test('should support inline everything', async () => {
        expect(
          (await prepare({ inline: 'all' })).sprites
            .flatMap(it => it.assets)
            .every(it => it.type === 'inject')
        ).toBe(true);
      });

      test('should support inline filter function', async () => {
        const { sprites } = await prepare({ inline: it => it.name === 'close' });

        expect(sprites).toEqual([
          expect.objectContaining({
            name: 'common',
            assets: [
              expect.objectContaining({
                symbols: [
                  expect.objectContaining({
                    name: 'close',
                    path: 'common/close.svg'
                  })
                ],
                type: 'inject'
              })
            ]
          }),
          expect.objectContaining({
            name: 'flags',
            assets: [
              expect.objectContaining({
                symbols: [
                  expect.objectContaining({
                    name: 'au',
                    path: 'flags/au.svg'
                  })
                ],
                type: 'external'
              })
            ]
          })
        ]);
      });

      test('should support extract mode', async () => {
        expect(
          (
            await prepare({
              inline: {
                filter: 'all',
                extract: true
              }
            })
          ).sprites.flatMap(it => it.assets)
        ).toEqual([
          expect.objectContaining({
            fileName: 'inlined-common.svg',
            type: 'fetch-and-inject'
          }),
          expect.objectContaining({
            fileName: 'inlined-flags.svg',
            type: 'fetch-and-inject'
          })
        ]);
      });

      test('should support merging inlined sprites', async () => {
        expect(
          (
            await prepare({
              inline: {
                filter: 'all',
                merge: true
              }
            })
          ).sprites
        ).toEqual([
          {
            name: 'all',
            assets: [
              expect.objectContaining({
                assetName: 'inlined-all',
                type: 'inject'
              })
            ]
          }
        ]);
      });

      test('should support inlined sprites name', async () => {
        expect(
          (
            await prepare({
              fileName: '{name}.{hash:4}.svg',
              inline: {
                extract: true,
                assetName: 'dynamic/{name}'
              }
            })
          ).sprites.flatMap(it => ({
            name: it.name,
            ...pick(it.assets[0] as SpriteAsset & { type: 'external' }, [
              'fileName',
              'assetName',
              'type'
            ])
          }))
        ).toMatchInlineSnapshot(`
          [
            {
              "fileName": "common.4b86.svg",
              "name": "common",
              "type": "external",
            },
            {
              "assetName": "dynamic/flags",
              "fileName": "dynamic/flags.bf68.svg",
              "name": "flags",
              "type": "fetch-and-inject",
            },
          ]
        `);
      });
    });

    test.each([
      [
        'rect referencing pattern',
        'animated-pattern.svg',
        {
          ids: ['animatedPattern'],
          references: ['animatedPattern']
        }
      ],
      [
        'global mask',
        'global-mask.svg',
        {
          ids: ['a'],
          references: ['a']
        }
      ]
    ])(
      'should correctly detect if svg with %s should be inlined',
      async (_, name, { ids, references }) => {
        const stub = stubs.references![name]!;
        const node = parseSvg(stub);
        const symbol = defineSymbolMeta(name, name, stub, node);

        expect(keys(symbol.__.nodeById)).toEqual(ids);
        expect(keys(symbol.__.references)).toEqual(references);
      }
    );

    test('should extract all references to virtual node', async () => {
      const { sprites } = await createTestBuilder(
        {
          au: 'flags/au',
          uk: 'flags/uk'
        },
        {
          inline: {
            filter: 'all',
            getId: ({ spriteName, symbolName }) => `${spriteName}-${symbolName}`
          },
          metadata: 'src/metadata.ts'
        }
      );
      const [
        {
          assets: [{ content }]
        }
      ] = sprites as any;
      const node = parseSvg(content);
      const defs = getChildNodes(node).find(it => it.name === 'defs');

      expect(getChildNodes(defs).map(it => it.props.id)).toEqual([
        'sprite-au-ref-a',
        'sprite-uk-ref-a'
      ]);
      expect(() => defineSymbolMeta('a', 'a.svg', content, node)).not.toThrowError();
    });

    test('should inline sprite', async () => {
      const { builder } = await createTestBuilder(
        {
          mask: 'mask/flag-uk',
          plus: 'colors/simple-rgb.svg'
        },
        {
          metadata: 'src/metadata.ts'
        }
      );

      expect(await getChangesDump(builder.__.vfs)).toMatchSnapshot();
    });

    test('should merge all inlined assets', async () => {
      const { builder, sprites } = await createTestBuilder(
        {
          au: 'flags/au',
          uk: 'flags/uk',
          us: 'flags/us'
        },
        {
          metadata: 'src/metadata.ts'
        }
      );

      expect(sprites![0]!.assets[0]!.type).toBe('inject');
      expect(await getChangesDump(builder.__.vfs)).toMatchSnapshot();
    });

    test('should inline all symbols with any kind of reference', async () => {
      const { builder, sprites } = await createTestBuilder(
        mapValues(stubs.references!, (_, name) => `references/${name}`),
        {
          metadata: 'src/metadata.ts',
          inline: 'auto'
        }
      );

      expect(sprites.length).toBe(1);
      expect(sprites![0]!.assets[0]!.symbols.length).toBe(keys(stubs.references!).length);
      expect(sprites![0]!.assets[0]!.type).toBe('inject');
      expect(await getChangesDump(builder.__.vfs)).toMatchSnapshot();
    });
  });

  describe('cleanup', () => {
    async function prepare(params?: CreateSvgSpriteBuilderParams) {
      const builderParams = {
        inline: false,
        metadata: 'src/metadata.ts',
        ...params
      } satisfies CreateSvgSpriteBuilderParams;
      const { builder } = await createTestBuilder(
        {
          ...mapKeysToObject(keys(stubs.common!).map(name => `common/${name}`)),
          ...mapKeysToObject(keys(stubs.flags!).map(name => `flags/${name}`))
        },
        builderParams
      );

      await builder.__.vfs.apply();
      const nextBuilder = createSvgSpriteBuilder({
        ...builderParams,
        vfs: builder.__.vfs
      });
      const rebuild = async () => {
        nextBuilder.clear();
        await nextBuilder.__.vfs.apply();
        await nextBuilder.load(['**/*.svg']);
        await nextBuilder.build();
      };

      return { rebuild, builder: nextBuilder, vfs: nextBuilder.__.vfs };
    }

    const defaultOutputPath = 'public/sprites';

    test('should clean whole dir when "cleanup" is equal to "drop-output-dir"', async () => {
      const { rebuild, vfs } = await prepare({ cleanup: 'drop-output-dir' });

      expect(await vfs.readDir(defaultOutputPath)).toEqual(['common.svg', 'flags.svg']);
      await vfs.write('public/sprites/external.svg', '<svg></svg>');
      await vfs.delete('flags');
      await rebuild();
      expect(await vfs.readDir(defaultOutputPath)).toEqual(['common.svg']);

      await vfs.delete('common');
      await vfs.write('other/add.svg', stubs.common!['add.svg']!);
      await rebuild();
      expect(await vfs.readDir(defaultOutputPath)).toEqual(['other.svg']);
    });

    test('should preserve all generated files if "cleanup" is disabled', async () => {
      const { rebuild, vfs } = await prepare({ cleanup: false });

      expect(await vfs.readDir(defaultOutputPath)).toEqual(['common.svg', 'flags.svg']);
      await vfs.write('public/sprites/external.svg', '<svg></svg>');
      await vfs.delete('flags');
      await rebuild();
      expect(await vfs.readDir(defaultOutputPath)).toEqual([
        'common.svg',
        'external.svg',
        'flags.svg'
      ]);

      await vfs.delete('common');
      await vfs.write('other/add.svg', stubs.common!['add.svg']!);
      await rebuild();
      expect(await vfs.readDir(defaultOutputPath)).toEqual([
        'common.svg',
        'external.svg',
        'flags.svg',
        'other.svg'
      ]);
    });

    test('should automatically remove outdated sprites if "cleanup" is equal to "auto"', async () => {
      const { rebuild, vfs } = await prepare({ cleanup: 'auto' });

      expect(await vfs.readDir(defaultOutputPath)).toEqual(['common.svg', 'flags.svg']);
      await vfs.write('public/sprites/external.svg', '<svg></svg>');
      await vfs.delete('flags');
      await rebuild();
      expect(await vfs.readDir(defaultOutputPath)).toEqual(['common.svg', 'external.svg']);

      await vfs.delete('common');
      await vfs.write('other/add.svg', stubs.common!['add.svg']!);
      await rebuild();
      expect(await vfs.readDir(defaultOutputPath)).toEqual(['external.svg', 'other.svg']);
    });
  });
});
