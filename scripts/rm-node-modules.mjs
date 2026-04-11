/**
 * Remove node_modules antes de `npm ci` em CI (Linux) — evita EBUSY em
 * node_modules/.vite quando o builder reutiliza camadas em cache.
 * Usado por `npm run build:deploy` (Railway).
 */
import fs from "node:fs";

try {
  fs.rmSync("node_modules", { recursive: true, force: true });
} catch {
  // ignorar se não existir
}
