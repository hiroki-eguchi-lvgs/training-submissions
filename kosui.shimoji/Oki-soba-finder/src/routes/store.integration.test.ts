import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { buildApp } from "../app.js";

const app = buildApp();

beforeAll(async () => {
  await app.ready(); // ルート登録の完了を待つ
});

afterAll(async () => {
  await app.close(); // 後始末
});

describe("POST /admin/stores（ガード）", () => {
  it("未ログインなら 401 を返す", async () => {
    const res = await request(app.server).post("/admin/stores").send({
      store_name: "テスト食堂",
      address: "東京都渋谷区1-1",
      serves_lunch: true,
      serves_dinner: false,
    });

    expect(res.status).toBe(401);
  });
});
