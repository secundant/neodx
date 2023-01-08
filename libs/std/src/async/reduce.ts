export const asyncReduce = <T, R>(
  list: T[],
  reducer: (acc: R, item: T, index: number) => R | Promise<R>,
  initialValue: R
) =>
  list.reduce<Promise<R>>(
    (accPromise, item, index) => accPromise.then(acc => reducer(acc, item, index)),
    Promise.resolve(initialValue)
  );
