/**
 * Concurrently run a handler on a list of inputs
 * @param inputs The list of inputs to run the handler on
 * @param handler The handler to run on each input
 * @param concurrency The number of concurrent handlers to run at once (default: 10)
 * @returns A promise that resolves to the list of results
 * @example
 * const results = await concurrently(
 *  [1, 2, 3, 4, 5, 6],
 *  getUserById,
 *  2 // only run 2 requests at a time
 * );
 * console.log(results); // [user1, user2, user3, user4, user5, user6]
 */
export async function concurrently<Input, Output>(
  inputs: Iterable<Input>,
  handler: (input: Input) => Promise<Output>,
  concurrency = 10
) {
  const resultsMap = new Map<Input, Output>();
  const pending = new Set<Input>();
  const original = [...inputs];
  const queue = [...original];

  async function run(input: Input) {
    pending.add(input);
    const output = await handler(input);

    resultsMap.set(input, output);
    pending.delete(input);
  }

  async function next(): Promise<unknown> {
    if (pending.size >= concurrency) {
      return;
    }
    const nextInput = queue.shift();

    if (!nextInput) {
      return;
    }
    if (pending.has(nextInput) || resultsMap.has(nextInput)) {
      return next();
    }
    return Promise.all([run(nextInput).then(next), next()]);
  }

  await next();
  return original.map(input => resultsMap.get(input)!);
}

/**
 * Create an async concurrent function
 * @param handler The handler to run on each input
 * @param concurrency The number of concurrent handlers to run at once (default: 10)
 */
export function concurrent<Input, Output>(
  handler: (input: Input) => Promise<Output>,
  concurrency = 10
) {
  return async (inputs: Iterable<Input>) => concurrently(inputs, handler, concurrency);
}
