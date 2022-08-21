import { readFile } from 'fs/promises';
import { basename, join, resolve } from 'node:path';
import ora from 'ora';
import glob from 'tiny-glob';
import type { Context, InputPath, SvgSource } from '@/types';
import { asyncReduce, uniq } from '@/utils';

export class Scanner {
  private progress = ora();

  constructor(readonly context: Context) {}

  async scan() {
    this.progress.start('Scanning...');
    const { input, inputRoot } = this.context;
    const found = await asyncReduce(
      input,
      async (acc, pattern) => acc.concat(await this.globPattern(pattern)),
      [] as string[]
    );
    const filesList = uniq(found).map<InputPath>(path => ({
      absolute: resolve(inputRoot.absolute, path),
      relativeToCwd: join(inputRoot.relativeToCwd, path),
      relativeToInputRoot: path
    }));

    const sources = await asyncReduce(
      filesList,
      async (acc, inputPath) => {
        const source = await this.readFileSource(inputPath);

        this.progress.text = `[${acc.length + 1}/${filesList.length}] scanned...`;
        return acc.concat(source);
      },
      [] as SvgSource[]
    );

    this.progress.succeed(`[${sources.length}/${sources.length}] scanned`);
    return sources;
  }

  private async globPattern(pattern: string) {
    return glob(pattern, {
      cwd: this.context.inputRoot.absolute,
      absolute: false,
      filesOnly: true
    });
  }

  private async readFileSource(inputPath: InputPath): Promise<SvgSource> {
    return {
      ...inputPath,
      name: basename(inputPath.relativeToInputRoot, '.svg'),
      content: await readFile(inputPath.absolute, 'utf-8')
    };
  }
}
