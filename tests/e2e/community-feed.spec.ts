import { expect, test } from '@playwright/test';

test('shows an honest retry state when the community feed fails', async ({ page }) => {
  await page.route('**/api/posts/**', async (route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Internal server error' }),
    });
  });

  await page.goto('/en/community/');

  const feedError = page.getByRole('alert');
  await expect(feedError).toContainText("We couldn't load community posts.");
  await expect(feedError.getByRole('button', { name: 'Try again' })).toBeVisible();
  await expect(feedError.getByRole('link', { name: 'Contact us' })).toBeVisible();
  await expect(page.getByText('No posts yet.')).not.toBeVisible();
});
