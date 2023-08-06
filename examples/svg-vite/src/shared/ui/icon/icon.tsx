import clsx from 'clsx';
import type { SVGProps } from 'react';
import { SPRITES_META, type SpritesMap } from './sprite.gen';

export interface IconProps extends SVGProps<SVGSVGElement> {
  name: AnyIconName;
  bugged?: boolean;
}

export type AnyIconName = { [Key in keyof SpritesMap]: IconName<Key> }[keyof SpritesMap];
export type IconName<Key extends keyof SpritesMap> = `${Key}/${SpritesMap[Key]}`;

export function Icon({ name, className, bugged, ...props }: IconProps) {
  const { viewBox, filePath, iconName, axis } = getIconMeta(name);

  return (
    <svg
      className={clsx('icon', className)}
      viewBox={viewBox}
      /**
       * This prop is used by the "icon" class to set the icon's scaled size
       * @see https://github.com/secundant/neodx/issues/92
       */
      data-axis={bugged ? 'xy' : axis}
      // prevent icon from being focused when using keyboard navigation
      focusable="false"
      // hide icon from screen readers
      aria-hidden
      {...props}
    >
      <use href={`/icons-sprite/${filePath}#${iconName}`} />
    </svg>
  );
}

/**
 * A function to get and process icon metadata.
 * It was moved out of the Icon component to prevent type inference issues.
 */
const getIconMeta = <Key extends keyof SpritesMap>(name: IconName<Key>) => {
  const [spriteName, iconName] = name.split('/') as [Key, SpritesMap[Key]];
  const {
    filePath,
    items: {
      [iconName]: { viewBox, width, height }
    }
  } = SPRITES_META[spriteName];
  const axis = width === height ? 'xy' : width > height ? 'x' : 'y';

  return { filePath, iconName, viewBox, axis };
};
