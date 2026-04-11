/**
 * Limpa artefactos antes de `npm ci` em CI (Linux).
 * - `fs.rmSync` pode falhar com EBUSY em `node_modules/.cache` / `.vite`;
 *   em Unix usamos `rm -rf`, mais fiável no Docker/Railway.
 * Não engolir erros: falhas aqui devem aparecer no log do deploy.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";

const extra = [".vite-cache"];

function main() {
  if (process.platform === "win32") {
    try {
      fs.rmSync("node_modules", { recursive: true, force: true });
      for (const d of extra) {
        try {
          fs.rmSync(d, { recursive: true, force: true });
        } catch {
          /* ok */
        }
      }
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
    return;
  }

  try {
    execSync("rm -rf node_modules .vite-cache", { stdio: "inherit" });
  } catch {
    process.exit(1);
  }
}

main();
