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
