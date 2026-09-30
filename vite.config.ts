import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://tauri.app/v1/guides/getting-started/setup/vite
export default defineConfig(async () => ({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // Vite runs alongside the Tauri dev process, so let Tauri decide the port.
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      // Ignore the Rust and Python backend trees so file saves there don't
      // trigger a frontend reload.
      ignored: ["**/src-tauri/**", "**/backend/**"],
    },
  },
}));
