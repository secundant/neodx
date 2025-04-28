---
outline: [2, 3]
---

# Automatically reset colors

The `resetColors` feature in @neodx/svg gives you full control over SVG icon colors, enabling dynamic color theming, accessibility, and design consistency. It is enabled by default and can be customized for any use case.

- [API Reference](./api/features/reset-colors.md)

## Why reset colors?

- Control icon colors from CSS using `currentColor` or CSS variables
- Unify icon appearance from different sources
- Enable dark mode, theming, and accessibility
- Avoid manual editing of SVG files

## Quick Start

By default, all colors are reset to `currentColor`:

```typescript
svg({
  resetColors: true // or omit for default
});
```

## Disable color reset

If you want to keep original colors:

```typescript
svg({
  resetColors: false
});
```

## Advanced configuration

You can filter which icons and colors to reset, keep, or replace:

```typescript
svg({
  resetColors: {
    // Exclude or include specific files
    exclude: ['path/to/icon.svg', /[a-z]*-colored\.svg$/],
    include: ['path/to/other-icon.svg'],
    // Keep specific colors untouched
    keep: ['white', '#eee'],
    // Replace all other colors with currentColor
    replaceUnknown: 'currentColor'
  }
});
```

### Replace specific colors

```typescript
svg({
  resetColors: {
    // Replace specific colors with currentColor
    replace: ['white', '#eee'],
    // Replace legacy brand colors with a new color
    replace: {
      from: [legacyBrandColor, legacyBrandColor2],
      to: brandColor
    },
    // Multiple replacement rules
    replace: [
      { from: [legacyBrandColor, legacyBrandColor2], to: brandColor },
      { from: ['white', '#eee'], to: 'currentColor' }
    ]
  }
});
```

### All-in-one example

- Replace white in all flags with `currentColor`
- For all icons except flags, logos, and colored icons:
  - Keep brand colors untouched
  - Replace accent colors with `var(--icon-accent-color)`
  - Replace secondary colors with `var(--icon-secondary-color)`
  - Replace all other colors with `currentColor`

```typescript
svg({
  resetColors: [
    {
      include: /^flags/,
      replace: { from: 'white', to: 'currentColor' }
    },
    {
      keep: myTheme.brandColors,
      exclude: [/^flags/, /^logos/, /-colored\.svg$/],
      replace: [
        { from: myTheme.accentIconColors, to: 'var(--icon-accent-color)' },
        { from: myTheme.secondaryIconColors, to: 'var(--icon-secondary-color)' }
      ],
      properties: ['fill', 'stroke'],
      replaceUnknown: 'currentColor'
    }
  ]
});
```

## Best Practices

- Use `currentColor` for primary icon color to inherit from parent
- Use CSS variables for secondary/tertiary colors ([see multicolored guide](./multicolored.md))
- Prefer configuration over manual SVG editing
- Test your icons in different themes and color schemes
- See [Color Reset API Reference](./api/features/reset-colors.md) for advanced options

## Related

- [Working with multicolored icons](./multicolored.md)
- [Writing Icon Component](./writing-icon-component.md)
- [Color Reset API Reference](./api/features/reset-colors.md)
