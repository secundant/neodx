import { createSvgoConfig, type CreateSvgoConfigParams } from '@neodx/internal/svgo';
import { optimize } from 'svgo';
import { createPlugin } from './plugin-utils';

export type SvgoPluginParams = CreateSvgoConfigParams;

export function svgo(params?: SvgoPluginParams) {
  const options = svgo.createConfig(params);
  const applySvgo = (content: string) => optimize(content, options).data;

  return createPlugin('svgo', {
    transformSourceContent: (_, content) => applySvgo(content),
    transformOutputEntryContent: applySvgo
  });
}

svgo.createConfig = createSvgoConfig;
