```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /** Multi-color icons will use this variable as an additional color */
    --icon-secondary-color: currentColor;
  }
}

@layer components {
  /*
  Our base class for icons inherits the current text color and applies common styles.
  We're using a specific component class to prevent potential style conflicts and utilize the [data-axis] attribute.
  */
  .icon,
  .icon-x,
  .icon-y {
    @apply select-none fill-current inline-block text-inherit box-content;
    /** We need to align icons to the baseline, -0.125em is the 1/8 of the icon height */
    vertical-align: -0.125em;
  }

  /* Set icon size to 1em based on its aspect ratio, so we can use `font-size` to scale it */
  .icon,
  .icon-x {
    /* scale horizontally */
    @apply w-[1em];
  }

  .icon,
  .icon-y {
    /* scale vertically */
    @apply h-[1em];
  }
}
```
