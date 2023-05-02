const label = 'Bad invariant';

/**
 * Throw an error if the condition fails, in production the message is stripped out
 * @param condition A condition to check
 * @param message A message or function that returns a message to throw
 */
export function invariant(
  condition: unknown,
  message?: string | (() => string)
): asserts condition {
  if (condition) return;
  if (process.env.NODE_ENV === 'production') {
    throw new Error(label);
  }
  const messageString = typeof message === 'function' ? message() : message;

  throw new Error(messageString ? `${label}: ${messageString}` : label);
}
