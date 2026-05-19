import "dotenv/config";
import { createApp } from "./createApp";

const port = Number(process.env.PORT ?? 3001);
const app = createApp();

app.listen(port, () => {
  console.log(`Linha Zero Study API → http://localhost:${port}`);
  console.log(`  Health: GET /api/health`);
  console.log(`  Auth:   POST /api/auth/login`);
});
