import "dotenv/config";
import { buildApp } from "./app.js";
import { pool } from "./db/pool.js";

const app = buildApp();
const port = Number(process.env.PORT) || 3000;

const start = async () => {
  try {
    const [rows] = await pool.query("SELECT 1 AS ok");
    app.log.info({ rows }, "DB接続OK");
    await app.listen({ port, host: "0.0.0.0" });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
