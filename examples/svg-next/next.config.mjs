// eslint-disable-next-line import/no-unresolved
import svg from '@neodx/svg/webpack';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.plugins.push(
        svg({
          root: 'assets',
          output: 'public',
          definitions: 'src/shared/ui/icon/sprite.gen.ts',
          resetColors: {
            replaceUnknown: 'currentColor'
          }
        })
      );
    }
    return config;
  }
};

export default nextConfig;
