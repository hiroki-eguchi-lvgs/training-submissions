import type { FastifyRequest, FastifyReply } from "fastify";

export async function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  if (!request.session.user) {
    return reply.code(401).send({ message: "ログインが必要です" });
  }
}
export async function requireAdmin(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  if (request.session.user?.role !== "admin") {
    return reply.code(403).send({ message: "管理者権限が必要です" });
  }
}
