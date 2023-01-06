import { jest } from '@jest/globals';
import { deduplicateAsync } from './deduplicate';

describe('deduplicateAsync', () => {
  test('should prevent parallel execution', async () => {
    const spyFn = jest.fn(
      (value: number) => new Promise(resolve => setTimeout(() => resolve(value * 2), 0))
    );
    const deduplicated = deduplicateAsync(spyFn);
    const promises = [
      deduplicated(1),
      deduplicated(1),
      deduplicated(2),
      deduplicated(2),
      deduplicated(2),
      deduplicated(2)
    ];

    expect(spyFn).toBeCalledTimes(2);
    expect(await Promise.all(promises)).toEqual([2, 2, 4, 4, 4, 4]);
    expect(spyFn).toBeCalledTimes(2);
    expect(
      await Promise.all([deduplicated(1), deduplicated(2), deduplicated(3), deduplicated(2)])
    ).toEqual([2, 4, 6, 4]);
    expect(spyFn).toBeCalledTimes(5);
  });
});
