import { expect, test } from '@playwright/test';

const representativeRoutes = [
  '/en/',
  '/en/guides/',
  '/en/guides/complete-guide-to-znjan-beach/',
  '/en/articles/how-to-get-to-znjan-beach/',
  '/en/places/',
  '/en/places/casa-sol/',
  '/en/activities/swimming/',
  '/en/beach-areas/main-beach/',
  '/en/events/',
  '/en/contact/',
  '/en/privacy/',
  '/en/community/',
  '/en/community/sports/',
];

test('representative public templates render successfully', async ({ page }) => {
  for (const route of representativeRoutes) {
    const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
    expect(response?.status(), route).toBe(200);
    await expect(page.locator('h1').first(), `${route} should have an H1`).toBeVisible();
  }
});

test('mobile navigation opens, exposes primary links, and closes after navigation', async (
  { page },
  testInfo,
) => {
  test.skip(testInfo.project.name !== 'mobile-chromium', 'Mobile navigation coverage.');
  await page.goto('/en/');

  const button = page.locator('#mobile-menu-btn');
  await button.click();
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#mobile-menu')).toBeVisible();

  await page.locator('#mobile-menu a[href="/en/guides/"]').click();
  await expect(page).toHaveURL(/\/en\/guides\/$/);
});
