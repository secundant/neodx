import type { Colors } from '@neodx/colors';
import { colors as defaultColors } from '@neodx/colors';
import { isEmpty, isPrimitive, keys, omit, pick, toArray, True } from '@neodx/std';
import { existsSync, readFileSync } from 'node:fs';
import { relative } from 'pathe';
import { serializeJSON } from '../../utils';
import { cliSymbols } from '../shared';
import { printCodeFrame } from './print-code-frame';
import { newlineRe } from './source-map';
import { type ParsedStack, parseStackTraces } from './stack-trace';

export interface PrintPrettyErrorOptions {
  cwd?: string;
  indent?: number;
  colors?: Colors;
  fullStack?: boolean;
  codeFrame?: boolean | 'auto' | GetHighlightStacks;
  stringify?: (value: unknown) => string;
  filterStack?: (stack: ParsedStack) => boolean;
}

export type GetHighlightStacks = (stacks: ParsedStack[]) => ParsedStack | ParsedStack[];

export function printPrettyError(originalError: unknown, options: PrintPrettyErrorOptions = {}) {
  const {
    cwd = process.cwd(),
    indent = 0,
    codeFrame = true,
    fullStack = false,
    stringify = value => serializeJSON(value, 2),
    filterStack,
    colors = defaultColors
  } = options;
  const getHighlightedStacks = codeFrame ? toCodeFrameCondition(codeFrame) : null;
  const error = toError(originalError);

  const stacks = parseStackTraces(error.stack || '', fullStack ? True : filterStack);
  const errorProperties = omit(Object.fromEntries(Object.entries(error)), excludedProps);
  const highlightedStacks = toArray(getHighlightedStacks?.(stacks) ?? []);
  const prefix = (value = indent) => (value ? ' '.repeat(value) : '');

  const messageParts = stacks.flatMap(stack => {
    const { file, column, line, method } = stack;
    const highlighted = highlightedStacks.includes(stack);
    const color = highlighted ? colors.cyan : colors.gray;
    const path = relative(cwd, file);

    return [
      color(
        `${prefix()} ${colors.dim(
          highlighted ? cliSymbols.pointerSmallDouble : cliSymbols.pointerSmall
        )} ${[method, `${prefix()}${path}:${colors.dim(`${line}:${column}`)}`]
          .filter(Boolean)
          .join(' ')}`
      ),
      highlighted &&
        colors.yellow(
          printCodeFrame({
            lineNumber: line,
            columnNumber: column,
            source: readFileSync(file, 'utf-8'),
            indent: indent + 3,
            colors
          })
        )
    ];
  });

  if (!isEmpty(keys(errorProperties))) {
    messageParts.push(
      `${prefix()}${colors.red(`${cliSymbols.longArrowRight} serialized error properties:`)}`,
      `${colors.gray(
        stringify(errorProperties)
          .split(newlineRe)
          .map(line => `${prefix()}${line}`)
          .slice(1, -1)
          .join('\n')
      )}`
    );
  }

  if (error.cause && typeof error.cause === 'object' && 'name' in error.cause) {
    error.cause.name = `${cliSymbols.enter} caused by ${error.cause.name}`;

    messageParts.push(
      ' ',
      printPrettyError(error.cause, {
        ...options,
        indent: indent + 2,
        codeFrame: false
      })
    );
  }

  return [
    colors.red(`${prefix()}${colors.bold(error.name || 'Unknown Error')}: ${error.message}`),
    ...messageParts
  ]
    .filter(Boolean)
    .join('\n');
}

const toCodeFrameCondition = (codeFrame: true | 'auto' | GetHighlightStacks): GetHighlightStacks =>
  typeof codeFrame === 'function'
    ? codeFrame
    : stacks => stacks.find(stack => existsSync(stack.file))!;

const toError = (error?: unknown) => {
  if (!error) {
    return pick(new Error('unknown error'), ['message', 'stack']) as Error;
  }
  if (isPrimitive(error)) {
    const stack = String(error);

    return {
      message: stack.split(/\n/g)[0],
      stack
    } as Error;
  }
  return error as Error;
};

const excludedProps = ['stack', 'cause', 'name', 'message'];
