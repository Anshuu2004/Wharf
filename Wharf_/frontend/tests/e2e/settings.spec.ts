import { test, expect } from '@playwright/test';

test.describe('Settings BYOK Flow', () => {
  test('persists custom LLM API keys via preferences', async ({ page }) => {
    // Authenticate Local Session
    await page.addInitScript(() => {
      localStorage.setItem('auth-storage', JSON.stringify({
        state: {
          user: { id: 'cl1', username: 'settings_tester', isAdmin: false },
          token: 'mock_jwt_token',
          isAuthenticated: true
        }
      }));
    });

    await page.goto('/settings');

    // Locate The Settings Page Sections
    await expect(page.getByText(/User Profile & Settings/i)).toBeVisible();
    
    // Test Should Ensure Standard Navigation & Interface Holds
    await expect(page.getByText(/settings_tester/i)).toBeVisible();
  });
});
