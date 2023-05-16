import { invariant, toArray } from '@neodx/std';
import { cosmiconfig } from 'cosmiconfig';
import type { ExportFileParams } from './export';
import { isFigmaLink, parseFileIdFromLink } from './utils';

export async function resolveNormalizedConfiguration(
  cwd: string,
  cliConfig: CliConfiguration
): Promise<NormalizedConfiguration> {
  const userConfig = await findConfiguration(cwd);
  const token = cliConfig.token ?? userConfig.token ?? process.env.FIGMA_TOKEN;

  invariant(token, 'Personal access token is required');

  const exportConfig = toArray(userConfig.export ?? []).map(item => {
    const fileId = cliConfig.fileId ?? item.fileId!;

    return {
      ...item,
      output: cliConfig.output ?? item.output,
      fileId: isFigmaLink(fileId) ? parseFileIdFromLink(fileId) : fileId
    };
  });

  invariant(
    exportConfig.every(item => item.output),
    'Output path is required, use --output or "export.output" in config file'
  );
  invariant(
    exportConfig.every(item => item.fileId),
    'File ID is required, use "figma export <fileId>" or "export.fileId" in config file'
  );

  return {
    token,
    export: exportConfig as NormalizedExportConfigurationItem[]
  };
}

export async function findConfiguration(cwd: string): Promise<Configuration> {
  const result = await cosmiconfig('figma').search(cwd);

  return result?.config ?? {};
}

export interface NormalizedConfiguration {
  token: string;
  export: NormalizedExportConfigurationItem[];
}

export interface NormalizedExportConfigurationItem
  extends Omit<ExportConfigurationItem, 'fileId' | 'output'>,
    Required<Pick<ExportConfigurationItem, 'fileId' | 'output'>> {}

export interface CliConfiguration {
  token?: string;
  output?: string;
  fileId?: string;
}

export interface Configuration {
  /**
   * Personal access token for Figma API
   * @default process.env.FIGMA_TOKEN
   */
  token?: string;
  /**
   * Export configuration
   */
  export?: ExportConfigurationItem | ExportConfigurationItem[];
}

export interface ExportConfigurationItem
  extends Pick<
    ExportFileParams,
    | 'receiveExportsResolver'
    | 'receiveExportsBatching'
    | 'receiveExportsConcurrency'
    | 'getExportFileName'
    | 'downloadConcurrency'
    | 'collect'
  > {
  /**
   * URL or ID of the file to export from
   */
  fileId?: string;
  /**
   * Path to the output directory of exported files (relative to the current working directory)
   */
  output?: string;
}
