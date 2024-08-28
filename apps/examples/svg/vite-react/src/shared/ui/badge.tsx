import clsx from 'clsx';
import type { ReactNode } from 'react';

export const Badge = ({
  className,
  children,
  size = 'md',
  type = 'info'
}: {
  className?: string;
  children: ReactNode;
  size?: 'sm' | 'md';
  type?: 'info' | 'code';
}) => {
  const Tag = type === 'info' ? 'span' : 'code';

  return (
    <Tag
      className={clsx(
        type === 'info' && 'bg-gradient-to-r from-blue-500 to-sky-700 text-white whitespace-nowrap',
        type === 'code' && 'outline outline-zinc-200 bg-zinc-100 text-zinc-700',
        size === 'md' && 'px-2 py-1 rounded-2xl',
        size === 'sm' && 'px-1 py-0.5 rounded-md',
        className
      )}
    >
      {children}
    </Tag>
  );
};
