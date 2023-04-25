# @neodx/log

Lightweight logging framework.

> **In early development stage.**

## TODO

- [ ] printf implementation
  - [ ] should be replaceable
  - [ ] should support be default: int, float, string, object (json-like)
- [ ] custom log levels
  - [ ] default levels can be extended or replaced
  - [ ] TS support
- [ ] architecture
  - [ ] how to implement streams? Web streams? Promise-like? Custom?
  - [ ] solution shouldn't use node.js APIs (streams, fs, os, etc.) by default, only with presets/plugins/???
  - [ ] solution should implement flow "called -> parser -> filter -> modifiers -> consumers"
    - [ ] think about chain structure and responsibility
    - `parser` - convert arguments to message chunk (fields, metadata, formatted message, arguments, level, etc.)
    - `filter` - ????
    - `modifiers` - any kind of chunk transformations (fields change is most wanted)
    - `consumers` - set of streams that will implement any chunks transportation logic (console, requests, stdout, etc.).
      **blocker** - how exactly should we implement this streams?
- [ ] TODO
