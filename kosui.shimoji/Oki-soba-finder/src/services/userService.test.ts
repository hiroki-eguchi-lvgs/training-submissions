import { describe, it, expect, vi, beforeEach } from "vitest";
import { changeUserRole } from "./userService.js";
import { updateUserRole } from "../repositories/userRepository.js";

// repository のmock
vi.mock("../repositories/userRepository.js");

describe("changeUserRole", () => {
  beforeEach(() => {
    vi.clearAllMocks(); // 各テスト前にmock記録をリセット
  });

  it("更新できた行が1件なら true を返す", async () => {
    // Arrange: mockがupdateUserRole が1を返す
    vi.mocked(updateUserRole).mockResolvedValue(1);

    // Act
    const result = await changeUserRole(3, "admin");

    // Assert
    expect(result).toBe(true);
  });

  it("更新できた行が0件なら false を返す", async () => {
    vi.mocked(updateUserRole).mockResolvedValue(0);

    const result = await changeUserRole(999, "admin");

    expect(result).toBe(false);
  });
});
