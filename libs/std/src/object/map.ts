import { entries } from '../shared';

export function mapObject<Input extends Record<keyof any, unknown>, OutputValue>(
  target: Input,
  fn: <Key extends keyof Input>(key: Key, value: Input[Key]) => OutputValue
) {
  return Object.fromEntries(
    entries(target).map(([key, value]) => [key, fn(key as keyof Input, value as any)])
  ) as Record<keyof Input, OutputValue>;
}
