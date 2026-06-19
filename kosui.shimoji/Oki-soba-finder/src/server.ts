import Fastify from "fastify";
import "dotenv/config";
import cookie from "@fastify/cookie";
import session from "@fastify/session";
import healthRoute from "./routes/health.js";
import authRoutes from "./routes/auth.js";
import storeRoutes from "./routes/store.js";
import { pool } from "./db/pool.js";
import { required } from "./utils/env.js";

const app = Fastify({ logger: true });
const port = Number(process.env.PORT) || 3000;

app.register(cookie);
app.register(session, {
  secret: required("SESSION_SECRET"),
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24,
  },
});

app.register(authRoutes);
app.register(healthRoute);
app.register(storeRoutes);

const start = async () => {
  try {
    const [rows] = await pool.query("SELECT 1 AS ok");
    app.log.info({ rows }, "DB接続OK");
    await app.listen({ port });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
