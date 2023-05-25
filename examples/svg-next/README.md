# Simple integration of `@neodx/svg` with Next.js (pages router) and TailwindCSS

> **Note**
> You can find additional information about `Icon` component in [examples/svg-vite](../svg-vite/README.md)

## Getting Started

### Install `@neodx/svg`

```bash
# npm
npm i -D @neodx/svg
# yarn
yarn add -D @neodx/svg
# pnpm
pnpm i -D @neodx/svg
```

### Start development server

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Configuration

```javascript
// next.config.mjs
import svg from '@neodx/svg/webpack';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // We don't want to run generator twice
    if (!isServer) {
      config.plugins.push(
        svg({
          root: 'assets',
          output: 'public',
          definitions: 'src/shared/ui/icon/sprite.gen.ts',
          resetColors: {
            // All colors will be replaced with `currentColor`
            replaceUnknown: 'currentColor'
          }
        })
      );
    }
    return config;
  }
};

export default nextConfig;
```

## Usage

> See [examples/svg-vite](../svg-vite/README.md) for details about `Icon` component

```tsx
import { Icon } from '@/shared/ui/icon';

export function SomeComponent() {
  return (
    <h1 className="inline-flex items-center gap-2">
      Text with icon <Icon name="common/favourite" />
    </h1>
  );
}
```
