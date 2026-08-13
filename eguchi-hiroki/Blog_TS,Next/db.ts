import mysql from 'mysql2';

function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`環境変数 ${key} が設定されていません`);
  }
  return value;
}

const connection = mysql.createConnection({
  host: getEnv('DB_HOST'),
  user: getEnv('DB_USER'),
  password: getEnv('DB_PASSWORD'),
  database: getEnv('DB_DATABASE'),
  port: Number(getEnv('DB_PORT')),
  charset: 'utf8mb4',
});

export default connection;
