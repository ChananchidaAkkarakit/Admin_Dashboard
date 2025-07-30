import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import path from "path"; // ✅ เพิ่ม path module

export default defineConfig({
  base: "/Admin_Dashboard",
  plugins: [react(), svgr()],
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "../shared-types"), // ✅ ชี้ไปยังโฟลเดอร์ shared-types
    },
  },
});
