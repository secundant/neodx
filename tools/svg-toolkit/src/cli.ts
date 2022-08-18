import { cosmiconfig } from 'cosmiconfig';
import sade from 'sade';
import { createConfiguration } from '@/create-configuration';
import { generateSvgSprites } from '@/generate';

export function createSvgCli(cwd: string) {
  const program = sade('sprite');
  const explorer = cosmiconfig('sprite');

  return program.command('build').action(async () => {
    const found = await explorer.search();

    if (!found || found.isEmpty) {
      throw new Error(`Not found configuration file`);
    }
    const configuration = createConfiguration(cwd, found.config);

    await generateSvgSprites(configuration);
  });
}
