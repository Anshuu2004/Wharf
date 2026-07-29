/// <reference types="node" />
import { defineConfig, devices } from '@playwright/test';

/* See https://playwright.dev/docs/test-configuration. */
export default defineConfig({
  testDir: './tests/e2e',
  /* Maximum Time One Test Can Run For. */
  timeout: 30 * 1000,
  expect: {
    /* Maximum Time expect() Should Wait For The Condition To Be Met. */
    timeout: 5000,
  },
  /* Run Tests In Files In Parallel */
  fullyParallel: true,
  /* Fail The Build On CI If You Accidentally Left test.only In The Source Code. */
  forbidOnly: !!process.env.CI,
  /* Retry On CI Only */
  retries: process.env.CI ? 2 : 0,
  /* Opt Out Of Parallel Tests On CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter To Use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared Settings For All The Projects Below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL To Use In Actions Like `await page.goto('/')`. */
    baseURL: 'http://localhost:5173',

    /* Collect Trace When Retrying The Failed Test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Auto-Capture Screenshot On Failure */
    screenshot: 'only-on-failure',
  },

  /* Configure Projects For Major Browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // We can enable Firefox and WebKit later, keeping it lightweight for now.
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  /* Run Your Local Dev Server Before Starting The Tests */
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
