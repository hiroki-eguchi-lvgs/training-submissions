import type { FastifyInstance } from "fastify";
import {
  listStores,
  getStoreDetail,
  addStore,
  removeStore,
  editStore,
} from "../services/storeService.js";
import { requireAuth, requireAdmin } from "../utils/requireAuth.js";

export default async function storeRoutes(fastify: FastifyInstance) {
  fastify.get("/stores", async (request, reply) => {
    const stores = await listStores();
    return reply.code(200).send(stores);
  });

  fastify.get<{ Params: { id: string } }>(
    "/stores/:id",
    async (request, reply) => {
      const id = Number(request.params.id);
      if (Number.isNaN(id)) {
        return reply.code(400).send({ message: "idが不正です" });
      }
      const store = await getStoreDetail(id);
      if (!store) {
        return reply.code(404).send({ message: "店舗が見つかりません" });
      }
      return reply.code(200).send(store);
    },
  );

  fastify.post<{
    Body: {
      store_name: string;
      address: string;
      serves_lunch: boolean;
      serves_dinner: boolean;
    };
  }>(
    "/admin/stores",
    {
      preHandler: [requireAuth, requireAdmin],
      schema: {
        body: {
          type: "object",
          required: ["store_name", "address", "serves_lunch", "serves_dinner"],
          properties: {
            store_name: { type: "string", minLength: 1, maxLength: 100 },
            address: { type: "string", minLength: 1, maxLength: 255 },
            serves_lunch: { type: "boolean" },
            serves_dinner: { type: "boolean" },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const result = await addStore(request.body);
        return reply.code(201).send(result);
      } catch (err) {
        return reply.code(400).send({ message: (err as Error).message });
      }
    },
  );

  fastify.delete<{ Params: { id: string } }>(
    "/admin/stores/:id",
    {
      preHandler: [requireAuth, requireAdmin],
    },
    async (request, reply) => {
      const id = Number(request.params.id);
      if (Number.isNaN(id)) {
        return reply.code(400).send({ message: "idが不正です" });
      }
      const ok = await removeStore(id);
      if (!ok) {
        return reply.code(404).send({ message: "店舗が見つかりません" });
      }
      return reply.code(200).send({ message: "削除しました" });
    },
  );

  fastify.put<{
    Params: { id: string };
    Body: {
      store_name: string;
      address: string;
      serves_lunch: boolean;
      serves_dinner: boolean;
    };
  }>(
    "/admin/stores/:id",
    {
      preHandler: [requireAuth, requireAdmin],
      schema: {
        body: {
          type: "object",
          required: ["store_name", "address", "serves_lunch", "serves_dinner"],
          properties: {
            store_name: { type: "string", minLength: 1, maxLength: 100 },
            address: { type: "string", minLength: 1, maxLength: 255 },
            serves_lunch: { type: "boolean" },
            serves_dinner: { type: "boolean" },
          },
        },
      },
    },
    async (request, reply) => {
      const id = Number(request.params.id);
      if (Number.isNaN(id)) {
        return reply.code(400).send({ message: "idが不正です" });
      }
      try {
        const ok = await editStore(id, request.body);
        if (!ok) {
          return reply.code(404).send({ message: "店舗が見つかりません" });
        }
        return reply.code(200).send({ message: "更新しました" });
      } catch (err) {
        return reply.code(400).send({ message: (err as Error).message });
      }
    },
  );
}
