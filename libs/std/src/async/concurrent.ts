export function concurrent<Input, Output>(
  handler: (input: Input) => Promise<Output>,
  concurrency = 10
) {
  return async (inputs: readonly Input[]) => {
    const resultsMap = new Map<Input, Output>();
    const pending = new Set<Input>();
    const queue = [...inputs];

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
    return inputs.map(input => resultsMap.get(input)!);
  };
}
