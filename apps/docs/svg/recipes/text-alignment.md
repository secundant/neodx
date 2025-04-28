# Aligning text with icons

Properly aligning SVG icons with text ensures a polished, professional UI. This guide explains the common baseline alignment issue and how to fix it for consistent, visually pleasing results.

::: tip
See a live illustration in our [Vite + React Example](https://github.com/secundant/neodx/tree/main/apps/examples/svg/vite-react).
:::

## Final Result

![Final result: text alignment with icons in different cases](/svg/text-alignment/sandbox.png)
_Above: Examples of correct icon alignment in various text scenarios_

## The Problem

SVG-sprite-based icons are convenient for inline use with text:

- Icon color inherits from `currentColor` (see [color reset](../colors-reset.md))
- Icon size inherits from `font-size` (see [integration guides](../integration/index.md))

However, SVG icons often shift the text baseline, causing misalignment:

![Problem: icon shifts text baseline](/svg/text-alignment/issue.png)
_Above: The icon is not visually centered with the text baseline, causing layout issues._

Browsers try to align the icon with the text baseline, but the result is often off, especially with different typefaces.

## Why does this happen?

SVG icons are rendered inline with text, but their default alignment box and the way browsers handle SVGs often don't match the font's baseline and metrics. This causes the icon to appear slightly above or below the intended line, leading to visual misalignment.

- SVGs are aligned to the text baseline by default, but their internal viewBox and lack of font metrics can cause them to "float" or "sink" relative to the text.
- The problem is more noticeable with icons of different aspect ratios or when mixing with various font sizes.

## Font layout differences

Most typefaces use the "1/8 rule": the font layout has 1/8 offsets from the top and bottom, but not all fonts are the same. This means the ideal alignment offset may vary by font.

![Typeface layout: 1/8 rule](/svg/text-alignment/typeface-layout.png)
_Above: Typical typeface layout with 1/8 offset from top and bottom._

![Different typefaces: offset variants](/svg/text-alignment/typefaces-variants.png)
_Above: Different typefaces may require different alignment tweaks._

## The Solution

To visually center your icon with text, apply a small negative vertical offset:

```css
.icon {
  /* ...other icon styles... */
  vertical-align: -0.125em;
}
```

- This aligns the icon visually with most text baselines.
- For some typefaces, you may need to tweak the value (e.g., `-0.1em` or `-0.15em`).

![Layout fix: icon visually centered](/svg/text-alignment/layout-fix.png)
_Above: The icon is now visually centered with the text baseline._

---

## Best Practices

- Always test your icons with your project's font(s)
- Use a utility class or extend your [icon component](../writing-icon-component.md) to include the alignment fix
- Combine with [autoscaling and color reset](../colors-reset.md) for best results
- See [integration guides](../integration/index.md) for framework-specific tips

## References

- Elliot Dahl: [Align SVG Icons to Text and Say Goodbye to Font Icons](https://blog.prototypr.io/align-svg-icons-to-text-and-say-goodbye-to-font-icons-d44b3d7b26b4)
- [Writing an Icon component](../writing-icon-component.md)
- [Color reset](../colors-reset.md)
