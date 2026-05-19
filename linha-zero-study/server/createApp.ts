import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { attachUser } from "./middleware/auth";
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
