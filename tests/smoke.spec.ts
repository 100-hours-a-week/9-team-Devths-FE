import { test, expect } from '@playwright/test';

test('smoke: runner works', async ({ page }) => {
  await page.goto('about:blank');
  await expect(page).toHaveURL('about:blank');
});
