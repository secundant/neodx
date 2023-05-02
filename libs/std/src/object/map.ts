import { entries } from '../shared';

export function mapObject<Input extends Record<keyof any, unknown>, OutputValue>(
  target: Input,
  fn: <Key extends keyof Input>(value: Input[Key], key: Key) => OutputValue
) {
  return Object.fromEntries(
    entries(target).map(([key, value]) => [key, fn(value as any, key as keyof Input)])
  ) as Record<keyof Input, OutputValue>;
}
