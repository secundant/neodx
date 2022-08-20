# @neodx/config

Contains all shared configuration

```shell
yarn add -D @neodx/config@"workspace:*"
```

## Typescript

> TODO Describe some included rules

```json
{
  "extends": "@neodx/config/tsconfig.json",
  "compilerOptions": {
    "baseUrl": "src"
  },
  "includes": ["src"]
}
```

## Jest

```shell
yarn add -D jest @types/jest
```

```javascript
// jest.config.cjs
module.exports = {
  preset: '@neodx/config/jest'
};
```

```json5
// package.json
{
  scripts: {
    // TODO Add explanation for vm modules
    test: "NODE_OPTIONS='--experimental-vm-modules' jest"
  }
}
```

### Included features

- TypeScript support via `@swc/jest` transformation
- TypeScript paths support
- Enhanced modules resolving
  - "exports" field support
  - `.css/.scss/.sass/.less/.styl` proxying
  - typescript modules resolving (provides paths support)
