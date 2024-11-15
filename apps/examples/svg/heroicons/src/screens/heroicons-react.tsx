import * as heroicons16solid from '@heroicons/react/16/solid';
import * as heroicons20solid from '@heroicons/react/20/solid';
import * as heroicons24outline from '@heroicons/react/24/outline';
import * as heroicons24solid from '@heroicons/react/24/solid';
import { cases } from '@neodx/std';
import React, { type ComponentProps, type ComponentType, memo, useMemo } from 'react';
import type { IconName } from '../shared/ui/icon';
import {
  IconCard,
  type IconsShowcase,
  Section,
  Sections
} from '../shared/ui/icons-showcase/icons-showcase.tsx';

const reactIconsMap = {
  '16/solid': heroicons16solid,
  '20/solid': heroicons20solid,
  '24/solid': heroicons24solid,
  '24/outline': heroicons24outline
} satisfies Record<string, Record<string, ComponentType>>;

export const heroiconsReactScreen = {
  label: '@heroicons/react',
  preview: memo(({ name }: { name: IconName }) => {
    const [group, icon] = name.split(':') as [string, string];
    const componentKey = `${cases.pascal(icon)}Icon`;
    const Component = (reactIconsMap as any)[group][componentKey];

    return (
      <IconCard name={name as any} size="lg" className="text-blue-600">
        <Component className="w-[1em] h-[1em]" />
      </IconCard>
    );
  }),
  ui: memo(({ search, onIconClick }: ComponentProps<typeof IconsShowcase>) => {
    const filtered = useMemo(() => {
      const parts = search
        .split(/[\s:,]/g)
        .map(part => part.toLowerCase())
        .filter(Boolean);

      return Object.entries(reactIconsMap)
        .map(([name, icons]) => ({
          name,
          icons: Object.entries(icons)
            .filter(([name]) => parts.every(part => name.includes(part)))
            .map(([name, Icon]) => ({
              name: cases.kebab(name.replace(/Icon$/, '')),
              Icon
            }))
        }))
        .filter(it => it.icons.length > 0);
    }, [search]);

    return (
      <div className="container mx-auto min-h-screen text-2xl flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <Sections>
            {filtered.map(({ name, icons }) => (
              <Section key={name} title={name}>
                {icons.map(it => (
                  <IconCard
                    key={it.name}
                    name={`${name}:${it.name}` as any}
                    title={it.name}
                    onClick={() => onIconClick(`${name}:${it.name}` as any)}
                  >
                    <it.Icon className="w-[1em] h-[1em]" />
                  </IconCard>
                ))}
              </Section>
            ))}
          </Sections>
        </div>
      </div>
    );
  })
};
