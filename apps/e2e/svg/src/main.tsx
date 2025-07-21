import './styles.css';
import clsx from 'clsx';
import { useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import type { SpritePrepareConfig } from './inline-all.gen.ts';
import * as inlineAll from './inline-all.gen.ts';
import * as inlineAllExtract from './inline-all-extract.gen.ts';
import * as inlineAuto from './inline-auto.gen.ts';
import * as noInline from './no-inline.gen.ts';

const sameDomainConfig = {
  baseUrl: '/sprites'
};
const corsDomainConfig = {
  baseUrl: 'http://localhost:25001/sprites/'
};
const caseWithDomains = (it: CaseConfig) => [
  {
    ...it,
    name: `${it.name} (Same Domain)`,
    config: sameDomainConfig
  },
  {
    ...it,
    name: `${it.name} (CORS Domain)`,
    config: corsDomainConfig
  }
];
const cases = [
  {
    name: 'Inline All',
    sprites: inlineAll.sprites
  },
  caseWithDomains({
    name: 'Inline All [Extract]',
    sprites: inlineAllExtract.sprites
  }),
  caseWithDomains({
    name: 'Inline Auto',
    sprites: inlineAuto.sprites
  }),
  caseWithDomains({
    name: 'No Inline',
    sprites: noInline.sprites
  })
].flat();

interface CaseConfig {
  name: string;
  sprites: any;
  config?: SpritePrepareConfig;
}

const App = () => (
  <>
    {cases.map(it => (
      <Case key={it.name} {...it} />
    ))}
  </>
);

const Case = ({ name, sprites, config }: CaseConfig) => (
  <section className="icon-section text-blue-500">
    <h2>{name}</h2>
    <div className="icon-row">
      {sprites.all.flatMap((it: any) =>
        it.symbols.names.sort().map((iconName: any) => (
          <div className="icon-cell" key={iconName} title={iconName}>
            <Icon sprites={sprites} name={`${it.name}:${iconName}`} config={config} />
            <label>{iconName}</label>
          </div>
        ))
      )}
    </div>
  </section>
);
const Icon = ({
  name,
  invert,
  sprites,
  config
}: {
  name: string;
  sprites: any;
  config?: SpritePrepareConfig;
  invert?: boolean;
}) => {
  const {
    symbol: { viewBox, width, height },
    href
  } = useMemo(() => {
    const [spriteName, iconName] = name.split(':');
    const item = sprites.experimental_get(spriteName!, iconName!, config);

    if (!item) {
      // Prevents crashing when icon name is invalid by returning a default icon
      console.error(`Icon "${name}" is not found in "${spriteName}" sprite`);
      return sprites.experimental_get('general', 'help', config)!;
    }
    return item;
  }, [name, sprites, config]);
  const scaleX = width > height;
  const scaleY = width < height;

  return (
    <svg
      className={clsx({
        'icon-x': invert ? scaleY : scaleX,
        'icon-y': invert ? scaleX : scaleY,
        icon: width === height
      })}
      viewBox={viewBox}
      focusable="false"
      aria-hidden
    >
      <use href={href} />
    </svg>
  );
};

// ---

createRoot(document.querySelector('#root') as HTMLElement).render(<App />);
