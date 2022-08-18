import { resolve } from 'node:path';
import type { INode } from 'svgson';
import type { Configuration } from '@/create-configuration';
import { getInputs, Input } from '@/input';
import { writeSprites } from '@/output';
import { processInput } from '@/processing';

export async function generateSvgSprites(configuration: Configuration) {
  const { cwd, input, inputRoot } = configuration;
  const { default: ora } = await import('ora');
  const progress = ora().start('Loading sources');
  const inputs = await getInputs(resolve(cwd, inputRoot), input);

  progress.succeed(`Found ${inputs.length} files`).stop();
  const nodesMap = new Map<Input, INode>();

  progress.start('');
  for (const input of inputs) {
    nodesMap.set(input, await processInput(input, configuration));
    progress.text = `[${nodesMap.size}/${inputs.length}] processing...`;
  }
  progress.succeed('Done!');
  await writeSprites(inputs, nodesMap, configuration);
}
