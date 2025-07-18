import { expect, test } from '@playwright/test';

test.describe('@neodx/svg', () => {
  test('should render all icons correctly (visual regression)', async ({ page }) => {
    await page.goto('http://localhost:25000/index.html');
    await page.waitForResponse(it => it.url().includes('/sprites') && it.status() === 200);
    await page.waitForSelector('svg symbol', {
      timeout: 5000,
      strict: false,
      state: 'hidden'
    });
    await page.waitForLoadState('networkidle');
    await page.locator('svg').evaluateAll(svgs => {
      for (const svg of svgs as SVGSVGElement[]) {
        svg.pauseAnimations();
        svg.setCurrentTime(0);
      }
    });

    expect(await page.locator('body').screenshot({ animations: 'disabled' })).toMatchSnapshot(
      'sprites-e2e.png'
    );
  });
});
