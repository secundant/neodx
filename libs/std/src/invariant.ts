import type { Falsy } from './shared';

const label = 'Bad invariant';

type MessageArg = string | (() => string);

/**
 * Throw an error if the condition fails, in production the message is stripped out
 * @param condition A condition to check
 * @param message A message or function that returns a message to throw
 */
export function invariant<T>(condition: T | Falsy, message?: MessageArg): asserts condition is T;
export function invariant(condition: unknown, message?: MessageArg): asserts condition {
  if (condition) return;
  if (process.env.NODE_ENV === 'production') {
    throw new Error(label);
  }
  const messageString = typeof message === 'function' ? message() : message;

  throw new Error(messageString ? `${label}: ${messageString}` : label);
}
