import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import comlink from "vite-plugin-comlink";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    port: 3000,
    strictPort: false,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3008',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  plugins: [
    react(),
    comlink(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  worker: {
    plugins: () => [comlink()],
  },
}));
