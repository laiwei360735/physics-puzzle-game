import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './',
  testMatch: 'browser-test-2.spec.ts',
  timeout: 180000, // 3 分钟超时保护
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
