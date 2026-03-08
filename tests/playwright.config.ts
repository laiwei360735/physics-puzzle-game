import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './',
  testMatch: '*.spec.ts',
  timeout: 600000, // 10 分钟超时保护（压力测试需要更长时间）
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
