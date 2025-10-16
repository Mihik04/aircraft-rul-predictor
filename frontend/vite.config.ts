import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  root: ".", // Ensures Vite serves index.html from /frontend
  server: {
    host: "127.0.0.1",
    port: 8080,
    fs: {
      allow: [
        // ✅ Add the frontend root itself
        path.resolve(__dirname, "."),
        path.resolve(__dirname, "./client"),
        path.resolve(__dirname, "./shared"),
      ],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
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
});
