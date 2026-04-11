/**
 * Limpa artefactos antes de `npm ci` em CI (Linux / Railway).
 *
 * Em overlayfs (Docker/Railway), `rm -rf node_modules` pode falhar com
 * "Device or resource busy" em `node_modules/.vite` — renomear para /tmp
 * liberta o caminho de trabalho; o `rm` do lixo faz-se sobre outro prefixo.
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

  const sh = `
set -eu
rm -rf .vite-cache 2>/dev/null || true
if [ ! -d node_modules ]; then
  exit 0
fi
# Permissões + caches internos (overlayfs)
chmod -R u+w node_modules 2>/dev/null || true
rm -rf node_modules/.vite node_modules/.cache 2>/dev/null || true
# Preferir mover para fora do overlay — liberta "node_modules" já
TRASH="/tmp/cadastro-ci-nm-$$"
mkdir -p /tmp
if mv node_modules "$TRASH" 2>/dev/null; then
  rm -rf "$TRASH" || true
else
  sleep 1
  rm -rf node_modules || { sleep 2; rm -rf node_modules; }
fi
`;

  try {
    execSync(sh, { stdio: "inherit", shell: "/bin/sh" });
  } catch {
    process.exit(1);
  }
}

main();
