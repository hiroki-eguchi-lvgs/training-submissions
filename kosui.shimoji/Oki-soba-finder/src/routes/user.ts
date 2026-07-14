import type { FastifyInstance } from "fastify";
import { changeUserRole, listUsers } from "../services/userService.js";
import { requireAuth, requireAdmin } from "../utils/requireAuth.js";

export default async function userRoutes(fastify: FastifyInstance) {
  fastify.patch<{
    Params: { id: string };
    Body: { role: string };
  }>(
    "/admin/users/:id/role",
    {
      preHandler: [requireAuth, requireAdmin],
      schema: {
        body: {
          type: "object",
          required: ["role"],
          properties: {
            role: { type: "string", enum: ["user", "admin"] },
          },
        },
      },
    },
    async (request, reply) => {
      const id = Number(request.params.id);
      if (Number.isNaN(id)) {
        return reply.code(400).send({ message: "idが不正です" });
      }
      const ok = await changeUserRole(id, request.body.role);
      if (!ok) {
        return reply.code(404).send({ message: "ユーザーが見つかりません" });
      }
      return reply.code(200).send({ message: "ユーザーの権限を変更しました" });
    },
  );

  fastify.get(
    "/admin/users",
    { preHandler: [requireAuth, requireAdmin] },
    async (request, reply) => {
      const users = await listUsers();
      return reply.code(200).send(users);
    },
  );
}
