import { type AnyObj, isEmpty, isError, isObjectLike } from '@neodx/std';

export type LogArguments = [messageFragments: unknown[], fields: AnyObj, error?: Error];

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

  if (isError(firstArg)) {
    return [isEmpty(otherArgs) ? [firstArg.message] : otherArgs, {}, firstArg];
  }

  if (isObjectLike(firstArg)) {
    if ('err' in firstArg && isError(firstArg.err)) {
      const { err, ...fields } = firstArg;

      return [isEmpty(otherArgs) ? [err.message] : otherArgs, fields, err];
    }

    return [otherArgs, firstArg as any];
  }

  return [args, {}];
}
