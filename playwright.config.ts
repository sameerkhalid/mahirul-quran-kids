import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: { baseURL: "http://127.0.0.1:4173", trace: "on-first-retry" },
  webServer: {
    command: "corepack pnpm build && corepack pnpm preview --host 127.0.0.1",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI
  },
  projects: [
    { name: "chromium-mobile", use: { ...devices["Pixel 7"], browserName: "chromium" } },
    { name: "chromium-tablet", use: { ...devices["iPad (gen 7)"], browserName: "chromium" } }
  ]
});
