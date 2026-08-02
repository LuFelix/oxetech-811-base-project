import { defineConfig, devices } from "@playwright/test";
import fs from "fs";

const isAlpine = process.platform === "linux" && fs.existsSync("/usr/bin/chromium-browser");
const executablePath = isAlpine ? "/usr/bin/chromium-browser" : undefined;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:5173",
    trace: "on",
    video: "on",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { 
        ...devices["Desktop Chrome"],
        launchOptions: {
          slowMo: 1200,
          executablePath,
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        },
      },
    },
  ],
});
