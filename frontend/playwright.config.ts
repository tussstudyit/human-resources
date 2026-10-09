import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3100',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'node e2e/mock-backend.mjs',
      url: 'http://localhost:4010/recruitment/jobs',
      reuseExistingServer: !process.env.CI,
      timeout: 15000,
    },
    {
      command:
        'rm -rf .next && NEXT_PUBLIC_API_URL=http://localhost:4010 API_INTERNAL_URL=http://localhost:4010 npm run build && NEXT_PUBLIC_API_URL=http://localhost:4010 API_INTERNAL_URL=http://localhost:4010 PORT=3100 npm run start -- -p 3100',
      url: 'http://localhost:3100/careers',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
  ],
});
