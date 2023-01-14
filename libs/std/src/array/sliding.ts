import { fromLength } from './create';

export function sliding<T>(list: T[], size: number, step = 1) {
  return fromLength(Math.ceil(list.length / step), stepN =>
    fromLength(size, index => list[stepN + index])
  );
}
