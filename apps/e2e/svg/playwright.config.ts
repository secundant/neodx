import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  globalSetup: 'playwright.setup.mjs',
  webServer: [
    {
      name: 'serve HTML',
      command: 'node static-server.cjs',
      port: 25000
    },
    {
      name: 'serve CORS sprites',
      command: 'node static-server.cjs',
      port: 25001,
      env: { PORT: '25001' }
    }
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
});
