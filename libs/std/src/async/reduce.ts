export const asyncReduce = <T, R>(
  list: T[],
  reducer: (acc: R, item: T, index: number) => R | Promise<R>,
  initialValue: R
): Promise<R> =>
  list.reduce(
    (accPromise, item, index) => accPromise.then(acc => reducer(acc, item, index)),
    Promise.resolve(initialValue)
  );
