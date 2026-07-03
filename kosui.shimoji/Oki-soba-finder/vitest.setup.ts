/// <reference types="node" />
// テスト実行時だけ使うダミーの環境変数
// pool.ts が起動時に required("DB_HOST") 等を読むため値が無い
process.env.DB_HOST ??= "localhost";
process.env.DB_PORT ??= "3306";
process.env.MYSQL_USER ??= "test";
process.env.MYSQL_PASSWORD ??= "test";
process.env.MYSQL_DATABASE ??= "test";
process.env.SESSION_SECRET ??= "test-session-secret-32-characters-x";
