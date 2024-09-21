import clsx from 'clsx';
import { type ComponentProps, forwardRef, useMemo } from 'react';
import { type SpritePrepareConfig, sprites, type SpritesMeta } from './sprite.gen';

/** Icon props extending SVG props and requiring specific icon name */
export interface IconProps extends ComponentProps<'svg'> {
  /** Icon name, e.g. "common:close" */
  name: IconName;
  /**
   * Inverts main scaling axis.
   * By default, it will be scaled by the maximum value of width and height to prevent layout explosion,
   * but you can invert it to scale by the minimum value.
   *
   * @example
   * Let's say we have the following conditions:
   * - our icon is 16x32 (width x height)
   * - our text is 16px
   *
   * Depending on the value of `invert` prop, the icon will be rendered as:
   * - `false`: 8x16 (height is scaled to fit the text size)
   * - `true`: 16x32 (width is scaled to fit the text size)
   *
   * @default false
   */
  invert?: boolean;
}

/** Represents all possible icon names as the "<sprite name>:<symbol name>" string */
export type IconName = {
  [Key in keyof SpritesMeta]: `${Key}:${SpritesMeta[Key]}`;
}[keyof SpritesMeta];

export const Icon = forwardRef<SVGSVGElement, IconProps>(
  ({ name, className, invert, ...props }, ref) => {
    const {
      symbol: { viewBox, width, height },
      href
    } = useMemo(() => getIconMeta(name), [name]);
    const scaleX = width > height;
    const scaleY = width < height;

    return (
      <svg
        className={clsx(
          {
            /**
             * We want to control the icon's size based on its aspect ratio because we're scaling it
             * by the maximum value of width and height to prevent layout explosion.
             *
             * Also, different classes were chosen to avoid CSS overrides collisions.
             *
             * @see https://github.com/secundant/neodx/issues/92
             */
            'icon-x': invert ? scaleY : scaleX,
            'icon-y': invert ? scaleX : scaleY,
            icon: width === height
          },
          className
        )}
        // pass actual viewBox because of a browser inconsistencies if we don't
        viewBox={viewBox}
        // prevent icon from being focused when using keyboard navigation
        focusable="false"
        // hide icon from screen readers
        aria-hidden
        // pass through ref and other props
        ref={ref}
        {...props}
      >
        {/* External sprites href will be "<base url>/<file name>#<symbol name>",
      while the inlined one will be just "#<symbol name>" */}
        <use href={href} />
      </svg>
    );
  }
);

/** Safe wrapper for extracting icon metadata */
const getIconMeta = (name: IconName) => {
  const [spriteName, iconName] = name.split(':');
  const item = sprites.experimental_get(spriteName!, iconName!, spritesConfig);

  if (!item) {
    // Prevents crashing when icon name is invalid by returning a default icon
    console.error(`Icon "${name}" is not found in "${spriteName}" sprite`);
    return sprites.experimental_get('general', 'help', spritesConfig)!;
  }
  return item;
};

// For demonstration purposes, sprites are placed in the "/sprites" folder, but you can adapt it to your needs
const spritesConfig: SpritePrepareConfig = {
  baseUrl: '/sprites/'
};
