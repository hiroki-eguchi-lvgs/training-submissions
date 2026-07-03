import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // 各テストファイルの実行前に、この準備ファイルを走らせる
    setupFiles: ["./vitest.setup.ts"],
  },
});
