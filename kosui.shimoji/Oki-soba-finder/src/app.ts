import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";
import cookie from "@fastify/cookie";
import session from "@fastify/session";
import healthRoute from "./routes/health.js";
import authRoutes from "./routes/auth.js";
import storeRoutes from "./routes/store.js";
import userRoutes from "./routes/user.js";
import { pool } from "./db/pool.js";
import { required } from "./utils/env.js";

export function buildApp() {
  const app = Fastify({ logger: true });
  const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
  app.register(userRoutes);
  app.register(fastifyStatic, {
    root: path.join(__dirname, "../public"),
  });

  return app;
}
