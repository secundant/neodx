<h1 align="center">
  <a aria-label="Product template" href="https://github.com/belgattitude/nextjs-monorepo-example">
    🏗 Product template
  </a>
</h1>
<p align="center">
  <strong>Detailed fully featured template for long-term projects</strong>
</p>

> Project is in early development phase and contains some dirty moments

Our primary features:

- [Yarn 3](https://yarnpkg.com/getting-started/usage) - most flexible package manager
- Monorepo (This will be a separate section in the future)
  - Benefits
    - Code structuring and easy reuse - we're able to extract all common logic
      to shared libraries and use it without any painful actions (build/publish/install/update/etc.)
    - Consistency
    - Collaboration across team and tools
  - Drawbacks
    - Requires common smart tools (NX/Turbo/etc.)
    - Repository size - this is potential problem with scaling up (**TODO - research it**)
  - Built-in task management powered by [NX](https://nx.dev/)
- **not implemented** Group of ready-to-use examples of UI Kit libraries (self-made / radix)
- **not implemented** Multiple applications examples (NextJS / Vite / Razzel)
- [Documentation application](./apps/docs) with its rationale, explanation and self-documented recipes
