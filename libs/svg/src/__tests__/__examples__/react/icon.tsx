import clsx from 'clsx';
import { type SVGProps } from 'react';
import { type SpritesMeta } from './generated/sprite-info';

export type SpriteKey = {
  [Key in keyof SpritesMeta]: `${Key}/${SpritesMeta[Key]}`;
}[keyof SpritesMeta];

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
      <use href={`/path/to/sprites/${spriteName}.svg#${iconName}`} />
    </svg>
  );
}
