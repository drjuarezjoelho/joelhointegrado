import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiPort = env.PORT || "3000";
  const apiTarget = `http://127.0.0.1:${apiPort}`;

  return {
    /** Fora de node_modules — evita EBUSY no `npm ci` (Docker/Railway) ao apagar node_modules/.vite */
    cacheDir: path.resolve(__dirname, ".vite-cache"),
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
      /** Se 5173 estiver ocupado, o Vite tenta a seguinte (5174, …). */
      strictPort: false,
      proxy: {
        "/api": {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
