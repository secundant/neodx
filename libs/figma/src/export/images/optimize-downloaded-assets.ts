import { createSvgoConfig, type CreateSvgoConfigParams } from '@neodx/internal/svgo';
import { optimize } from 'svgo';
import type { DownloadedAsset } from './download-exported-assets';

export type OptimizeDownloadedAssetsParams = CreateSvgoConfigParams;

export function optimizeDownloadedAssets(
  { format, content }: DownloadedAsset<unknown>,
  params?: CreateSvgoConfigParams
) {
  if (format !== 'svg') return content;
  return optimize(content, createSvgoConfig(params)).data;
}
