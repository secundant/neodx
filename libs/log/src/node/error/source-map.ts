import { fromLength, sum } from '@neodx/std';

// eslint-disable-next-line @typescript-eslint/prefer-includes
export const getNewLineLength = (source: string): number => (/\r\n/.test(source) ? 2 : 1);

export function getPointerOffset(source: string, lineNumber: number, columnNumber: number): number {
  const lines = source.split(newlineRe);

  if (lineNumber > lines.length) {
    return source.length;
  }
  const newLineLength = getNewLineLength(source);

  return sum(fromLength(lineNumber - 1, no => lines[no].length + newLineLength)) + columnNumber;
}

export const newlineRe = /\r?\n/;
