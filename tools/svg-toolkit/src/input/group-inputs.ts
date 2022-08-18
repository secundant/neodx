import { dirname } from 'node:path';
import type { Input } from '@/input/get-inputs';

export const groupInputs = (items: Input[], fn: GroupInputFn) =>
  items.reduce<InputGroups>((acc, item) => {
    const key = fn(item);

    acc[key] ||= [];
    acc[key].push(item);
    return acc;
  }, {});

export const groupByPath = ({ path }: Input) => {
  const base = dirname(path);

  return base === '.' ? 'default' : base;
};

export type InputGroups = Record<string, Input[]>;
export type GroupInputFn = typeof groupByPath;
