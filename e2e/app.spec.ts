import { expect, test } from "@playwright/test";

test("renders the public landing page", async ({ page }) => {
  await page.goto("/pt");

  await expect(page.getByText("SINTROPIA").first()).toBeVisible();
  await expect(page.locator("main")).toBeVisible();
});

test("serves the sitemap", async ({ request }) => {
  const response = await request.get("/sitemap.xml");

  expect(response.ok()).toBeTruthy();
  await expect(response.text()).resolves.toContain("urlset");
});
