# Motivation

I've been looking for a stable maintaining Figma API with built-in high-level structures, abstractions, and common features for implementing high-level tools for Figma.
But I didn't find anything that would suit me, [figma-js](https://github.com/jemgold/figma-js) and [figma-api](https://github.com/didoo/figma-api) both are not maintained, low-level API only and depends on the axios library, which is not suitable for me.

Next, I found [figma-transformer](https://github.com/figma-tools/figma-transformer), nice project for creating a human-friendly data structure, but it's not a full-featured, not maintained, and written in **very** unsafe and untyped style.

So I decided to create my own Figma API, which will be:

- **Powerful CLI** solves the most common tasks
- **Fully typed** consistent Figma API and common helpers
- **Convenient high-level** Node.js API for working with Figma projects
- **Web API based** and not depend on specific third-party libraries
- **Safe** and **stable** as possible without strict value validation (via `zod`, `runtypes` or something like that)
- etc.

In other words, the holistic high-level well-featured instrument.
