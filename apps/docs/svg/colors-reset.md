---
outline: [2, 3]
---

# Automatically reset colors

A powerful feature to automatically reset colors in SVG icons.

```typescript
svg({
  resetColors: {
    // default, replace all colors with currentColor
    replaceUnknown: 'currentColor'
  }
});
```

- [API Reference](./api/plugins/reset-colors.md)

## Motivation

When we're working with SVG icons, we always need to control icon colors from our CSS.
Well-known approach is to use `currentColor` inside SVG and set `color` property in CSS.

However, usually, we have different issues with this approach, for example:

- Icons are automatically generated, and we can't control their content
- Icons are not generated, but we don't want to manually edit them (for example, we're using some external library)
- We have a lot of icons, and we don't want to manually edit them
- We have different SVG assets: flags, logos, etc. and we want to control their colors separately

## Features

To solve these issues, we're introducing a `resetColors` option:

- Automatically detects all colors in all forms (thx [colord](https://github.com/omgovich/colord)) from SVG content
- Enabled by default to reset all colors (you can disable it with `resetColors: false`)
- Multiple configurations for different colors strategies
- Granular control with colors and files filters

## Usage

### Disable colors reset

```typescript
svg({
  // disable colors reset
  resetColors: false
});
```

### Filter colors and icons

```typescript
svg({
  resetColors: {
    // global files filter (default - all files)
    exclude: ['path/to/icon.svg', /[a-z]*-colored\.svg$/],
    include: ['path/to/other-icon.svg' /* ... */],
    // keep specific colors untouched
    keep: ['white', '#eee'],
    // all colors except white and #eee will be replaced with currentColor
    replaceUnknown: 'currentColor'
  }
});
```

### Replace specific colors

> Without `replaceUnknown` option, all unspecified colors will be kept as is.

```typescript
svg({
  resetColors: {
    // if you want to replace specific colors only with currentColor, you can simply pass it as a string or array
    replace: ['white', '#eee'],
    // when you need to replace colors with a concrete color, you can pass an object with `from` and `to` properties
    replace: {
      from: [legacyBrandColor, legacyBrandColor2],
      to: brandColor
    },
    // you can also pass an array of objects
    replace: [
      {
        from: [legacyBrandColor, legacyBrandColor2],
        to: brandColor
      },
      {
        from: ['white', '#eee'],
        to: 'currentColor'
      }
    ]
  }
});
```

### All in one

- Replace white color in all flags with `currentColor`
- For all icons except flags, logos and colored icons:
  - Keep brand colors untouched
  - Replace known accent colors with `var(--icon-color)`
  - Replace known secondary colors with `var(--icon-bg)`
  - Replace all other colors with `currentColor`

```typescript
svg({
  resetColors: [
    {
      include: /^flags/,
      replace: {
        from: 'white',
        to: 'currentColor'
      }
    },
    {
      keep: myTheme.brandColors,
      exclude: [/^flags/, /^logos/, /-colored\.svg$/],
      replace: [
        {
          from: myTheme.accentIconColors,
          to: 'var(--icon-color)'
        },
        {
          from: myTheme.secondaryIconColors,
          to: 'var(--icon-bg)'
        }
      ],
      // if you want to replace colors in specific properties only, you can pass an array of them
      properties: ['fill', 'stroke'],
      replaceUnknown: 'currentColor'
    }
  ]
});
```
