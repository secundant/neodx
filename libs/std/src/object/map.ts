import { entries } from '../shared';

export function mapValues<
  Input extends Record<keyof any, any>,
  Result extends {
    [Key in keyof Input]: any;
  }
>(target: Input, fn: <Key extends keyof Input>(value: Input[Key], key: Key) => Result[Key]): Result;
export function mapValues<Input extends Record<keyof any, any>, OutputValue>(
  target: Input,
  fn: <Key extends keyof Input>(value: Input[Key], key: Key) => OutputValue
) {
  return Object.fromEntries(
    entries(target).map(([key, value]) => [key, fn(value as any, key as keyof Input)])
  ) as Record<keyof Input, OutputValue>;
}
