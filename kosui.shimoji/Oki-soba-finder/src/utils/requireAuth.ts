import type { FastifyRequest, FastifyReply } from "fastify";

export async function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  if (!request.session.user) {
    return reply.code(401).send({ message: "ログインが必要です" });
  }
}
