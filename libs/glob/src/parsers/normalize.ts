import { identity } from '@neodx/std';
import { match, or, star } from 'grammex';
import { createParser } from '../shared.ts';

const Escaped = match(/\\./, identity);
const Passthrough = match(/./, identity);

const StarStarStar = match(/\*\*\*+/, '*');

const StarStarNoLeft = match(/([^/{[(!])\*\*/, (_, $1) => `${$1}*`);
const StarStarNoRight = match(/(^|.)\*\*(?=[^*/)\]}])/, (_, $1) => `${$1}*`);

export const normalize = createParser(
  star(or([Escaped, StarStarStar, StarStarNoLeft, StarStarNoRight, Passthrough]))
);
