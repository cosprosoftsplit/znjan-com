import { expect, test } from '@playwright/test';

test('detail-page language alternates use localized slugs', async ({ page }, testInfo) => {
  await page.goto('/en/articles/how-to-get-to-znjan-beach/');
  if (testInfo.project.name === 'mobile-chromium') {
    await page.locator('#mobile-menu-btn').click();
  }

  const switcher = page.locator('[data-lang-switcher]:visible');
  await switcher.locator('[data-lang-trigger]').click();
  const spanish = switcher.locator('a[hreflang="es"]');
  await expect(spanish).toHaveAttribute(
    'href',
    '/es/articles/como-llegar-a-la-playa-de-znjan/',
  );
});

test('expanded Latin, Croatian, and Polish homepages preserve structural parity', async ({ page }) => {
  for (const lang of ['en', 'fr', 'hr', 'pl']) {
    await page.goto(`/${lang}/`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('html')).toHaveAttribute('lang', lang);
    await expect(page.locator('main h1')).toHaveCount(1);
    await expect(page.locator('#beach-map')).toHaveAttribute('data-marker-count', /^(?!0$)\d+$/);
    await expect(page.locator('iframe[src*="instagram.com"]')).toHaveCount(0);
  }
});
