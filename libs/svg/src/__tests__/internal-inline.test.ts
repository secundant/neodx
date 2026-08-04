import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const repoRoot = fileURLToPath(new URL('../../../../', import.meta.url));

const consumers = [
  { name: '@neodx/svg', dir: 'libs/svg' },
  { name: '@neodx/vfs', dir: 'libs/vfs' },
  { name: '@neodx/figma', dir: 'libs/figma' }
] as const;

const listRuntimeFiles = (dir: string): string[] => {
  if (!existsSync(dir)) return [];

  const entries = readdirSync(dir);
  const files: string[] = [];

  for (const entry of entries) {
    const path = join(dir, entry);
    const stat = statSync(path);

    if (stat.isDirectory()) {
      files.push(...listRuntimeFiles(path));
      continue;
    }

    if (/\.(cjs|mjs|js)$/.test(entry)) {
      files.push(path);
    }
  }

  return files;
};

describe('@neodx/internal inline contract', () => {
  for (const consumer of consumers) {
    it(`${consumer.name} declares @neodx/internal as a private build-time dep only`, () => {
      const pkg = JSON.parse(
        readFileSync(join(repoRoot, consumer.dir, 'package.json'), 'utf8')
      ) as {
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
      };

      expect(pkg.dependencies?.['@neodx/internal']).toBeUndefined();
      expect(pkg.devDependencies?.['@neodx/internal']).toBeTruthy();
    });

    it(`${consumer.name} dist does not runtime-import @neodx/internal`, ({ skip }) => {
      const distDir = join(repoRoot, consumer.dir, 'dist');

      if (!existsSync(distDir)) {
        skip();
        return;
      }

      const hits = listRuntimeFiles(distDir).filter(file =>
        readFileSync(file, 'utf8').includes('@neodx/internal')
      );

      expect(hits).toEqual([]);
    });
  }

  it('@neodx/internal stays private and has no broken root export', () => {
    const pkg = JSON.parse(readFileSync(join(repoRoot, 'libs/internal/package.json'), 'utf8')) as {
      private?: boolean;
      exports?: Record<string, unknown>;
    };

    expect(pkg.private).toBe(true);
    expect(pkg.exports?.['.']).toBeUndefined();
    expect(pkg.exports?.['./*']).toBeTruthy();
  });
});
