import { describe, expect, test } from 'vitest';
import { getColor, isPaintSolid } from '../utils';
import { testGraphs } from './testing-utils';

describe('traverse graph', () => {
  test('should collect colors', async () => {
    const filledColors = Object.values(testGraphs.weather.registry.styles).filter(
      ({ styleType }) => styleType === 'FILL'
    );
    const colors = {} as Record<string, string>;

    for (const { name, styles } of filledColors) {
      const solid = styles.find(isPaintSolid);

      if (!solid) continue;
      colors[name.toLowerCase().replaceAll(/[-/\s]/g, '.')] = getColor(solid.color).toHex();
    }

    expect(colors).toMatchInlineSnapshot(`
      {
        "dark.blue": "#343348",
        "gray.2": "#4f4f4f",
        "gray.3": "#828282",
        "gray.4": "#bdbdbd",
      }
    `);
  });
});
