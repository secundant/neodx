# CDN Compatibility

::: danger
WIP; TODO UPDATE BEFORE RELEASE
:::

If you host the sprite file on a separate domain, such as a CDN, you may encounter issues due to CORS restrictions.

Unfortunately, there is no native solution, as the [specifications](https://github.com/w3c/svgwg/issues/707#issuecomment-895914972) and [browser implementations](https://issues.chromium.org/issues/41164645#comment15) do not align on this matter.

To solve this issue, we designed an experimental [inlining external files mechanism](../inlining.md#inline-fetched-sprites).
It's working by fetching the sprite content from your server as a regular text file and injecting it into the document.

::: warning
This feature is experimental and may be changed in the future.
:::

To understand the full context, please read the [Inlining](../inlining.md) guide, but in short, just configure `inline` option:

```ts
// vite.config.ts
export default defineConfig({
  // ...
  plugins: [
    svg({
      // ...
      inline: {
        extract: true // all inlined assets will be extracted into separate files and fetched in the runtime
      }
    })
  ]
});
```
