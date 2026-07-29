import { test, expect } from '@playwright/test';

test.describe('Generator Flow', () => {
  test('successfully generates a mocked AI README sequence', async ({ page }) => {
    await page.goto('/generator');

    // Input The GitHub Repo URL
    const repoInput = page.getByPlaceholder('https://github.com/username/repo');
    await expect(repoInput).toBeVisible();

    await repoInput.fill('https://github.com/octocat/Hello-World');

    // Click "Generate README"
    const generateBtn = page.getByRole('button', { name: /Generate README/i });
    await generateBtn.click();

    // The UI Should Show Analyzing State...
    await expect(page.getByText(/Analyzing Repository/i)).toBeVisible();

    // Since We Are Running The Actual Dev Server, It Will Hit Our MSW Interceptors If They Are Setup In Dev, 
    // OR It Will Hit Our Actual Backend! 
    // To Ensure Testing Doesn't Break, Let's Mock The Network Route Strictly In Playwright:
    
    await page.route('**/api/generate/readme', async route => {
      const json = {
        success: true,
        data: {
          documentation: "# Hello World\nWelcome to my mocked MSW e2e generated doc!",
          metadata: { repoLanguage: "TypeScript", structureAnalyzed: true }
        }
      };
      await route.fulfill({ json });
    });

    // Wait For The Markdown Preview To Populate
    await expect(page.locator('.markdown-body')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Welcome to my mocked MSW e2e generated doc!')).toBeVisible();
  });
});
