import { createServer } from "http";
import express from "express";
import cors from "cors";
import { existsSync } from "fs";
import { join } from "path";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./routers";
import { createContext } from "./trpc";

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

const distPath = join(process.cwd(), "dist");
if (existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (_req, res) => {
    res.sendFile(join(distPath, "index.html"));
  });
}

const port = process.env.PORT ?? 3000;
const server = createServer(app);
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`tRPC at http://localhost:${port}/api/trpc`);
});
