// vite.config.ts
import { defineConfig } from "file:///C:/Users/acer/Downloads/nexus-skeleton/nexus/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/acer/Downloads/nexus-skeleton/nexus/node_modules/@vitejs/plugin-react/dist/index.js";
import tailwindcss from "file:///C:/Users/acer/Downloads/nexus-skeleton/nexus/node_modules/@tailwindcss/vite/dist/index.mjs";
import path from "path";
var __vite_injected_original_dirname = "C:\\Users\\acer\\Downloads\\nexus-skeleton\\nexus";
var vite_config_default = defineConfig(async () => ({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  // Vite runs alongside the Tauri dev process, so let Tauri decide the port.
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      // Ignore the Rust and Python backend trees so file saves there don't
      // trigger a frontend reload.
      ignored: ["**/src-tauri/**", "**/backend/**"]
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxhY2VyXFxcXERvd25sb2Fkc1xcXFxuZXh1cy1za2VsZXRvblxcXFxuZXh1c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcYWNlclxcXFxEb3dubG9hZHNcXFxcbmV4dXMtc2tlbGV0b25cXFxcbmV4dXNcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL2FjZXIvRG93bmxvYWRzL25leHVzLXNrZWxldG9uL25leHVzL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjtcbmltcG9ydCB0YWlsd2luZGNzcyBmcm9tIFwiQHRhaWx3aW5kY3NzL3ZpdGVcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5cbi8vIGh0dHBzOi8vdGF1cmkuYXBwL3YxL2d1aWRlcy9nZXR0aW5nLXN0YXJ0ZWQvc2V0dXAvdml0ZVxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKGFzeW5jICgpID0+ICh7XG4gIHBsdWdpbnM6IFtyZWFjdCgpLCB0YWlsd2luZGNzcygpXSxcblxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxuICAgIH0sXG4gIH0sXG5cbiAgLy8gVml0ZSBydW5zIGFsb25nc2lkZSB0aGUgVGF1cmkgZGV2IHByb2Nlc3MsIHNvIGxldCBUYXVyaSBkZWNpZGUgdGhlIHBvcnQuXG4gIGNsZWFyU2NyZWVuOiBmYWxzZSxcbiAgc2VydmVyOiB7XG4gICAgcG9ydDogMTQyMCxcbiAgICBzdHJpY3RQb3J0OiB0cnVlLFxuICAgIHdhdGNoOiB7XG4gICAgICAvLyBJZ25vcmUgdGhlIFJ1c3QgYW5kIFB5dGhvbiBiYWNrZW5kIHRyZWVzIHNvIGZpbGUgc2F2ZXMgdGhlcmUgZG9uJ3RcbiAgICAgIC8vIHRyaWdnZXIgYSBmcm9udGVuZCByZWxvYWQuXG4gICAgICBpZ25vcmVkOiBbXCIqKi9zcmMtdGF1cmkvKipcIiwgXCIqKi9iYWNrZW5kLyoqXCJdLFxuICAgIH0sXG4gIH0sXG59KSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQWtVLFNBQVMsb0JBQW9CO0FBQy9WLE9BQU8sV0FBVztBQUNsQixPQUFPLGlCQUFpQjtBQUN4QixPQUFPLFVBQVU7QUFIakIsSUFBTSxtQ0FBbUM7QUFNekMsSUFBTyxzQkFBUSxhQUFhLGFBQWE7QUFBQSxFQUN2QyxTQUFTLENBQUMsTUFBTSxHQUFHLFlBQVksQ0FBQztBQUFBLEVBRWhDLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFBQTtBQUFBLEVBR0EsYUFBYTtBQUFBLEVBQ2IsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sWUFBWTtBQUFBLElBQ1osT0FBTztBQUFBO0FBQUE7QUFBQSxNQUdMLFNBQVMsQ0FBQyxtQkFBbUIsZUFBZTtBQUFBLElBQzlDO0FBQUEsRUFDRjtBQUNGLEVBQUU7IiwKICAibmFtZXMiOiBbXQp9Cg==
