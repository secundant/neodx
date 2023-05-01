const toString = Object.prototype.toString;
const getPrototypeOf = Object.getPrototypeOf;
const objectString = '[object Object]';

export type Nil = null | undefined;
export type AnyKey = keyof any;
export type AnyObj = Record<AnyKey, unknown>;

export const isEmpty = (target: unknown[]): target is [] => target.length === 0;
export const isError = (target: unknown): target is Error => target instanceof Error;
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
