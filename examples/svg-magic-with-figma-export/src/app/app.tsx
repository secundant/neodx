import '../shared/ui/index.css';
import { Icon, SPRITES_META } from '../shared/ui/icon';

export function App() {
  return (
    <div className="container mx-auto min-h-screen text-2xl py-8">
      <h1 className="mb-8">Playground</h1>
      <Icon
        className="p-4 rounded-lg bg-slate-200 text-8xl text-pink-800"
        name="tool-windows/coverage"
      />
      {Object.entries(SPRITES_META).flatMap(([key, icons]) => (
        <section key={key}>
          <h3 className="first-letter:uppercase my-8 text-xl">{key}</h3>
          <div className="flex gap-4 flex-wrap">
            {icons.map(icon => (
              <Icon
                key={`${key}/${icon}`}
                name={`${key}/${icon}` as any}
                className="p-4 text-green-700 bg-gray-200 rounded-md"
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
