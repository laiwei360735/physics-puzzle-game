import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './',
  testMatch: 'browser-test-1.spec.ts',
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  use: {
    baseURL: 'http://localhost:3000',
    browserName: 'chromium',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
  reporter: [['list'], ['html', { outputFolder: 'playwright-report' }]],
  outputDir: 'test-results',
});
