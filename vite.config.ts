import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Base path matches the GitHub Pages project-site URL:
// https://bruinesq.github.io/hydration-tracker/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/hydration-tracker/",
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
