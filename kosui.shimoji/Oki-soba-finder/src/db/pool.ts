import mysql from "mysql2/promise";
import { required } from "../utils/env.js";

export const pool = mysql.createPool({
  host: required("DB_HOST"),
  port: Number(required("DB_PORT")),
  user: required("MYSQL_USER"),
  password: required("MYSQL_PASSWORD"),
  database: required("MYSQL_DATABASE"),
  waitForConnections: true,
  connectionLimit: 10,
});
