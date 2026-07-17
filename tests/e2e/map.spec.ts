import { expect, test } from '@playwright/test';

test('homepage map receives the localized beach and venue marker model', async ({ page }) => {
  await page.goto('/en/');

  const map = page.locator('#beach-map');
  await expect(map).toBeVisible();
  await expect(map).toHaveAttribute('data-marker-count', /^(?!0$)\d+$/);
});
