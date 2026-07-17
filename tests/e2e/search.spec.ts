import { expect, test } from '@playwright/test';

test('desktop and mobile search triggers control one accessible dialog', async ({ page }, testInfo) => {
  await page.goto('/en/');

  await expect(page.locator('#search-dialog')).toHaveCount(1);
  if (testInfo.project.name === 'mobile-chromium') {
    await page.locator('#mobile-menu-btn').click();
  }

  await page.locator('[data-search-trigger]:visible').click();
  const dialog = page.locator('#search-dialog');
  await expect(dialog).toHaveJSProperty('open', true);
  await expect(page.locator('#search-input')).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(dialog).toHaveJSProperty('open', false);
});

test('slash keyboard shortcut opens search without hijacking form input', async ({ page }) => {
  await page.goto('/en/');
  await page.keyboard.press('/');
  await expect(page.locator('#search-dialog')).toHaveJSProperty('open', true);
});
