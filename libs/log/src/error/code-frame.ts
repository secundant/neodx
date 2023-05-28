import { type Colors, colors as defaultColors } from '@neodx/colors';
import { sum } from '@neodx/std';
import cliTruncate from 'cli-truncate';
import { getNewLineLength, getPointerOffset, newlineRe } from './source-map';

export interface PrintCodeFrameOptions {
  colors?: Colors;
  source: string;
  indent?: number;
  lineNumber: number;
  columnNumber: number;
  overscan?: number;
}

export function printCodeFrame({
  colors = defaultColors,
  indent = 0,
  columnNumber,
  lineNumber,
  source,
  overscan = 2
}: PrintCodeFrameOptions): string {
  const newLineLength = getNewLineLength(source);
  const pointerOffset = getPointerOffset(source, lineNumber, columnNumber);

  const sourceLines = source.split(newlineRe);
  const currentOffset = sum(
    sourceLines.slice(0, lineNumber).map(line => line.length + newLineLength)
  );
  const startIndex = Math.max(0, lineNumber - 1 - overscan);
  const printedLines = sourceLines.slice(startIndex, lineNumber + overscan);

  const cliColumnsLength = process.stdout.columns || 80;
  const maxCliColumnSize = cliColumnsLength - 5 - indent;

  console.log({
    currentOffset,
    pointerOffset,
    newLineLength,
    sourceLines,
    startIndex,
    printedLines,
    cliColumnsLength,
    maxCliColumnSize
  });
  if (printedLines.length === 0 || printedLines.some(isMinifiedCodeLike)) return '';

  const printUnderline = (line: string, offset: number) =>
    fillSpace(offset) + colors.red('^'.repeat(Math.max(1, line.length - offset)));
  const printLineNo = (no: number | string = '') => colors.gray(`${String(no).padStart(3, ' ')}| `);

  return printedLines
    .flatMap((line, index) => {
      const lineNo = startIndex + index + 1;

      return [
        printLineNo(lineNo) + cliTruncate(line.replace(/\t/g, ' '), maxCliColumnSize),
        lineNo === lineNumber &&
          printLineNo() + printUnderline(line, pointerOffset - (currentOffset - line.length))
      ];
    })
    .filter(Boolean)
    .map(line => (indent ? fillSpace(indent) + line : line))
    .join('\n');
}

// to long, maybe it's a minified file, skip for codeframe
const isMinifiedCodeLike = (code: string) => code.length > 240;
const fillSpace = (length: number) => ' '.repeat(length);
