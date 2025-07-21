import clsx from 'clsx';
import React, { useState } from 'react';
import { Badge } from '../shared/ui/badge.tsx';
import { Icon, type IconName } from '../shared/ui/icon';
import {
  IconCard,
  IconsShowcase,
  TextAlignmentShowcase
} from '../shared/ui/icons-showcase/icons-showcase.tsx';
import { Informer } from '../shared/ui/informer.tsx';
import { Input } from '../shared/ui/input.tsx';
import { Tabs } from '../shared/ui/tabs.tsx';

export function App() {
  const [selected, setSelected] = useState<IconName>('general:open');
  const [search, setSearch] = useState('');
  const [selectedTab, setSelectedTab] = useState('all-icons');

  return (
    <div className="container mx-auto min-h-screen text-2xl py-8 flex flex-col gap-8">
      <h1 className="text-6xl">
        <a href="https://neodx.pages.dev/svg/" className="hover:no-underline">
          <Badge className="hover:from-emerald-600 hover:to-yellow-600">@neodx/svg</Badge>
        </a>{' '}
        usage overview
      </h1>
      <Tabs
        value={selectedTab}
        onChange={setSelectedTab}
        tabs={[
          {
            label: 'All icons',
            value: 'all-icons',
            children: (
              <div>
                <div className="flex flex-col gap-4 py-1">
                  <IconCard name={selected} title={selected} size="lg" className="text-blue-600" />
                  <Input
                    className="w-[352px] grow"
                    placeholder="Type to filter icons by name"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <IconsShowcase search={search} onIconClick={setSelected} />
              </div>
            )
          },
          {
            label: 'Text alignment',
            value: 'text-alignment',
            children: (
              <>
                <Informer className="mb-4">
                  <p>
                    For details, please check out our{' '}
                    <a href="https://neodx.pages.dev/svg/recipes/text-alignment.html">
                      text alignment
                    </a>{' '}
                    guide.
                  </p>
                  <p>This example demonstrates various text options aligned with SVG icons.</p>
                </Informer>
                <TextAlignmentShowcase name={selected} />
              </>
            )
          },
          {
            label: 'Multiple colors',
            value: 'multiple-colors',
            children: (
              <div className="text-base">
                <Informer className="mb-4">
                  For details, please check out our{' '}
                  <a href="https://neodx.pages.dev/svg/colors-reset.html">color reset guide</a>,
                  where we explain how to set up the <Badge size="sm">--icon-secondary-color</Badge>{' '}
                  variable to control all unspecified colors.
                </Informer>
                <p className="mb-4">
                  After setting up the CSS variable for unspecified colors, you can use it in the
                  following ways:
                </p>
                <ul className="text-sm list-disc mb-4 space-y-4">
                  <li>
                    <Badge type="code" size="sm">
                      &lt;Icon name="..." className="
                      <b className="text-sky-500">icon-secondary-sky-500</b>" /&gt;
                    </Badge>{' '}
                    if you adopted the{' '}
                    <a href="https://neodx.pages.dev/svg/multicolored.html#tailwind-plugin">
                      Tailwind plugin
                    </a>{' '}
                    ,
                  </li>
                  <li>
                    <Badge type="code" size="sm">
                      &lt;Icon name="..." className="[--icon-secondary-color:theme(
                      <b className="text-sky-500">colors.sky.500</b>)]" /&gt;
                    </Badge>{' '}
                    , or
                  </li>
                  <li>
                    <Badge type="code" size="sm">
                      &lt;Icon name="..." style=&#123;&#123; '--icon-secondary-color': 'theme(
                      <b className="text-sky-500">colors.sky.500</b>)' &#125;&#125; /&gt;
                    </Badge>{' '}
                    (inline styles for example purposes) if you don't use any plugin.
                  </li>
                </ul>
                <p>Let's see how it works in practice with the following example:</p>
                <p className="mt-2 mb-4">
                  <Badge type="code" size="sm">
                    &lt;Icon name="..." className="
                    <br />
                    &nbsp;&nbsp;<span className="text-sky-500">text-sky-500</span>{' '}
                    <span className="text-yellow-600">hover:text-yellow-600</span>
                    <br />
                    &nbsp;&nbsp;<span className="text-teal-600">icon-secondary-teal-600</span>{' '}
                    <span className="text-red-800">hover:icon-secondary-red-800</span>
                    <br />" /&gt;
                  </Badge>
                </p>
                <IconCard
                  size="lg"
                  name="general:project-structure"
                  className="text-sky-500 hover:text-yellow-600 icon-secondary-teal-600 hover:icon-secondary-red-800"
                />
              </div>
            )
          },
          {
            label: 'Sprites features overview',
            value: 'other-usage',
            children: (
              <>
                <Informer className="mb-4">
                  Thanks to SVG sprites, you can use our icons just like regular HTML elements and
                  enjoy all the advantages of CSS.
                </Informer>
                <div className="flex flex-col text-lg">
                  <h3 className="text-xl font-medium mt-8 mb-4">
                    Icon size and color are based on the current text size and color
                  </h3>
                  <div className="flex gap-2 items-center">
                    <Icon name="general:delete" className="text-xs" />
                    <Icon name="general:delete" className="text-yellow-600" />
                    <Icon name="general:delete" className="text-2xl text-orange-600" />
                    <Icon name="general:delete" className="text-4xl text-pink-600" />
                    <Icon name="general:delete" className="text-6xl text-purple-800" />
                  </div>
                  <h3 className="text-xl font-medium mt-8 mb-4">
                    Icons could be different shapes and colors
                  </h3>
                  <div className="flex gap-4 items-center text-4xl">
                    <Icon name="general:copy" />
                    <Icon name="other:twitter" />
                    <Icon name="other:us" />
                    <Icon name="other:linkedin" invert />
                  </div>
                  <h3 className="text-xl font-medium mt-8 mb-4">
                    <Badge type="code" size="sm">
                      &lt;Icon ... /&gt;
                    </Badge>{' '}
                    it's just a regular HTML element and could be styled in any way
                  </h3>
                  <div className="flex gap-2 items-center">
                    <Icon
                      name="general:edit"
                      className="bg-pink-100 text-pink-700 p-2 rounded-full border border-pink-700"
                    />
                    <Icon
                      name="general:save"
                      role="button"
                      className={clsx(
                        'text-4xl p-4 rounded-xl border border-zinc-200 bg-zinc-100 text-zinc-800',
                        'hover:border-zinc-300 hover:bg-zinc-200 hover:text-zinc-900',
                        'active:translate-y-0.5'
                      )}
                    />
                  </div>
                  <h3 className="text-xl font-medium mt-8 mb-4">
                    Non-square shapes are scaled by the highest dimension
                  </h3>
                  <div className="flex gap-4 items-center">
                    But default the highest side is equal to font size: horizontal icon{' '}
                    <Icon name="other:linkedin" /> will be visually smaller than regular square icon{' '}
                    <Icon name="general:settings" />
                  </div>
                  <div className="flex gap-4 items-center">
                    If you want to scale lower side instead, you can use{' '}
                    <Badge type="code" size="sm">
                      &lt;Icon invert
                    </Badge>{' '}
                    prop: now
                    <Icon name="other:linkedin" invert /> will be same size as{' '}
                    <Icon name="general:settings" />
                  </div>
                  <div className="flex gap-4 items-center">
                    It could be better illustrated with some large font size, for example,{' '}
                    <Badge type="code" size="sm">
                      text-8xl
                    </Badge>
                    :
                    <Icon name="other:linkedin" className="text-8xl" />
                    /
                    <Icon name="other:linkedin" invert className="text-8xl" />
                  </div>
                </div>
              </>
            )
          }
        ]}
      />
    </div>
  );
}
