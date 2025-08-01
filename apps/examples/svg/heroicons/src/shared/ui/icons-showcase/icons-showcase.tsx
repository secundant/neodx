import clsx from 'clsx';
import { type ReactNode, useMemo } from 'react';
import { Icon, type IconName, type IconProps, sprites } from '../icon';
import styles from './icons-showcase.module.css';

export const IconsShowcase = ({
  search,
  onIconClick
}: {
  search: string;
  onIconClick: (name: IconName) => void;
}) => {
  const filtered = useMemo(() => {
    const parts = search
      .split(/[\s:,]/g)
      .map(part => part.toLowerCase())
      .filter(Boolean);

    return sprites.all
      .map(sprite => ({
        sprite,
        symbols: sprite.symbols.names
          .filter(name => parts.every(part => name.includes(part)))
          .map(name => ({
            name,
            icon: `${sprite.name}:${name}` as IconName
          }))
      }))
      .filter(it => it.symbols.length > 0);
  }, [search]);

  return (
    <div className="container mx-auto min-h-screen text-2xl flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <Sections>
          {filtered.map(({ symbols, sprite }) => (
            <Section key={sprite.name} title={sprite.name}>
              {symbols.map(it => (
                <IconCard
                  key={it.name}
                  name={it.icon}
                  title={it.name}
                  onClick={() => onIconClick(it.icon)}
                />
              ))}
            </Section>
          ))}
        </Sections>
      </div>
    </div>
  );
};

export const IconCard = ({
  className,
  size = 'sm',
  title,
  onClick,
  children,
  ...props
}: IconProps & { title?: string; size?: 'sm' | 'lg'; onClick?: () => void }) => (
  <div
    role="button"
    className={clsx(
      'inline-flex flex-col items-center justify-center gap-4 text-center outline outline-neutral-200 rounded-xl',
      size === 'sm' && 'size-[144px] text-[64px]',
      size === 'lg' && 'size-[352px] text-[256px]',
      onClick
        ? 'cursor-pointer transition-all duration-75 hover:bg-neutral-100 hover:outline-neutral-300 active:bg-neutral-200'
        : 'cursor-default',
      styles.dotPattern,
      className
    )}
    title={title ?? props.name}
    onClick={onClick}
  >
    <div className="text-xs invisible">&nbsp;</div>
    <div className={clsx('pr-[1px] pb-[1px]', styles.gridPattern, styles[size])}>
      {children || <Icon {...props} />}
    </div>
    <div className="text-xs truncate max-w-full px-1">{title || <>&nbsp;</>}</div>
  </div>
);

export const Sections = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-col gap-4">{children}</div>
);

export const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section>
    <h4 className="text-xl font-medium tracking-wider text-neutral-700 sticky top-0 py-4 bg-white">
      {title}
    </h4>
    <div className="flex gap-4 flex-wrap text-4xl p-1">{children}</div>
  </section>
);
