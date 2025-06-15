import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
<<<<<<< HEAD
import comlink from "vite-plugin-comlink";
=======
import { componentTagger } from "lovable-tagger";
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
<<<<<<< HEAD
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
=======
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
<<<<<<< HEAD
  worker: {
    plugins: () => [comlink()],
  },
=======
>>>>>>> 86ac8cb2ed81b6df8a83b8c24ae4ef37e0735611
}));
