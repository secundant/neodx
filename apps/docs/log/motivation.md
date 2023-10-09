# Motivation

Logging is one of the key aspects of software development, and you've probably heard advice like "Just log everything."
It's a solid recommendation, and chances are, you agree with it too.
However, in web development, logging can sometimes become challenging to manage and maintain, leading to a frustrating development experience (DX).

Often, we find ourselves avoiding logs until it becomes inevitable, removing them, or wrapping them in numerous conditions.
In today's development landscape, logs can be perceived as a hindrance to DX.
Nevertheless, embracing comprehensive logging is essential for effective software development and is required for building stable products.

## So, what's the problem? Why do we avoid logging?

During software development, developers frequently face the same issue: "How can I turn off, replace, or modify my logs?"
The inability to easily control logging behavior often leads us to one of two choices—either drop the logs (we even have ESLint rules for this purpose) altogether or introduce an abstraction layer.

Dropping logs means avoiding any use of `console.log` and similar APIs, simply because we **cannot control them**.

On the other hand, abstractions come with their own set of trade-offs and there is no widely-accepted, easy-to-use solution available.

## What's the solution?

In my opinion, - we just don't have a good enough abstraction layer for logging:

- Small size
- Isomorphic
- Configurable
- Multiple transports support
- Multiple log levels support
- Built-in [pretty-printing](./targets/pretty.md), [JSON logging](./targets/json.md)
- etc.

Okay, maybe we have some good enough solutions, but they are not perfect:

- [pino](https://www.npmjs.com/package/pino) - **really fast**, but 3kb (browser) size, huge API, no built-in pretty-printing
- [signale](https://www.npmjs.com/package/signale) - Not maintained, only Node.JS, only pretty-printing, no JSON logging
- [loglevel](https://www.npmjs.com/package/loglevel) - Not maintained, just a console wrapper
- Other solutions are not worth mentioning, they are too far from the "just take it and use it" state

And after all, I decided to create my own solution.
