# Aligning text with icons

::: danger
WIP; TODO UPDATE BEFORE RELEASE
:::

::: tip
We made a good illustration of text alignment in our [Vite + React Example](https://github.com/secundant/neodx/tree/main/examples/svg-vite).
Check it out!
:::

All our examples and integration recipes already use the text alignment fix. Here, we will investigate the problem.

![text-alignment-illustration](/svg/text-alignment/sandbox.png)

## Problem

SVG-sprite-based icons are pretty convenient for using right in the text:

- Color will be inherited by `currentColor` CSS property with support of our [color reset](../colors-reset.md) feature
- Size will be inherited by `font-size` CSS property, we just need to set `width` and `height` to `1em` (for details, see our various [integration](../integration/index.md) guides)

But there is a problem with text layout shift when our icon goes under text baseline:

![text-alignment-illustration](/svg/text-alignment/issue.png)

Browsers attempt to align our icon with the text baseline, but this often disrupts the layout.
To handle this issue, we need to compensate for the shifting:

![text-alignment-illustration](/svg/text-alignment/layout-fix.png)

## Solution

In the most typefaces you will face the 1/8 rule (font layout makes 1/8 offsets from top and bottom):

![text-alignment-illustration](/svg/text-alignment/typeface-layout.png)

So, our fix is to align our icon with the baseline, but with a little offset:

```css
.icon {
  /* ... */
  vertical-align: -0.125em;
}
```

But be careful, this will not work for all typefaces, so you need to check the layout of your font:

![text-alignment-illustration](/svg/text-alignment/typefaces-variants.png)

## References

- Elliot Dahl: [Align SVG Icons to Text and Say Goodbye to Font Icons](https://blog.prototypr.io/align-svg-icons-to-text-and-say-goodbye-to-font-icons-d44b3d7b26b4) (some material was taken from this article)
