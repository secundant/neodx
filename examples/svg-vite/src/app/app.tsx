import { Fragment } from 'react';
import type { IconName } from '../shared/ui/icon';
import { Icon, SPRITES_META } from '../shared/ui/icon';

export function App() {
  return (
    <div className="container mx-auto min-h-screen text-2xl py-8 flex flex-col gap-8">
      <section className="grid grid-cols-2 grid-flow-row gap-8">
        <h1 className="inline-flex items-center gap-2">
          Playground <Icon name="common/favourite" />
        </h1>
        <div>
          <h1>Multicolor icon</h1>
          <h3 className="text-lg text-neutral-700">
            Use{' '}
            <small className="bg-gradient-to-r from-cyan-700 to-cyan-800 text-white p-1 rounded-lg">
              --icon-color
            </small>{' '}
            to control second color
          </h3>
        </div>
        <Icon
          className="rounded-xl bg-gradient-to-br from-slate-100 to-stone-200 shadow-sm border border-gray-300 p-8 text-8xl text-red-800"
          name="common/favourite"
        />
        <Icon
          className="rounded-xl bg-zinc-100 border border-gray-300 p-8 text-8xl text-sky-600 [--icon-color:theme(colors.green.800)]"
          name="common/double-color"
        />
      </section>
      <h1>All icons</h1>
      <section className="flex gap-4 flex-nowrap text-4xl">
        {Object.entries(SPRITES_META).map(([group, names]) => (
          <Fragment key={group}>
            {names.map(name => (
              <Icon
                key={name}
                className="rounded-lg bg-neutral-100 border border-stone-200 p-4 text-violet-800"
                name={`${group}/${name}` as IconName}
              />
            ))}
          </Fragment>
        ))}
      </section>
    </div>
  );
}
