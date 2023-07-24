import clsx from 'clsx';
import type { SVGProps } from 'react';
import { SPRITES_META, type SpritesMap } from './sprite.gen';

export type IconName = {
  [Key in keyof SpritesMap]: `${Key}/${SpritesMap[Key]}`;
}[keyof SpritesMap];

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name' | 'type'> {
  name: IconName;
}

export function Icon({ name, className, ...props }: IconProps) {
  const [spriteName, iconName] = name.split('/') as [
    keyof SpritesMap,
    SpritesMap[keyof SpritesMap]
  ];
  const { filePath, items } = SPRITES_META[spriteName];
  // TODO Fix types
  const { viewBox, width, height } = (items as any)[iconName] as any;
  const rect = width === height ? 'xy' : width > height ? 'x' : 'y';

  return (
    <svg
      className={clsx('icon', className)}
      /**
       * this prop is used by the "icon" class to set the icon's scaled size
       * @see https://github.com/secundant/neodx/issues/92
       */
      data-icon-aspect-ratio={rect}
      viewBox={viewBox}
      focusable="false"
      aria-hidden
      {...props}
    >
      <use href={`/${filePath}#${iconName}`} />
    </svg>
  );
}
