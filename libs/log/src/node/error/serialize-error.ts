import { isEmpty, keys, omit } from '@neodx/std';

/**
 * Serialize an error into a plain object that can be serialized into JSON then.
 */
export function serializeError(error: Error) {
  const result: Record<string, unknown> = {
    name: error.name,
    stack: error.stack,
    message: error.message,
    ...getErrorCustomProperties(error)
  };

  if (error.cause instanceof Error) {
    result.cause = serializeError(error.cause);
  }

  return result;
}

export function getErrorCustomProperties(error: Error) {
  const errorProperties = omit(Object.fromEntries(Object.entries(error)), builtInErrorProps);

  return isEmpty(keys(errorProperties)) ? null : errorProperties;
}

const builtInErrorProps = ['stack', 'cause', 'name', 'message'];
