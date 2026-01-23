import { test, expect } from '@playwright/test';

test('landing page loads', async ({ page }) => {
  const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';

  await page.goto(baseURL);
  await expect(page.getByRole('heading', { name: 'Devths' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign in with Google' })).toBeVisible();
});
