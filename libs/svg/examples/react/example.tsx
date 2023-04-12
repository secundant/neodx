import { Icon } from './icon';

export function Example() {
  return (
    <main className="flex items-center gap-2">
      <Icon className="text-lg" name="common/close" />
      <Icon name="format/align-left" />
      <Icon name="common/favourite" />
    </main>
  );
}
