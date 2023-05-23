import { createLogger } from '@neodx/log';
import { toArray } from '@neodx/std';
import { createTmpVfs } from '@neodx/vfs/testing-utils';
import { describe, expect, test } from 'vitest';
import { generateSvgSprites } from '../generate';
import type { ResetColorsPluginParams } from '../plugins';
import { readStub } from './testing-utils';

interface RunCaseParams {
  only?: string[];
  params?: ResetColorsPluginParams;
}

describe('resetColors', async () => {
  const logger = createLogger({
    level: 'silent'
  });
  const stub = await readStub('different-colors');
  const run = async ({ only, params }: RunCaseParams = {}) => {
    const included = only
      ? stub.names.filter(name => only.some(pattern => name.includes(pattern)))
      : stub.names;
    const vfs = await createTmpVfs({
      initialFiles: Object.fromEntries(included.map(name => [`assets/${name}`, stub.files[name]])),
      dryRun: false,
      log: logger
    });

    await generateSvgSprites({
      vfs,
      optimize: false,
      output: 'dist',
      logger,
      input: ['**/*.svg'],
      root: '.',
      resetColors: params,
      fileName: 'sprite.svg'
    });

    const result = await vfs.read('dist/sprite.svg', 'utf-8');

    return {
      vfs,
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
    async (params: ResetColorsPluginParams, expectedColors: string[]) => {
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
});
