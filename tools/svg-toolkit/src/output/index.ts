import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { INode } from 'svgson';
import type { Configuration } from '@/create-configuration';
import type { Input } from '@/input';
import { groupInputs } from '@/input';
import { renderSvgNodesToSpriteString } from '@/output/render';
import { ensureUpward } from '@/utils';

export async function writeSprites(
  inputs: Input[],
  nodes: Map<Input, INode>,
  { group, output: { staticRoot, fileName, root: outputRoot }, plugin }: Configuration
) {
  const getContent = (nodes: INode[]) =>
    plugin.transformSprite(renderSvgNodesToSpriteString(nodes));

  if (group) {
    const groups = groupInputs(inputs, group);

    for (const [groupName, groupInputs] of Object.entries(groups)) {
      await writeSpriteToFS(
        resolve(staticRoot, fileName.replaceAll('{name}', groupName)),
        await getContent(groupInputs.map(input => nodes.get(input)!))
      );
    }
    await plugin.afterWrite({
      nodes,
      groups,
      outputRoot
    });
  } else {
    await writeSpriteToFS(
      resolve(staticRoot, fileName),
      await getContent(Array.from(nodes.values()))
    );
    await plugin.afterWrite({
      nodes,
      groups: null,
      outputRoot
    });
  }
}

async function writeSpriteToFS(path: string, content: string) {
  await ensureUpward(path);
  await writeFile(path, content, 'utf-8');
}
