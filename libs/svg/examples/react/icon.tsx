import clsx from 'clsx';
import { SVGProps } from 'react';
import { SpritesMap } from './generated/sprite-info';

export type SpriteKey = {
  [Key in keyof SpritesMap]: `${Key}/${SpritesMap[Key]}`;
}[keyof SpritesMap];

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name' | 'type'> {
  name: SpriteKey;
}

export function Icon({ name, className, viewBox, ...props }: IconProps) {
  const [spriteName, iconName] = name.split('/');

  return (
    <svg
      className={clsx(
        'select-none fill-current w-[1em] h-[1em] inline-block text-inherit',
        className
      )}
      viewBox={viewBox}
      focusable="false"
      aria-hidden
      {...props}
    >
      <use xlinkHref={`/path/to/sprites/${spriteName}.svg#${iconName}`} />
    </svg>
  );
}
