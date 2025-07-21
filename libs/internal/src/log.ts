import { compact, type Falsy } from '@neodx/std';

export const timeDisplay = () => {
  const start = Date.now();

  return () => formatTimeMs(Date.now() - start);
};

export const formatTimeMs = (time: number) => {
  const showSeconds = time >= 100;
  const timeValue = showSeconds ? time / 1000 : time;

  return timeValue
    .toLocaleString('en', {
      style: 'unit',
      unit: showSeconds ? 'second' : 'millisecond',
      unitDisplay: 'narrow'
    })
    .padEnd(showSeconds ? 6 : 4);
};

export const formatList = (list: Array<string | Falsy>, max = 4) => {
  const visible = compact(list);
  const extra = visible.slice(max).length;

  return visible.length > 0
    ? listFormatter.format(extra ? visible.slice(0, max - 1).concat(`${extra} more`) : visible)
    : 'none';
};

const listFormatter = new Intl.ListFormat('en', {
  style: 'short',
  type: 'unit'
});
