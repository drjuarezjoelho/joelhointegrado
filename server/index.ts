import { createServer } from "http";
import express from "express";
import cors from "cors";
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

const port = process.env.PORT ?? 3000;
const server = createServer(app);
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`tRPC at http://localhost:${port}/api/trpc`);
});
