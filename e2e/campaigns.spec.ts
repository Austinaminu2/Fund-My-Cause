import { test, expect } from "./fixtures/wallet";

test("home page featured campaigns render a ProgressBar", async ({ page }) => {
  await page.goto("/");

  // The ProgressBar component renders a filled div with an inline width style
  // inside a rounded progress track — present for every featured campaign card.
  const progressTrack = page.locator(".bg-gray-800.rounded-full").first();
  await expect(progressTrack).toBeVisible();

  // The percentage label is also rendered alongside each bar
  const percentLabel = page.locator("text=/%$/").first();
  await expect(percentLabel).toBeVisible();
});
