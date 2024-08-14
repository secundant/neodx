import { useState } from 'react';
import { heroiconsReactScreen } from '../screens/heroicons-react.tsx';
import { neodxScreen } from '../screens/neodx-svg.tsx';
import { Input } from '../shared/ui/input.tsx';
import { Select } from '../shared/ui/select.tsx';

export function App() {
  const [mode, setMode] = useState<'react' | 'neodx'>('react');
  const [color, setColor] = useState<'currentColor' | string>('#5b21b6');
  const [search, setSearch] = useState('');
  const screen = screens[mode];

  return (
    <div className="container mx-auto min-h-screen text-2xl py-8 flex flex-col gap-8">
      <div className="flex gap-4">
        <Select
          value={mode}
          className="rounded-lg bg-slate-100 text-2xl text-slate-800 p-2"
          onChange={e => setMode(e.target.value as any)}
        >
          {Object.entries(screens).map(([key, { label }]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </Select>
        <Input
          type="color"
          className="py-2 w-20"
          value={color}
          onChange={e => setColor(e.target.value)}
        />
        <Input
          className="ml-auto grow"
          placeholder="Type to filter icons by name"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-4" style={{ color }}>
        {screen && <screen.ui filter={search} />}
      </div>
    </div>
  );
}

const screens = {
  react: heroiconsReactScreen,
  neodx: neodxScreen
};
