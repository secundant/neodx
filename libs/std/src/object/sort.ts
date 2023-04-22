export function sortObject<T extends object>(
  target: T,
  compareFn: <A extends Extract<keyof T, string>, B extends Extract<keyof T, string>>(
    a: [A, T[A]],
    b: [B, T[B]]
  ) => number
) {
  return Object.fromEntries(Object.entries(target).sort(compareFn as any)) as T;
}

export function sortObjectByKeys<T extends Record<keyof any, unknown>>(obj: T) {
  return sortObject(obj, ([a], [b]) => a.localeCompare(b));
}

/**
 * Sorts an object by the order of the keys in the given array.
 * Keys not in the array will be sorted after the keys in the array.
 * @param obj
 * @param order
 */
export function sortObjectByOrder<T extends Record<keyof any, unknown>>(
  obj: T,
  order: (keyof T)[]
) {
  return sortObject(obj, ([a], [b]) => {
    const aIndex = order.indexOf(a);
    const bIndex = order.indexOf(b);

    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1 || bIndex === -1) return aIndex === -1 ? 1 : -1;
    return aIndex - bIndex;
  });
}
