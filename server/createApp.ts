import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./routers";
import { createContext } from "./trpc";
import { mountGoogleOAuthRoutes } from "./auth/google-routes";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp(): express.Express {
  const app = express();

  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );
  app.use(cookieParser());
  app.use(express.json());

  mountGoogleOAuthRoutes(app);

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  const serveStatic =
    process.env.NODE_ENV === "production" && process.env.SERVE_STATIC !== "0";
  if (serveStatic) {
    const dist = path.join(process.cwd(), "dist");
    if (existsSync(dist)) {
      const indexHtml = path.join(dist, "index.html");
      app.use(express.static(dist));
      app.use((req, res, next) => {
        if (req.method !== "GET" && req.method !== "HEAD") {
          next();
          return;
        }
        if (req.path.startsWith("/api")) {
          next();
          return;
        }
        res.sendFile(indexHtml, (err) => {
          if (err) next(err);
        });
      });
    }
  }

  return app;
}
