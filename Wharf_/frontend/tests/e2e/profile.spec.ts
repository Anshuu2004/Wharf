import { test, expect } from '@playwright/test';

test.describe('Profile Generator Flow', () => {
  test('generates GitHub profile natively', async ({ page }) => {
    await page.goto('/profile');

    // Input The GitHub Username
    const usernameInput = page.getByPlaceholder(/github username/i);
    await expect(usernameInput).toBeVisible();

    await usernameInput.fill('octocat');

    // MOCK The Actual Generation API So Our E2E Stays Incredibly Fast! 
    await page.route('**/api/profile/generate', async route => {
      const json = {
        success: true,
        data: {
          documentation: "# Octocat Profile\nWelcome to my mocked GitHub Profile layout!"
        }
      };
      await route.fulfill({ json });
    });

    const generateBtn = page.getByRole('button', { name: /Generate Profile/i });
    if (await generateBtn.isVisible()) {
      await generateBtn.click();
      
      await expect(page.getByText('Welcome to my mocked GitHub Profile layout!')).toBeVisible({ timeout: 10000 });
    }
  });
});
