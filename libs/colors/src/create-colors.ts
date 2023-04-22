import { entries, identity } from '@neodx/std';

export function createColors(isTTY = false, disabled = false) {
  const enabled =
    !disabled &&
    typeof process !== 'undefined' &&
    !('NO_COLOR' in process.env || process.argv.includes('--no-color')) &&
    !('GITHUB_ACTIONS' in process.env) &&
    ('FORCE_COLOR' in process.env ||
      process.argv.includes('--color') ||
      process.platform === 'win32' ||
      (isTTY && process.env.TERM !== 'dumb') ||
      'CI' in process.env);

  return Object.fromEntries(
    colorsEntries.map(([color]) => [color, enabled ? formatters[color] : identity])
  ) as Colors;
}

export type Colors = Record<ColorName, ColorFormatter>;
export type ColorName = keyof typeof colorsMap;
export type ColorFormatter = (message: string) => string;

const colorsMap = {
  // modifiers
  reset: [0, 0],
  bold: [1, 22],
  dim: [2, 22],
  italic: [3, 23],
  underline: [4, 24],
  inverse: [7, 27],
  hidden: [8, 28],
  strikethrough: [9, 29],

  // colors
  black: [30, 39],
  red: [31, 39],
  green: [32, 39],
  yellow: [33, 39],
  blue: [34, 39],
  magenta: [35, 39],
  cyan: [36, 39],
  white: [37, 39],
  gray: [90, 39],

  // background colors
  bgBlack: [40, 49],
  bgRed: [41, 49],
  bgGreen: [42, 49],
  bgYellow: [43, 49],
  bgBlue: [44, 49],
  bgMagenta: [45, 49],
  bgCyan: [46, 49],
  bgWhite: [47, 49]
} satisfies Record<string, [open: number, close: number]>;
const colorsEntries = entries(colorsMap);
const formatters = Object.fromEntries(
  colorsEntries.map(([key, [openCode, closeCode]]) => {
    const rgx = new RegExp(`\\x1b\\[${closeCode}m`, 'g');
    const open = `\u001B[${openCode}m`;
    const close = `\u001B[${closeCode}m`;

    return [
      key,
      (message: string) =>
        open + (!message.includes(close) ? message.replace(rgx, close + open) : message) + close
    ];
  })
);
