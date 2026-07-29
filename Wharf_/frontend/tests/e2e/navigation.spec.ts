import { test, expect } from '@playwright/test';

test.describe('Navigation Flows', () => {
  test('user can organically navigate from landing page to generator', async ({ page }) => {
    await page.goto('/');

    // Landing Page Should Present The "Generate Professional README Files" CTA Or "Generator"
    // The "Start Shipping" Button Or "Create New README"
    const generateBtn = page.getByText(/Create New README|Start Documenting/i).first();
    await generateBtn.click();

    // Should Route To /generator
    await expect(page).toHaveURL(/.*generator/);

    // Ensure Generator Loads Correctly
    await expect(page.getByText(/Generate Professional/i).first()).toBeVisible();
  });

  test('bottom nav works across primary routes', async ({ page }) => {
    // Optionally Only Test This On Mobile Viewports If We Configure Them, But We'll Test Presence
    await page.goto('/');

    // BottomNav Uses Icons, But We Can Query By Tooltip/Labels If We Created Them
    // Assuming Labels Like "Home", "Repo README", "Profile README"
    const repoReadmeBtn = page.getByText('Repo README').first();
    // In Our Component It Is Hidden md:block, So It's Visible On Desktop!
    
    // Playwright Desktop Should See It.
    await repoReadmeBtn.click();
    await expect(page).toHaveURL(/.*generator/);

    const healthBtn = page.getByText('Health').first();
    await healthBtn.click();
    await expect(page).toHaveURL(/.*health/);
  });
});
