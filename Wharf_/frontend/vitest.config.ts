import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    // Explicitly exclude Playwright e2e specs — they use a different test runner
    exclude: ['**/node_modules/**', '**/dist/**', 'tests/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'json', 'html'],
      exclude: ['src/main.tsx', 'src/**/*.d.ts', '.eslintrc.cjs', 'playwright.config.ts', 'tests/e2e/**']
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
});
