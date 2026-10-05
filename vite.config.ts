import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["fonts/*.woff2", "audio/*.mp3", "narration/*.mp3", "icons/*.svg"],
      manifest: {
        name: "Mahirul Qur’an Kids",
        short_name: "Mahirul Qur’an",
        description: "Playful Qur’an memorisation practice for young children",
        theme_color: "#213d55",
        background_color: "#fff9e9",
        display: "standalone",
        orientation: "any",
        start_url: ".",
        icons: [
          { src: "icons/app-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
          { src: "icons/app-icon-maskable.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,woff2,mp3,json}"],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024
      }
    })
  ],
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    css: true,
    exclude: ["tests/e2e/**", "node_modules/**", "dist/**"]
  }
});
