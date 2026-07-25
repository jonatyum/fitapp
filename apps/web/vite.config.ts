import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// On GitHub Pages the app is served from https://<user>.github.io/<repo>/,
// so the build needs a matching base path. Set VITE_BASE="/<repo>/" in CI.
// Defaults to "/" for local dev and custom-domain deploys.
export default defineConfig({
  base: process.env.VITE_BASE ?? "/",
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
});
