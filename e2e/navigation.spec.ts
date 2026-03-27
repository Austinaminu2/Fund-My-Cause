import { test, expect } from "./fixtures/wallet";

test("landing page hero is visible and 'Explore Campaigns' navigates to /campaigns", async ({ page }) => {
  await page.goto("/");

  // Hero heading is visible
  await expect(page.getByRole("heading", { name: /Fund the Future/i })).toBeVisible();

  // Click the primary CTA and land on /campaigns
  await page.getByRole("link", { name: /Explore Campaigns/i }).click();
  await expect(page).toHaveURL(/\/campaigns/);
});
