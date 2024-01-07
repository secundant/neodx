# @neodx/glob

Simple glob matching low-level APIs inspired by [zeptomatch](https://github.com/fabiospampinato/zeptomatch/).

Visit [https://neodx.pages.dev/glob/](https://neodx.pages.dev/glob/) to see more details!

<div align="center">
  <a href="https://www.npmjs.com/package/@neodx/log">
    <img src="https://img.shields.io/npm/v/@neodx/glob.svg" alt="npm" />
  </a>
  <img src="https://img.shields.io/npm/l/@neodx/glob.svg" alt="license"/>
</div>

> **Warning**
> This project is still in the development stage, under 0.x.x version breaking changes can be introduced in any release, but I'll try to make them loud.

## Installation

```bash
# yarn
yarn add @neodx/glob
# npm
npm install @neodx/glob
# pnpm
pnpm install @neodx/glob
```

## Getting started

```ts
import { ma } from '@neodx/glob';

export async function main() {
  const glob = new glob();
  // ...
}
```

## Benchmark

Benchmarks are powered by [Vitest](https://vitest.dev/guide/features.html#benchmarking-experimental), you can run it with `yarn bench` command.

Source code of the benchmark is located in [`src/__tests__/glob.bench.ts`](./src/__tests__/glob.bench.ts)

Results on my machine:

```bash
 ✓ src/__tests__/glob.bench.ts (8) 6415ms
   ✓ match("**/*.ts", "libs/some/path/to/file.ts") (4) 5882ms
     name                          hz     min      max    mean     p75     p99    p995    p999     rme  samples
   · @neodx/glob         1,141,205.65  0.0006   3.5866  0.0009  0.0008  0.0027  0.0034  0.0213  ±2.08%   570603   fastest
   · picomatch             706,530.46  0.0011   3.7150  0.0014  0.0014  0.0029  0.0042  0.0255  ±1.85%   353266
   · zeptomatch            875,495.74  0.0009   5.2446  0.0011  0.0011  0.0020  0.0028  0.0235  ±2.34%   437748
   · micromatch.isMatch    668,186.93  0.0011  12.1941  0.0015  0.0013  0.0039  0.0053  0.0254  ±5.73%   334094   slowest
   ✓ match("base/{a,b}/**/*.{config,test}.[jt]s", "base/a/my-config.js") (4) 6412ms
     name                          hz     min      max    mean     p75     p99    p995    p999      rme  samples
   · @neodx/glob         1,342,514.61  0.0006   1.1806  0.0007  0.0007  0.0015  0.0021  0.0210   ±1.00%   671258   fastest
   · picomatch              77,828.40  0.0054  15.9870  0.0128  0.0095  0.0321  0.0440  0.3226  ±12.88%    38999   slowest
   · zeptomatch            778,006.62  0.0010  15.1421  0.0013  0.0012  0.0022  0.0029  0.0233   ±6.29%   389004
   · micromatch.isMatch     82,422.61  0.0062   9.6787  0.0121  0.0093  0.0326  0.0490  0.3296  ±10.51%    41212


 BENCH  Summary

  @neodx/glob - src/__tests__/glob.bench.ts > match("**/*.ts", "libs/some/path/to/file.ts")
    1.30x faster than zeptomatch
    1.62x faster than picomatch
    1.71x faster than micromatch.isMatch

  @neodx/glob - src/__tests__/glob.bench.ts > match("base/{a,b}/**/*.{config,test}.[jt]s", "base/a/my-config.js")
    1.73x faster than zeptomatch
    16.29x faster than micromatch.isMatch
    17.25x faster than picomatch
```

## Motivation

`@neodx/glob` was created to provide a simple, fast and highly featured glob matching toolchain for [Neodx](https://neodx.pages.dev) ecosystem.

## Inspiration

This project got inspiration about API design and some features from the following projects:

- Thanks [zeptomatch](https://github.com/fabiospampinato/zeptomatch/) for grammex and primary implementation reference

## License

[MIT](https://github.com/secundant/neodx/blob/main/LICENSE)
