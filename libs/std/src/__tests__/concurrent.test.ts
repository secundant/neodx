import { describe, expect, test } from 'vitest';
import { concurrent } from '../async';
import { renderWaterfall } from './testing-utils';

describe('concurrent', () => {
  test('should return empty array on empty inputs', async () => {
    const run = concurrent(async () => 0);

    expect(await run([])).toEqual([]);
  });

  test('should display concurrent execution', async () => {
    const waterfall = [] as [number, number, number][];
    const startTime = Date.now();
    const time = () => 10 * Math.floor((Date.now() - startTime) / 10);

    const run = concurrent(async (input: number) => {
      const mark = [input, time(), 0] as [number, number, number];

      waterfall.push(mark);
      await new Promise(resolve =>
        setTimeout(resolve, input % 3 === 0 ? 40 : input % 2 === 0 ? 30 : 20)
      );

      mark[2] = time();
      return input * 2;
    }, 3);

    const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
    const expected = input.map(input => input * 2);

    expect(await run(input)).toEqual(expected);
    expect(renderWaterfall(waterfall.map(([input, start, end]) => [input, start / 2, end / 2])))
      .toMatchInlineSnapshot(`
      "
      [>1########============================================================]
      [>2#############=======================================================]
      [>3##################==================================================]
      [==========>4#############=============================================]
      [===============>5########=============================================]
      [====================>6##################==============================]
      [=========================>7########===================================]
      [=========================>8#############==============================]
      [===================================>9##################===============]
      [========================================>10############===============]
      [========================================>11#######====================]
      [==================================================>12#################]
      [=======================================================>13#######=====]
      "
    `);
  });
});
