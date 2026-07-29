import { test, expect } from '@playwright/test';

test.describe('Authentication Flows', () => {
  test('unauthenticated user sees landing page and sign-in button', async ({ page }) => {
    // Navigate To Homepage
    await page.goto('/');

    // Expect Branding
    await expect(page.getByText('Ship Code That Speaks')).toBeVisible();

    // Expect Sign In Button In Header (Desktop)
    const signInButton = page.locator('header').getByText('Sign In').first();
    await expect(signInButton).toBeVisible();
  });

  test('authenticated user sees dashboard and profile button', async ({ page }) => {
    // We Can Simulate An Authenticated Session Without Actually Hitting A Backend By 
    // Injecting A Mock Token/User Into The Local Storage Before Load, Matching Wharf's Auth Hooks.
    await page.addInitScript(() => {
      // Mock Standard Zustand Store For UseAuthStore
      localStorage.setItem('auth-storage', JSON.stringify({
        state: {
          user: { id: 'cl1', username: 'e2e_hero', isAdmin: false },
          token: 'mock_jwt_token',
          isAuthenticated: true
        }
      }));
    });

    await page.goto('/');

    // Sign In Button Should Be Absent
    await expect(page.locator('header').getByText('Sign In')).toHaveCount(0);

    // Profile Badge Should Display The User's Name
    await expect(page.locator('header').getByText('e2e_hero')).toBeVisible();
  });
});
