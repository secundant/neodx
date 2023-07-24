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
  const { viewBox } = (items as any)[iconName] as { viewBox: string };

  return (
    <svg
      className={clsx('icon', className)}
      viewBox={viewBox}
      focusable="false"
      aria-hidden
      {...props}
    >
      <use href={`/${filePath}#${iconName}`} />
    </svg>
  );
}
