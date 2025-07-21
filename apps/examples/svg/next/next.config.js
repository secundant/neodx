const svg = require('@neodx/svg/webpack');

/** @type {import('next').NextConfig} */
module.exports = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.plugins.push(
        svg({
          output: 'public/sprites',
          fileName: '{name}.{hash:8}.svg',
          metadata: 'src/shared/ui/icon/sprite.gen.ts',
          inputRoot: 'src/shared/ui/icon/assets',
          resetColors: {
            // 1. Prevent resetting colors for flags and logos
            exclude: [/^other/],
            // 2. Replace all known colors with currentColor
            replace: ['#000', '#eee', '#6C707E', '#313547'],
            // 3. Replace unknown colors with a custom CSS variable
            replaceUnknown: 'var(--icon-secondary-color)'
          }
        })
      );
    }
    return config;
  }
};
