import { describe, expect, it } from "vitest";
import { typeLabel } from "./storeLabel";

describe("typeLabel", () => {
  it("昼も夜も営業なら「両方」を返す", () => {
    // Arrange（入力）→ Act（実行）→ Assert（検証）
    const result = typeLabel(true, true);
    expect(result).toBe("両方");
  });

  it("昼だけ営業なら「昼」を返す", () => {
    expect(typeLabel(true, false)).toBe("昼");
  });

  it("夜だけ営業なら「夜」を返す", () => {
    expect(typeLabel(false, true)).toBe("夜");
  });

  it("どちらも営業しないなら「—」を返す", () => {
    expect(typeLabel(false, false)).toBe("—");
  });
});
