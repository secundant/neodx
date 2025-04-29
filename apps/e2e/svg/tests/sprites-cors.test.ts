import { expect, test } from '@playwright/test';

test.describe('Sprites CORS', () => {
  test('should render all icons correctly (visual regression)', async ({ page }) => {
    await page.goto('http://localhost:25000/sprites-cors.html');
    await page.waitForSelector('#sprite-cors svg symbol', {
      timeout: 5000,
      strict: false,
      state: 'hidden'
    });

    // Screenshot the icon row for visual regression
    expect(await page.locator('body').screenshot()).toMatchSnapshot('sprites-cors.png');
  });
});
