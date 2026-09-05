import os from 'node:os';
import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';

// Report/trace artifacts are written outside the repo (os.tmpdir()) rather
// than into playwright-report/ or test-results/ inside the project — `npm
// run dev` uses webpack's file watcher, which watches the whole project
// tree and triggers a Fast Refresh full reload every time Playwright writes
// a screenshot/trace mid-test, resetting client state (selected file, etc.)
// right as the test tries to interact with it.
const artifactsDir = path.join(os.tmpdir(), 'pits-frontend-e2e');

// Separate from vitest.config.ts (unit/storybook projects) — E2E drives a
// real browser against the already-running dev server + backend stack,
// it does not spin up a component test harness. See _docs/qa/uat-test-plan.md.
export default defineConfig({
  testDir: './tests/e2e',
  outputDir: path.join(artifactsDir, 'test-results'),
  fullyParallel: false,
  retries: 0,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: path.join(artifactsDir, 'playwright-report') }],
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3080',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
