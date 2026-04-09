import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      /**
       * O plugin @tailwindcss/vite resolve @import "tailwindcss" a partir de src/;
       * no Windows isso pode falhar sem alias explícito (Can't resolve 'tailwindcss').
       */
      tailwindcss: path.resolve(__dirname, "node_modules/tailwindcss/index.css"),
    },
  },
  server: {
    port: 5173,
    /** Escuta em todas as interfaces; use http://127.0.0.1:<porta> se localhost falhar. */
    host: true,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
