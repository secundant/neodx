import clsx from 'clsx';
import { type SVGProps } from 'react';
import { sprites, type SpritesMeta } from './sprite.gen';

/** Icon props extending SVG props and requiring specific icon name */
export interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
}

/** Represents all possible icon names as the `<sprite name>/<symbol name>` string */
export type IconName = {
  [Key in keyof SpritesMeta]: `${Key}/${SpritesMeta[Key]}`;
}[keyof SpritesMeta];

export function Icon({ name, className, ...props }: IconProps) {
  const {
    symbol: { viewBox, width, height },
    href
  } = getIconMeta(name);

  return (
    <svg
      className={clsx(
        {
          /**
           * We want to control the icon's size based on its aspect ratio because we're scaling it
           * by the minimum value of width and height to prevent layout explosion.
           *
           * Also, different classes were chosen to avoid CSS overrides collisions.
           *
           * @see https://github.com/secundant/neodx/issues/92
           */
          'icon-x': width > height,
          'icon-y': width < height,
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
      {...props}
    >
      <use href={href} />
    </svg>
  );
}

/**
 * Safe extraction
 */
const getIconMeta = (name: IconName) => {
  const [spriteName, iconName] = name.split('/');
  const item = sprites.experimental_get(spriteName!, iconName!, config);

  if (!item) {
    // Prevents crashing when icon name is invalid by returning a default icon
    console.error(`Icon "${name}" is not found in "${spriteName}" sprite`);
    return sprites.experimental_get('common', 'help', config)!;
  }
  return item;
};

const config = {
  baseUrl: '/sprites/'
};
