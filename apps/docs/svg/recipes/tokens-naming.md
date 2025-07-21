# Recommended Token Naming

We use the `sprite:symbol` format for all icon names in @neodx/svg. This format is used throughout the documentation and in all code examples.

- `sprite` — the name of the sprite (usually matches a directory or group)
- `symbol` — the name of the icon within that sprite

```tsx
<Icon name="sprite-name:symbol-name" />
```

This approach supports any possible sprite or symbol name, including nested grouping, e.g.:

- `common:close`
- `actions:edit`
- `common/actions/24:close` (`<global group>/<...subgroup>/<size>:<symbol>`)

> **Note:** Always use a colon (`:`) as the separator between sprite and symbol names.
