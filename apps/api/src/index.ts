import "dotenv/config";
import { buildServer } from "./server.js";

const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST ?? "0.0.0.0";

async function main() {
  const app = await buildServer();
  await app.listen({ port, host });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
