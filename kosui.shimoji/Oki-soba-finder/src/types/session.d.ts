import "@fastify/session";

declare module "fastify" {
  interface Session {
    user?: {
      id: number;
      role: string;
    };
  }
}
