import { fileURLToPath } from 'node:url';
import { build } from 'vite';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default async function generateSprites() {
  await build({
    root: __dirname
  });
}
