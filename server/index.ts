import "dotenv/config";
import { createServer } from "node:http";
import { createApp } from "./createApp";

const app = createApp();
const port = Number(process.env.PORT ?? 3000);
const server = createServer(app);

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`tRPC at http://localhost:${port}/api/trpc`);
  console.log(`Google OAuth start: http://localhost:${port}/api/oauth/google`);
});
