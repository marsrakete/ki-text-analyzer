import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  timeout: 60000,
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:49317",
    headless: true,
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "edge", use: { browserName: "chromium", channel: "msedge" } },
  ],
  webServer: {
    command: "node scripts/serve.js",
    url: "http://127.0.0.1:49317",
    reuseExistingServer: false,
  },
});
