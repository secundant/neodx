import { parseAs } from '@neodx/internal/zod';
import { toArray } from '@neodx/std';
import { cosmiconfig } from 'cosmiconfig';
import { z } from 'zod';
import type { ExportFileAssetsParams } from './export';
import type { ExportPublishedComponentsParams } from './export/export-published-components.ts';
import { isFigmaLink, parseFileIdFromLink } from './utils';

/**
 * Deep validation of `collect`/`target`/`filter`/`resolve`/`download`/`write`
 * predicate shapes is deferred — they are accepted as opaque values here and
 * validated later by their consumers. See the deferred TODO below.
 */
const deferredExportFields = {
  collect: z.unknown().optional(),
  target: z.unknown().optional(),
  filter: z.unknown().optional(),
  resolve: z.unknown().optional(),
  download: z.unknown().optional(),
  write: z.unknown().optional()
} as const;

const exportFileAssetsSchema = z
  .object({
    type: z.literal('file-assets'),
    fileId: z.string().min(1),
    output: z.string().min(1),
    ...deferredExportFields
  })
  .passthrough();

const exportPublishedComponentsSchema = z
  .object({
    type: z.literal('published-components'),
    fileId: z.string().min(1),
    output: z.string().min(1),
    ...deferredExportFields
  })
  .passthrough();

const exportItemSchema = z.discriminatedUnion('type', [
  exportFileAssetsSchema,
  exportPublishedComponentsSchema
]);

const normalizedConfigurationSchema = z.object({
  token: z.string().min(1),
  export: z.array(exportItemSchema)
});

export async function resolveNormalizedConfiguration(
  cwd: string,
  cliConfig: CliConfiguration
): Promise<NormalizedConfiguration> {
  const userConfig = await findConfiguration(cwd);

  // Token resolution precedence is part of the contract: CLI flag wins over the
  // config file, which wins over the FIGMA_TOKEN environment variable.
  const token = cliConfig.token ?? userConfig.token ?? process.env.FIGMA_TOKEN;

  const exportConfig = toArray(userConfig.export ?? []).map(item => {
    const fileId = cliConfig.fileId ?? item.fileId;

    return {
      type: 'file-assets',
      ...item,
      output: cliConfig.output ?? item.output,
      // Normalize Figma file URLs to their bare IDs before validation. An absent
      // `fileId` is left for Zod to reject below.
      fileId: fileId && isFigmaLink(fileId) ? parseFileIdFromLink(fileId) : fileId
    };
  });

  // The schema validates structure (token/output/fileId are non-empty, export
  // is a typed discriminated union). The deferred deep fields pass through as
  // `unknown` (see TODO above), so the inferred type is wider than
  // `NormalizedConfiguration` — the cast is structural and honest.
  return parseAs('Figma configuration', normalizedConfigurationSchema, {
    token,
    export: exportConfig
  }) as NormalizedConfiguration;
}

// TODO(1.x): Validate deep `collect`/`target`/`filter` predicate shapes.
//   The top-level config + export item + token/output/fileId validation moved
//   to Zod above; the nested collect/target/filter/resolver/download/write
//   fields still pass through as opaque values. Fold them into typed Zod
//   schemas in a follow-up (collect-nodes `CollectNodesParams`, etc.).

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
  extends
    Omit<ExportFileConfiguration, 'fileId' | 'output'>,
    Required<Pick<ExportFileConfiguration, 'fileId' | 'output'>> {
  type: 'file-assets';
}

export interface NormalizedExportPublishedComponentsConfigurationItem
  extends
    Omit<ExportPublishedComponentsConfiguration, 'fileId' | 'output'>,
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

export interface ExportPublishedComponentsConfiguration extends Omit<
  ExportPublishedComponentsParams,
  'file'
> {
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
