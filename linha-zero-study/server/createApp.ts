import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { attachUser } from "./middleware/auth";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import { authRouter } from "./routes/auth";
import { participantsRouter } from "./routes/participants";
import { visitsRouter } from "./routes/visits";
import { exportRouter } from "./routes/export";

export function createApp(): express.Express {
  const app = express();

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN?.split(",") ?? true,
      credentials: true,
    })
  );
  app.use(cookieParser());
  app.use(express.json({ limit: "2mb" }));
  app.use(attachUser);

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "linha-zero-study", ts: new Date().toISOString() });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/participants", participantsRouter);
  app.use("/api", visitsRouter);
  app.use("/api/export", exportRouter);

  const serveStatic =
    process.env.NODE_ENV === "production" &&
    process.env.SERVE_STATIC !== "0";
  if (serveStatic) {
    const dist = path.join(__dirname, "../dist");
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

  app.use(
    (
      err: Error,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => {
      console.error(err);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  );

  return app;
}
