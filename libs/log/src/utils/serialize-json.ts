/**
 * Safe version of JSON.stringify, prevents circular refs
 * @example serializeJSON({ record: { value: 1, name: 'age' }, valid: false })
 */
export const serializeJSON = (value: unknown, space?: string | number) =>
  JSON.stringify(value, createJSONReplacer(), space);

export const cycleRef = (tokens: string[] = []) =>
  `[Circular${tokens.length > 0 ? ' ' + tokens.join('.') : ''}]`;

function createJSONReplacer() {
  const stack: unknown[] = [];
  const keys: string[] = [];

  const getCircularKey = (index: number) => cycleRef(index > 0 ? keys.slice(0, index) : []);

  return function replacer(this: unknown, key: string, value: unknown) {
    if (stack.length === 0) {
      stack.push(value);

      return value;
    }

    const thisIndex = stack.indexOf(this);
    const thisInStack = thisIndex >= 0;

    if (thisInStack) {
      stack.splice(thisIndex + 1);
      keys.splice(thisIndex, Infinity, key);
    } else {
      stack.push(this);
      keys.push(key);
    }

    if (stack.includes(value)) {
      return getCircularKey(stack.indexOf(value));
    }

    return value;
  };
}
