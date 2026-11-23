import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end smoke tests.
 *
 * Defaults to the production deployment so they can run without a local server;
 * set PLAYWRIGHT_BASE_URL to point at a preview or localhost.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL:
      process.env.PLAYWRIGHT_BASE_URL ||
      "https://urban-air-quality-assistant-xi.vercel.app",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
