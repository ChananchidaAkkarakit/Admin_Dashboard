import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import path from "path";

export default defineConfig({
  base: "/Admin_Dashboard",
  plugins: [react(), svgr()],
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "../shared-types"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/api"),
      },
    },
  },
});
