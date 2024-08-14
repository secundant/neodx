import * as heroicons16solid from '@heroicons/react/16/solid';
import * as heroicons20solid from '@heroicons/react/20/solid';
import * as heroicons24outline from '@heroicons/react/24/outline';
import * as heroicons24solid from '@heroicons/react/24/solid';
import { type ComponentType, memo } from 'react';
import { IconButton, Section, Sections } from '../shared/ui/playground.tsx';

const reactIconsMap = {
  '16/solid': heroicons16solid,
  '20/solid': heroicons20solid,
  '24/solid': heroicons24solid,
  '24/outline': heroicons24outline
} satisfies Record<string, Record<string, ComponentType>>;

export const heroiconsReactScreen = {
  label: '@heroicons/react',
  ui: memo(({ filter }: { filter?: string }) => (
    <Sections>
      {Object.entries(reactIconsMap).map(([name, icons]) => (
        <Section key={name} title={name}>
          {Object.entries(icons)
            .filter(([name]) => !filter || name.includes(filter.toLowerCase()))
            .map(([iconName, Icon]) => (
              <IconButton key={iconName} name={iconName}>
                <Icon className="w-[1em] h-[1em]" />
              </IconButton>
            ))}
        </Section>
      ))}
    </Sections>
  ))
};
