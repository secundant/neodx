import { fromRange } from '@neodx/std';
import type { ExplicitRule } from 'grammex';
import { parse } from 'grammex';

export const isStaticGlob = (glob: string) => /^(?:\\.|[ a-zA-Z0-9/._-])*$/.test(glob);
export const escapeGlob = (glob: string) =>
  glob.replace(/(\\.)|([$.*+?!^(){}[\]|])|(.)/gs, (_, $1, $2, $3) => $1 || $3 || `\\${$2}`);
export const unescapeGlob = (glob: string) => glob.replace(/\\?(.)/g, '$1');

export const intToAlpha = (int: number) => {
  let alpha = '';

  while (int > 0) {
    alpha = alphabet[(int - 1) % alphabetLength] + alpha;
    int = Math.floor((int - 1) / alphabetLength);
  }

  return alpha;
};

export const alphaToInt = (str: string) =>
  Array.from(str).reduce((int, char) => int * 26 + alphabet.indexOf(char) + 1, 0);

export const createPaddedIntRange = (start: number, end: number, paddingLength: number) =>
  fromRange(start, end, int => String(int).padStart(paddingLength, '0'));

export const createAlphaRange = (start: string, end: string) =>
  fromRange(alphaToInt(start), alphaToInt(end), intToAlpha);

export const createParser = (grammar: ExplicitRule<string>) => (input: string) =>
  parse(input, grammar, { memoization: false }).join('');

// Chars for static parts between globs (e.g. 'foo' or '.js' in 'foo/**/*{.js,.ts}')
export const inlineChars = '[ a-zA-Z0-9._-]';

const alphabet = 'abcdefghijklmnopqrstuvwxyz';
const alphabetLength = alphabet.length;
