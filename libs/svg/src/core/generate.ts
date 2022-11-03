import { Compiler } from '@/core/compiler';
import { resolveContext } from '@/core/context';
import { Generator } from '@/core/generator';
import { Scanner } from '@/core/scanner';

export async function generate(cwd: string) {
  const context = await resolveContext(cwd);
  const scanner = new Scanner(context);
  const compiler = new Compiler(context);
  const generator = new Generator(context);

  const sources = await scanner.scan();

  sources.forEach(file => compiler.add(file));
  const compiled = await compiler.compile();

  generator.add('sprite', compiled);
  await generator.generate();
}
