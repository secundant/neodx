import ora from 'ora';
import { parse } from 'svgson';
import type { Context, SvgOutputEntry, SvgSource } from '@/types';

export class Compiler {
  private sources = new Set<SvgSource>();
  private compiled = new Set<SvgOutputEntry>();
  private progress = ora();

  constructor(readonly context: Context) {}

  add(source: SvgSource) {
    this.sources.add(source);
    return this;
  }

  async compile() {
    this.progress.start('Compiling');
    for (const info of this.sources) {
      await this.compileSource(info);
      this.progress.text = `[${this.compiled.size}/${this.sources.size}] compiled...`;
    }
    this.progress.succeed(`Successfully compiled ${this.compiled.size} files`);

    return Array.from(this.compiled);
  }

  private async compileSource(info: SvgSource) {
    try {
      this.compiled.add({
        info,
        node: await parse(info.content, {
          camelcase: true,
          transformNode: node =>
            this.context.hooks.transformNode({
              node,
              info
            })
        })
      });
    } catch (error) {
      this.progress.fail(`Compilation failed`);
      throw error;
    }
  }
}
