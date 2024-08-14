import { memo } from 'react';
import { Icon, type IconName, sprites } from '../shared/ui/icon';
import { IconButton, Section, Sections } from '../shared/ui/playground.tsx';

export const neodxScreen = {
  label: '@neodx/svg',
  ui: memo(({ filter }: { filter?: string }) => (
    <Sections>
      {sprites.all.map(sprite => (
        <Section key={sprite.name} title={sprite.name}>
          {sprite.symbols.names
            .filter(name => !filter || name.includes(filter.toLowerCase()))
            .map(name => (
              <IconButton key={name} name={name}>
                <Icon name={`${sprite.name}/${name}` as IconName} />
              </IconButton>
            ))}
        </Section>
      ))}
    </Sections>
  ))
};
