import clsx from 'clsx';
import type { ReactNode } from 'react';

export const Informer = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div
    className={clsx(
      'text-base px-4 py-2 rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-700 max-w-[720px]',
      className
    )}
  >
    {children}
  </div>
);
