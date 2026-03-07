# AGENTS.md

## Cursor Cloud specific instructions

### Overview

This is a medical patient registration app (C.I.J. - Centro Integrado de Joelho) built with React 18 + TypeScript (Vite) on the frontend and Express + tRPC 11 on the backend, using SQLite via better-sqlite3 and Drizzle ORM.

### Running the application

See `README.md` for standard commands (`npm run dev`, `npm run server`, etc.).

**Backend** (port 3000): `npm run server` — starts Express + tRPC. The SQLite database (`data/cij.db`) is auto-created and schema is applied on first request via `server/db/index.ts`.

**Frontend** (port 5173): `npm run dev` — starts Vite dev server with API proxy to `localhost:3000/api`.

Both servers must be running for the app to work.

### Non-obvious caveats

- **shadcn/ui components are not committed** — they must be generated via `npx shadcn@latest add <component> --yes --overwrite`. All ~40 components are required. After `npm install`, run the shadcn add command for all needed components (see the import list in `src/` files).
- **`@tailwindcss/vite` plugin is required** — Tailwind CSS v4 needs this Vite plugin (added to `vite.config.ts`) for styles to compile. Without it, the app renders unstyled.
- **`server/db/index.ts` uses ESM** — The project sets `"type": "module"` in `package.json`, so standard ESM imports are required (no `require()` or bare `__dirname`). The file uses `import.meta.url` for `__dirname` equivalent.
- **`wouter` version** — The original `package.json` specified `wouter@^2.14.0` which doesn't exist. The latest 2.x is `2.12.1`. The `useSearch` export is also unavailable in wouter v2; affected files use `location.split('?')[1]` instead.
- **`index.html` analytics script** — References `%VITE_ANALYTICS_ENDPOINT%` and `%VITE_ANALYTICS_WEBSITE_ID%` env vars. These are optional (Umami analytics). If not set, the script tag should be commented out to avoid `URI malformed` errors in Vite dev server.
- **TypeScript `tsc` build** — `npm run build` will report pre-existing TS errors (tRPC type inference, wouter API mismatches, implicit `any` types). Vite dev server works fine since esbuild doesn't enforce strict TS types.
- **No automated test suite** — The project has no test framework configured (no Jest, Vitest, etc.).
- **Database is file-based** — SQLite at `data/cij.db`. No external database services needed. The `data/` directory is auto-created by the server.
