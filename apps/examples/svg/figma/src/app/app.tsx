import '../shared/ui/index.css';
import { Icon, sprites } from '../shared/ui/icon';

export function App() {
  return (
    <div className="container mx-auto min-h-screen text-2xl py-8">
      <h1 className="mb-8">Playground</h1>
      <Icon
        className="p-4 rounded-lg bg-slate-200 text-8xl text-pink-800"
        name="tool-windows/coverage"
      />
      {sprites.all.map(sprite => (
        <section key={sprite.name}>
          <h3 className="first-letter:uppercase my-8 text-xl">{sprite.name}</h3>
          <div className="flex gap-4 flex-wrap">
            {sprite.symbols.all.map(symbol => (
              <Icon
                key={`${sprite.name}/${symbol.name}`}
                name={`${sprite.name}/${symbol.name}` as any}
                className="p-4 text-green-700 bg-gray-200 rounded-md"
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
