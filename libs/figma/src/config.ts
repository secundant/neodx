import { invariant, toArray } from '@neodx/std';
import { cosmiconfig } from 'cosmiconfig';
import type { ExportFileAssetsParams } from './export';
import type { ExportPublishedComponentsParams } from './export/export-published-components.ts';
import { isFigmaLink, parseFileIdFromLink } from './utils';

// TODO Migrate to Zod
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
      type: 'file-assets',
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
    export: exportConfig as NormalizedExportFileConfigurationItem[]
  };
}

export async function findConfiguration(cwd: string): Promise<Configuration> {
  const result = await cosmiconfig('figma').search(cwd);

  return result?.config ?? {};
}

export interface NormalizedConfiguration {
  token: string;
  export: NormalizedExportConfigItem[];
}

export type NormalizedExportConfigItem =
  | NormalizedExportFileConfigurationItem
  | NormalizedExportPublishedComponentsConfigurationItem;

export interface NormalizedExportFileConfigurationItem
  extends Omit<ExportFileConfiguration, 'fileId' | 'output'>,
    Required<Pick<ExportFileConfiguration, 'fileId' | 'output'>> {
  type: 'file-assets';
}

export interface NormalizedExportPublishedComponentsConfigurationItem
  extends Omit<ExportPublishedComponentsConfiguration, 'fileId' | 'output'>,
    Required<Pick<ExportPublishedComponentsConfiguration, 'fileId' | 'output'>> {
  type: 'published-components';
}

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
  export?: AnyExportConfigItem | AnyExportConfigItem[];
}

export type AnyExportConfigItem = ExportFileConfiguration | ExportPublishedComponentsConfiguration;

export interface ExportFileConfiguration extends Omit<ExportFileAssetsParams, 'file'> {
  /**
   * Default export type
   */
  type?: 'file-assets';
  /**
   * URL or ID of the file to export from
   */
  fileId?: string;
  /**
   * Path to the output directory of exported files (relative to the current working directory)
   */
  output?: string;
}

export interface ExportPublishedComponentsConfiguration
  extends Omit<ExportPublishedComponentsParams, 'file'> {
  type: 'published-components';
  /**
   * URL or ID of the file to export from
   */
  fileId?: string;
  /**
   * Path to the output directory of exported files (relative to the current working directory)
   */
  output?: string;
}
