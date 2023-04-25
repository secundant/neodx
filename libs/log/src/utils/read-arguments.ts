export type LogArguments = [
  messageFragments: unknown[],
  fields: Record<keyof any, unknown>,
  error?: Error
];

/**
 * Reads arguments array and extract fields, error and message arguments.
 * @return [messageFragments, fields, error]
 *
 * Strings
 * @example readArguments('hello') -> [ ['hello'], {} ]
 * @example readArguments('hello %s', 'world') -> [ ['hello %s', 'world'], {} ]
 * @example readArguments('hello %s %d %j', 'world', 1, { id: 2 }) -> [ ['hello %s %d %j', 'world', 1, { id: 2 }], {} ]
 *
 * Additional fields
 * @example readArguments({ id: 2 }) -> [ [], { id: 2 } ]
 * @example readArguments({ id: 2 }, 'hello') -> [ ['hello'], { id: 2 } ]
 * @example readArguments({ id: 2 }, 'hello %s', 'world') -> [ ['hello %s', 'world'], { id: 2 } ]
 *
 * Errors
 * @example readArguments(myError) -> [ ['my error'], {}, myError ]
 * @example readArguments({ err: myError }) -> [ ['my error'], {}, myError ]
 * @example readArguments({ err: myError, id: 2 }) -> [ ['my error'], { id: 2 }, myError ]
 * @example readArguments({ err: myError, id: 2 }, 'hello') -> [ ['hello'], { id: 2 }, myError ]
 * @example readArguments({ err: myError, id: 2 }, 'hello %s', 'world') -> [ ['hello %s', 'world'], { id: 2 }, myError ]
 */
export function readArguments(args: unknown[]): LogArguments {
  const [firstArg, ...otherArgs] = args;
  const firstArgIsError = firstArg instanceof Error;
  const firstArgIsObject = typeof firstArg === 'object' && firstArg !== null;

  if (firstArgIsError) {
    return [otherArgs.length > 0 ? otherArgs : [firstArg.message], {}, firstArg];
  }

  if (firstArgIsObject) {
    if (hasErr(firstArg)) {
      const { err, ...fields } = firstArg;

      return [otherArgs.length > 0 ? otherArgs : [err.message], fields, err];
    }

    return [otherArgs, firstArg as any];
  }

  return [args, {}];
}

const hasErr = (target: object): target is { err: Error } =>
  'err' in target && target.err instanceof Error;
