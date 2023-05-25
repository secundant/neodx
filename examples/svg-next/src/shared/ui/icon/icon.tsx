import clsx from 'clsx';
import type { SVGProps } from 'react';
import type { SpritesMap } from './sprite.gen';

export type IconName = SpritesMap['sprite'];

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name' | 'type'> {
  name: IconName;
}

export function Icon({ name, className, viewBox, ...props }: IconProps) {
  return (
    <svg
      className={clsx('icon', className)}
      viewBox={viewBox}
      focusable="false"
      aria-hidden
      {...props}
    >
      <use xlinkHref={`/sprite.svg#${name}`} />
    </svg>
  );
}
