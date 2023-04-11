import { type Falsy, isTruthy } from '../shared';

export const compact = <T>(values: Array<T | Falsy>) => values.filter(isTruthy);
