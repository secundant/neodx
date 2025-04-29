import { createSvgSpriteBuilder } from '@neodx/svg';

const __dirname = new URL('.', import.meta.url).pathname;

export default async function generateSprites() {
  const builder = createSvgSpriteBuilder({
    inputRoot: `${__dirname}/src/assets`,
    output: `${__dirname}/public/sprites`,
    fileName: 'sprite.svg',
    group: false, // No grouping for test simplicity
    optimize: true,
    inline: 'auto',
    cleanup: 'force',
    metadata: `${__dirname}/src/sprite.gen.ts`
  });

  await builder.load('**/*.svg');
  await builder.build();
}
