/**
 * Reads arguments array and extract fields, error and message arguments
 *
 * Strings
 * @example readArguments('hello') -> { message: ['hello'] }
 * @example readArguments('hello %s', 'world') -> { message: ['hello %s', 'world'] }
 *
 * Additional fields
 * @example readArguments({ id: 2 }) -> { fields: { id: 2 }, message: [] }
 * @example readArguments({ id: 2 }, 'hello') -> { fields: { id: 2 }, message: ['hello'] }
 * @example readArguments({ id: 2 }, 'hello %s', 'world') -> { fields: { id: 2 }, message: ['hello %s', 'world'] }
 *
 * Errors
 * @example readArguments(myError) -> { err: myError, message: ['my error'] }
 * @example readArguments({ err: myError }) -> { err: myError, message: ['my error'] }
 * @example readArguments({ err: myError, id: 2 }) -> { err: myError, fields: { id: 2 }, message: ['my error'] }
 * @example readArguments({ err: myError, id: 2 }, 'hello') -> { err: myError, fields: { id: 2 }, message: ['hello'] }
 */
export function readArguments(args: unknown[]) {
  const [firstArg, ...otherArgs] = args;
  const firstArgIsError = firstArg instanceof Error;
  const firstArgIsObject = typeof firstArg === 'object' && firstArg !== null;

  if (firstArgIsError) {
    return {
      err: firstArg,
      fields: {},
      message: otherArgs.length > 0 ? otherArgs : [firstArg.message]
    };
  }

  if (firstArgIsObject) {
    if (hasErr(firstArg)) {
      const { err, ...fields } = firstArg;

      return {
        err,
        fields,
        message: otherArgs.length > 0 ? otherArgs : [err.message]
      };
    }

    return {
      fields: firstArg,
      message: otherArgs
    };
  }

  return {
    message: args,
    fields: {}
  };
}

const hasErr = (target: object): target is { err: Error } =>
  Object.hasOwn(target, 'err') && (target as any).err instanceof Error;
