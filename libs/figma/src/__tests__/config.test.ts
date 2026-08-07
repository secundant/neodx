import { beforeEach, describe, expect, test, vi } from 'vite-plus/test';
import { resolveNormalizedConfiguration } from '../config';

// `cosmiconfig` is mocked so the user-provided config is deterministic and the
// test stays focused on `resolveNormalizedConfiguration`'s validation behavior.
const searchMock = vi.fn();
vi.mock('cosmiconfig', () => ({
  cosmiconfig: () => ({
    search: (...args: unknown[]) => searchMock(...args)
  })
}));

const TOKEN_ENV = 'env-token';

beforeEach(() => {
  searchMock.mockReset();
  process.env.FIGMA_TOKEN = TOKEN_ENV;
});

describe('resolveNormalizedConfiguration', () => {
  test('accepts a valid file-assets config and preserves the collect predicate', async () => {
    const collect = { target: [{ type: 'CANVAS', filter: 'Icons' }] };

    searchMock.mockResolvedValue({
      config: {
        token: 'config-token',
        export: { fileId: 'FILE_ID', output: 'src/assets', collect }
      }
    });

    const config = await resolveNormalizedConfiguration('/cwd', {});

    expect(config).toEqual({
      token: 'config-token',
      export: [{ type: 'file-assets', fileId: 'FILE_ID', output: 'src/assets', collect }]
    });
  });

  test('accepts a valid published-components config', async () => {
    searchMock.mockResolvedValue({
      config: {
        export: { type: 'published-components', fileId: 'FILE_ID', output: 'src/assets' }
      }
    });

    const config = await resolveNormalizedConfiguration('/cwd', {});

    expect(config).toEqual({
      token: TOKEN_ENV,
      export: [{ type: 'published-components', fileId: 'FILE_ID', output: 'src/assets' }]
    });
  });

  test('resolves the token with CLI > config file > FIGMA_TOKEN precedence', async () => {
    searchMock.mockResolvedValue({ config: { token: 'config-token' } });

    const fromEnv = await resolveNormalizedConfiguration('/cwd', {});
    expect(fromEnv.token).toBe('config-token');

    const fromCli = await resolveNormalizedConfiguration('/cwd', { token: 'cli-token' });
    expect(fromCli.token).toBe('cli-token');
  });

  test('normalizes a Figma file URL to its bare file ID', async () => {
    searchMock.mockResolvedValue({
      config: {
        export: {
          fileId: 'https://www.figma.com/file/ABC123/My-File',
          output: 'src/assets'
        }
      }
    });

    const config = await resolveNormalizedConfiguration('/cwd', {});

    expect(config.export[0].fileId).toBe('ABC123');
  });

  test('lets the CLI --fileId and --output override the config file', async () => {
    searchMock.mockResolvedValue({
      config: {
        export: { fileId: 'CONFIG_FILE', output: 'config-out' }
      }
    });

    const config = await resolveNormalizedConfiguration('/cwd', {
      fileId: 'CLI_FILE',
      output: 'cli-out'
    });

    expect(config.export[0]).toMatchObject({ fileId: 'CLI_FILE', output: 'cli-out' });
  });

  test('throws a Zod error when the token is missing', async () => {
    delete process.env.FIGMA_TOKEN;
    searchMock.mockResolvedValue({
      config: { export: { fileId: 'FILE_ID', output: 'src/assets' } }
    });

    await expect(resolveNormalizedConfiguration('/cwd', {})).rejects.toThrow(/Figma configuration/);
  });

  test('throws a Zod error when an export item is missing the required output', async () => {
    searchMock.mockResolvedValue({
      config: { export: { fileId: 'FILE_ID' } }
    });

    await expect(resolveNormalizedConfiguration('/cwd', {})).rejects.toThrow(/Figma configuration/);
  });

  test('throws a Zod error for an unknown export type', async () => {
    searchMock.mockResolvedValue({
      config: {
        export: { type: 'unknown', fileId: 'FILE_ID', output: 'src/assets' }
      }
    });

    await expect(resolveNormalizedConfiguration('/cwd', {})).rejects.toThrow(/Figma configuration/);
  });
});
