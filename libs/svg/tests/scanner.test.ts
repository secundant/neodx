import { readFile } from 'fs/promises';
import { createContext } from '@/core/context';
import { Scanner } from '@/core/scanner';
import type { Configuration } from '@/types';
import { resolveRoot } from './shared';

describe('scanner', () => {
  test('should scan 2 files', async () => {
    const scanner = createScanner('examples/simple');
    const files = await scanner.scan();

    expect(files.map(file => file.name)).toEqual(['ArrowDropDown', 'ArrowDropUp']);
  });

  test('should return actual files content', async () => {
    const scanner = createScanner('examples/simple');
    const files = await scanner.scan();

    expect(files.map(file => file.content)).toEqual([
      await readFile(resolveRoot('examples/simple/ArrowDropDown.svg'), 'utf-8'),
      await readFile(resolveRoot('examples/simple/ArrowDropUp.svg'), 'utf-8')
    ]);
  });

  test('should not find any files', async () => {
    expect(await createScanner('src').scan()).toEqual([]);
  });
});

const createScanner = (path: string, options?: Configuration) =>
  new Scanner(
    createContext(resolveRoot(path), {
      inputRoot: '.',
      ...options
    })
  );
