import type { FastifyInstance } from "fastify";
import { register, login } from "../services/authService.js";
import { requireAuth } from "../utils/requireAuth.js";

type RegisterBody = {
  login_id: string;
  password: string;
  user_name: string;
};
type LoginBody = {
  login_id: string;
  password: string;
};

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: RegisterBody }>(
    "/register",
    {
      // body のバリデーション（ログインID・パスワード・ユーザー名のルールを定義）
      schema: {
        body: {
          type: "object",
          required: ["login_id", "password", "user_name"],
          properties: {
            login_id: { type: "string", minLength: 1, maxLength: 255 },
            password: { type: "string", minLength: 8 },
            user_name: { type: "string", minLength: 1, maxLength: 50 },
          },
        },
      },
    },
    // RequestHandler で register() を呼び出してユーザー登録
    async (request, reply) => {
      const { login_id, password, user_name } = request.body;
      try {
        await register(login_id, password, user_name);
        return reply.code(201).send({ message: "登録しました" });
      } catch (err) {
        return reply.code(409).send({ message: (err as Error).message });
      }
    },
  );

  fastify.post<{ Body: LoginBody }>(
    "/login",
    {
      schema: {
        body: {
          type: "object",
          required: ["login_id", "password"],
          properties: {
            login_id: { type: "string", minLength: 1 },
            password: { type: "string", minLength: 1 },
          },
        },
      },
    },
    async (request, reply) => {
      const { login_id, password } = request.body;
      try {
        const user = await login(login_id, password);
        request.session.user = { id: user.id, role: user.role };
        return reply.code(200).send({ message: "ログインしました" });
      } catch (err) {
        return reply.code(401).send({ message: (err as Error).message });
      }
    },
  );
  fastify.post("/logout", async (request, reply) => {
    await request.session.destroy();
    return reply.code(200).send({ message: "ログアウトしました" });
  });

  fastify.get("/me", { preHandler: requireAuth }, async (request, reply) => {
    return reply.code(200).send({ user: request.session.user });
  });
}
