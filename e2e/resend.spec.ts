import { test, expect } from '@playwright/test';

test('sends email via Resend API', async ({ page }) => {
  await page.goto('http://localhost:3000/api/test-email');

  await expect(page.getByText('id')).toBeVisible();
});

test('mocks Resend API response', async ({ page }) => {
  const body = JSON.stringify({
    data: {
      id: '621f3ecf-f4d2-453a-9f82-21332409b4d2',
    },
  });

  await page.route('*/**/api/test-email', async (route) => {
    await route.fulfill({
      body,
      contentType: 'application/json',
      status: 200,
    });
  });

  await page.goto('http://localhost:3000/api/test-email');

  await expect(page.getByText('621f3ecf-f4d2-453a-9f82-21332409b4d2')).toBeVisible();
});
