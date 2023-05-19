export function renderWaterfall<Value>(
  items: [value: Value, start: number, end: number][],
  render: (value: Value) => string = value => `>${value}`,
  emptySymbol = '=',
  filledSymbol = '#'
) {
  // eslint-disable-next-line unicorn/no-unreadable-array-destructuring
  const maxEnd = Math.max(...items.map(([, , end]) => end));

  const rendered = items
    .map(([input, start, end]) =>
      [
        '[',
        emptySymbol.repeat(start),
        `${render(input)}`.padEnd(end - start, filledSymbol),
        emptySymbol.repeat(maxEnd - end),
        ']'
      ].join('')
    )
    .join('\n');

  return ['', rendered, ''].join('\n');
}

export function createMicroTimer() {
  let passed = 0;
  let tasks: [resolve: (value: number) => void, left: number][] = [];
  const tick = async () => {
    if (tasks.length === 0) {
      return;
    }
    passed++;
    for (const task of tasks) {
      const [resolve, left] = task;

      task[1]--;
      if (left === 1) {
        resolve(passed);
      }
    }
    tasks = tasks.filter(([, left]) => left > 0);
    await new Promise<void>(r => setTimeout(r, 0)); // any timeout
    await tick();
  };

  return {
    get passed() {
      return passed;
    },
    wait(ms: number) {
      return new Promise<number>(resolve => tasks.push([resolve, ms]));
    },
    start() {
      return tick();
    }
  };
}
