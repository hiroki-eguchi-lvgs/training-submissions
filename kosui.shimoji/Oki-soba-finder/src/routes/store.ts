import type { FastifyInstance } from "fastify";
import { listStores } from "../services/storeService.js";

export default async function storeRoutes(fastify: FastifyInstance) {
  fastify.get("/stores", async (request, reply) => {
    const stores = await listStores();
    return reply.code(200).send(stores);
  });
}
