import clsx from 'clsx';
import type { ReactNode } from 'react';

export const Sections = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-col gap-4">{children}</div>
);

export const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section>
    <h4 className="text-xl text-neutral-700 mb-4 sticky top-0 p-4 bg-white">{title}</h4>
    <div className="flex gap-4 flex-wrap text-4xl">{children}</div>
  </section>
);

export const IconButton = ({
  name,
  onClick,
  children
}: {
  name: string;
  onClick?: () => void;
  children: ReactNode;
}) => (
  <div
    role="button"
    className={clsx(
      'border transition-all duration-75 border-current p-6 rounded-xl',
      'hover:bg-neutral-100 hover:scale-105',
      'active:bg-neutral-200'
    )}
    onClick={onClick}
    title={name}
  >
    {children}
  </div>
);
