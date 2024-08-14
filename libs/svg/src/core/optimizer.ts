import { createSvgoConfig, type CreateSvgoConfigParams } from '@neodx/internal/svgo';
import { identity } from '@neodx/std';
import { optimize } from 'svgo';

export type SvgOptimizer = ReturnType<typeof createSvgOptimizer>;

/**
 * Creates SVG optimization API for minifying regular SVG files and SVG sprites
 */
export function createSvgOptimizer(input: CreateSvgoConfigParams | boolean = true) {
  if (!input) return fallback;
  const params = input === true ? {} : input;

  const applySvgo = (content: string, overrides?: Partial<CreateSvgoConfigParams>) => {
    try {
      return optimize(
        content,
        createSvgoConfig({
          ...params,
          ...overrides
        })
      ).data;
    } catch (error) {
      console.error(error);
      return content;
    }
  };

  return {
    symbol: (content: string) =>
      applySvgo(content, {
        spriteMode: false,
        config: {
          plugins: [
            {
              name: 'cleanupIds',
              params: {
                minify: false,
                remove: false
              }
            }
          ]
        }
      }),
    sprite: (content: string) => applySvgo(content, { spriteMode: true })
  };
}

const fallback = {
  symbol: identity,
  sprite: identity
};
