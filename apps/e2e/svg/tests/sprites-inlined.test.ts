import { expect, test } from '@playwright/test';

test.describe('Sprites Inlined', () => {
  test('should render all icons correctly (visual regression)', async ({ page }) => {
    await page.goto('http://localhost:25000/sprites-inlined.html');

    // Screenshot the icon row for visual regression
    expect(await page.locator('body').screenshot()).toMatchSnapshot('sprites-inlined.png');
  });
});
