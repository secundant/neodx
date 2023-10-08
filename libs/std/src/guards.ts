import { keys } from './shared';

const toString = Object.prototype.toString;
const getPrototypeOf = Object.getPrototypeOf;
const objectString = '[object Object]';

export type Nil = null | undefined;
export type AnyKey = keyof any;
export type AnyObj = Record<AnyKey, unknown>;
export type AnyFunction = (...args: any[]) => any;
export type IsTypeOfFn<Type> = <T>(value: T | Type) => value is Type;

export const isEmpty = (target: unknown[]): target is [] => target.length === 0;
export const isError = (target: unknown): target is Error => target instanceof Error;
export const isEmptyObject = (target: AnyObj) => isEmpty(keys(target));

export const negate =
  <R>(fn: (value: unknown) => value is R) =>
  <Value>(value: Value): value is Exclude<Value, R> =>
    !fn(value);

const createTypeof = (type: string) => (value: unknown) => typeof value === type;

export const isTypeOfString = createTypeof('string') as IsTypeOfFn<string>;
export const isTypeOfFunction = createTypeof('function') as IsTypeOfFn<AnyFunction>;

export const isNull = (value: unknown): value is null => value === null;
export const isUndefined = (value: unknown): value is undefined => value === undefined;
export const isPrimitive = (value: unknown) =>
  value === null || (typeof value !== 'function' && typeof value !== 'object');
export const isObject = (target: unknown): target is AnyObj => {
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

export const isNotUndefined = negate(isUndefined);
export const isNotNull = negate(isNull);
export const isNotNil = negate(isNil);
