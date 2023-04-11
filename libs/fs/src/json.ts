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
 * TODO Think about real requirements for using JSONC
 * Alias for JSON.parse, parses JSON as regular JSON or as JSONC (like a tsconfig)
 */
export function parseJson<T = unknown>(input: string, options?: ParseJsonParams): T {
  try {
    return parseJsonAsJSON(input);
  } catch {
    return parseJsonAsJSONC(input, options);
  }
}

/**
 * @todo Replace with safe version of JSON.stringify, prevents circular refs
 * Alias for JSON.stringify, serializes the given data to a JSON string
 */
export function serializeJson<T = unknown>(
  input: T,
  { spaces = 2, replacer = null }: SerializeJsonParams = {}
) {
  return JSON.stringify(input, replacer, spaces) + '\n';
}

// TODO: Replace with safe JSON parser with circular references support
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
