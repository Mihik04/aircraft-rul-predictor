import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  root: ".", // Ensures index.html served correctly
  server: {
    host: "127.0.0.1",
    port: 4173, // ✅ Default Vite dev port
  },
  build: {
    outDir: "dist",
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  define: {
    // ✅ Ensure environment variables are accessible
    "process.env": process.env,
  },
});
