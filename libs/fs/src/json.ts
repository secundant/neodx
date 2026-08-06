import type { ParseError, ParseOptions } from 'jsonc-parser';
import { parse, printParseErrorCode } from 'jsonc-parser';

export type ParseJsonParams = ParseOptions;

export interface SerializeJsonParams {
  /**
   * Text ident whitespaces value
   * @default 2
   */
  spaces?: number;
  replacer?: Parameters<typeof JSON.stringify>[1] | null;
}

/**
 * Parses `input` as JSON, falling back to JSONC (e.g. `tsconfig.json`) on `JSON.parse` failure.
 * JSONC contract is deferred to #166; today it is an incidental fallback, not a first-class mode.
 */
export function parseJson<T = unknown>(input: string, options?: ParseJsonParams): T {
  try {
    return parseJsonAsJSON(input);
  } catch {
    return parseJsonAsJSONC(input, options);
  }
}

/**
 * Serializes `input` to a JSON string with a trailing newline. Not circular-reference safe;
 * a safe-serialize policy is deferred to #166.
 */
export function serializeJson<T = unknown>(
  input: T,
  { spaces = 2, replacer = null }: SerializeJsonParams = {}
) {
  return JSON.stringify(input, replacer, spaces) + '\n';
}

// Safe JSON parsing with circular-reference support is deferred to #166.
const parseJsonAsJSON = <T = unknown>(input: string) => JSON.parse(input) as T;
const parseJsonAsJSONC = <T = unknown>(input: string, options?: ParseJsonParams) => {
  const errors: ParseError[] = [];
  const result: T = parse(input, errors, options);

  assertNoErrors(errors);
  return result;
};

const assertNoErrors = (errors: ParseError[]) => {
  if (errors.length > 0) {
    throw new Error(`JSON parsing errors:
  ${errors
    .map(({ error, offset }) => `${printParseErrorCode(error)} at position ${offset}`)
    .join('\n  ')}`);
  }
};
