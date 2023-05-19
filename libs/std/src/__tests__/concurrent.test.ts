import { describe, expect, test } from 'vitest';
import { concurrent } from '../async';
import { createMicroTimer, renderWaterfall } from './testing-utils';

describe('concurrent', () => {
  test('should return empty array on empty inputs', async () => {
    const run = concurrent(async () => 0);

    expect(await run([])).toEqual([]);
  });

  test('should display concurrent execution', async () => {
    const microTimer = createMicroTimer();
    const waterfall = [] as [number, number, number][];

    const run = concurrent(async (input: number) => {
      const time = input % 3 === 0 ? 40 : input % 2 === 0 ? 30 : 20;
      const mark = [input, microTimer.passed, 0] as [number, number, number];

      waterfall.push(mark);
      mark[2] = await microTimer.wait(time);
      return input * 2;
    }, 3);

    const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
    const expected = input.map(input => input * 2);
    const runPromise = run(input);

    await microTimer.start();

    expect(await runPromise).toEqual(expected);
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
