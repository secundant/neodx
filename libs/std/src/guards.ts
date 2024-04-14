import { type AnyFn, type AnyRecord, keys } from './shared';

const toString = Object.prototype.toString;
const getPrototypeOf = Object.getPrototypeOf;
const objectString = '[object Object]';

export type Nil = null | undefined;
export type AnyFunction = (...args: any[]) => any;
export type IsTypeOfFn<Type> = <T>(value: T | Type) => value is Type;

export const isEmpty = (target: unknown[]): target is [] => target.length === 0;
export const isError = (target: unknown): target is Error => target instanceof Error;
export const isEmptyObject = (target: AnyRecord): target is Record<never, never> =>
  isEmpty(keys(target));

export const not = ((fn: AnyFn) => (value: any) => !fn(value)) as {
  <CheckedValue>(
    fn: (value: any) => value is CheckedValue
  ): <Value>(value: Value) => value is Exclude<Value, CheckedValue>;
  (fn: (value: any) => boolean): (value: any) => boolean;
};
export const some =
  <Args extends [...unknown[]]>(...predicates: [...((...args: Args) => boolean)[]]) =>
  (...args: Args): boolean =>
    predicates.some(predicate => predicate(...args));
export const every =
  <Args extends [...unknown[]]>(...predicates: [...((...args: Args) => boolean)[]]) =>
  (...args: Args): boolean =>
    predicates.every(predicate => predicate(...args));

const createTypeof =
  <T>(type: string) =>
  (value: unknown): value is T =>
    typeof value === type;

export const isTypeOfString = createTypeof<string>('string');
export const isTypeOfBoolean = createTypeof<boolean>('boolean');
export const isTypeOfFunction = createTypeof<AnyFunction>('function');

export const isNull = (value: unknown): value is null => value === null;
export const isUndefined = (value: unknown): value is undefined => value === undefined;
export const isPrimitive = (value: unknown) =>
  value === null || (typeof value !== 'function' && typeof value !== 'object');
export const isArray = Array.isArray;
export const isObject = (target: unknown): target is AnyRecord => {
  if (isNil(target) || !isObjectLike(target) || toString.call(target) !== objectString) {
    return false;
  }
  const proto = getPrototypeOf(target);

  return proto === null || proto === getLastPrototypeOf(target);
};

export const isNil = (target: unknown): target is Nil => target == null;
export const isObjectLike = (target: unknown): target is object =>
  typeof target === 'object' && target !== null;

const getLastPrototypeOf = (target: unknown): unknown => {
  const proto = getPrototypeOf(target);

  return proto === null ? target : getLastPrototypeOf(proto);
};

export const isDefined = not(isUndefined);
export const isNotNull = not(isNull);
export const isNotNil = not(isNil);
