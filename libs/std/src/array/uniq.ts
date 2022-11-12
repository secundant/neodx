export const uniq = <T>(list: Iterable<T>) => Array.from(new Set(list));
export const uniqBy = <T, Key>(list: Iterable<T>, keyFn: (value: T) => Key): T[] => {
  const store = new Map<Key, T>();

  for (const item of list) {
    const key = keyFn(item);

    if (!store.has(key)) {
      store.set(key, item);
    }
  }
  return Array.from(store.values());
};
