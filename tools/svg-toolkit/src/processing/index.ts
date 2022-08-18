import { readFile } from 'node:fs/promises';
import type { Configuration } from '@/create-configuration';
import type { Input } from '@/input/get-inputs';
import { parseSvgContentToJson } from '@/processing/parse';

export async function processInput(input: Input, { transform, plugin }: Configuration) {
  const content = await readFile(input.absolutePath, 'utf-8');

  return parseSvgContentToJson(input.name, await plugin.transformChunk(input, content), transform);
}
