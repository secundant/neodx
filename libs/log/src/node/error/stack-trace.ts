import { toInt } from '@neodx/std';
import { resolve } from 'pathe';

export interface ParsedStack {
  file: string;
  line: number;
  method: string;
  column: number;
}

export const parseStackTraces = (
  originalTrace: string,
  filter: (trace: ParsedStack) => boolean = notInternals
) =>
  originalTrace
    .split('\n')
    .map(parseSingleStack)
    .filter((stack): stack is ParsedStack => stack !== null && filter(stack));

// Based on https://github.com/stacktracejs/error-stack-parser
// Credit to stacktracejs
export function parseSingleStack(raw: string): ParsedStack | null {
  let line = raw.trim();

  if (line.includes('(eval ')) {
    line = line.replace(/eval code/g, 'eval').replace(/(\(eval at [^()]*)|(,.*$)/g, '');
  }

  let sanitizedLine = line
    .replace(/^\s+/, '')
    .replace(/\(eval code/g, '(')
    .replace(/^.*?\s+/, '');

  // capture and preserve the parenthesized location "(/foo/my bar.js:12:87)" in
  // case it has spaces in it, as the string is split on \s+ later on
  const location = sanitizedLine.match(/ (\(.+\)$)/);

  if (location) {
    // remove the parenthesized location from the line, if it was matched
    sanitizedLine = sanitizedLine.replace(location[0], '');
  }

  // if a location was matched, pass it to extractLocation() otherwise pass all sanitizedLine
  // because this line doesn't have function name
  const [url, lineNumber, columnNumber] = parseTraceLocation(
    location ? location[1]! : sanitizedLine
  );
  let method = (location && sanitizedLine) || '';
  let file = url && ['eval', '<anonymous>'].includes(url) ? undefined : url;

  if (!file || !lineNumber || !columnNumber) return null;
  if (method.startsWith('async ')) method = method.slice(6);
  if (file.startsWith('file://')) file = file.slice(7);

  return {
    // normalize Windows path (\ -> /)
    file: resolve(file),
    line: toInt(lineNumber),
    column: toInt(columnNumber),
    method
  };
}

export type TraceLocation = [url: string, line?: string, column?: string];

export function parseTraceLocation(urlLike: string): TraceLocation {
  // Fail-fast but return locations like "(native)"
  if (!urlLike.includes(':')) return [urlLike];

  return (
    (LOCATIONS_RE.exec(urlLike.replace(/^\(|\)$/g, ''))?.slice(1, 4) as TraceLocation) ?? [urlLike]
  );
}

const LOCATIONS_RE = /(.+?)(?::(\d+))?(?::(\d+))?$/;
const notInternals = (stack: ParsedStack) => !stack.file.match('node:internal');
