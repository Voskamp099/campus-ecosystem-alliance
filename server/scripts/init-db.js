/**
 * 数据库初始化 / 自愈
 * 在每次服务启动时执行：
 *   1. 运行 database/schema.sql（CREATE TABLE IF NOT EXISTS，幂等）建立规范表结构；
 *   2. 对核心表做列存在性自检，缺列则补齐（兼容旧库）。
 * 这样无论 docker 首次建库，还是已有旧表，运行中的 MySQL 都始终与代码一致。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "../db.js";
import { logger } from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCHEMA_PATH = path.resolve(__dirname, "../../database/schema.sql");

// 核心表需要保证存在的列（用于旧库自愈）
const REQUIRED_COLUMNS = {
  users: [
    ["avatar_url", "VARCHAR(1024) NOT NULL DEFAULT ''"],
    ["bio", "TEXT NULL"],
    ["email_verified", "BOOLEAN NOT NULL DEFAULT FALSE"],
    ["email_verified_at", "TIMESTAMP NULL"],
    ["verification_token", "VARCHAR(255) NOT NULL DEFAULT ''"],
    ["reset_token", "VARCHAR(255) NOT NULL DEFAULT ''"],
    ["reset_token_expires", "TIMESTAMP NULL"],
    ["last_login_at", "TIMESTAMP NULL"],
    ["login_count", "INT UNSIGNED NOT NULL DEFAULT 0"],
    ["is_admin", "BOOLEAN NOT NULL DEFAULT FALSE"],
    ["status", "ENUM('active','inactive','banned') NOT NULL DEFAULT 'active'"],
  ],
  user_events: [
    ["user_name", "VARCHAR(128) NOT NULL DEFAULT ''"],
    ["user_org", "VARCHAR(255) NOT NULL DEFAULT ''"],
    ["event_date", "VARCHAR(64) NOT NULL DEFAULT ''"],
    ["event_location", "VARCHAR(255) NOT NULL DEFAULT ''"],
    ["max_participants", "INT UNSIGNED NOT NULL DEFAULT 0"],
    ["reviewed_at", "TIMESTAMP NULL"],
  ],
  user_recruits: [
    ["user_name", "VARCHAR(128) NOT NULL DEFAULT ''"],
    ["user_org", "VARCHAR(255) NOT NULL DEFAULT ''"],
    ["opportunity_type", "VARCHAR(32) NOT NULL DEFAULT 'internship'"],
    ["reviewed_at", "TIMESTAMP NULL"],
  ],
  admin_logs: [
    ["admin_id", "BIGINT UNSIGNED NULL"],
    ["admin_name", "VARCHAR(128) NOT NULL DEFAULT ''"],
    ["action", "VARCHAR(64) NOT NULL DEFAULT ''"],
    ["target_type", "VARCHAR(64) NOT NULL DEFAULT ''"],
    ["target_id", "BIGINT UNSIGNED NULL"],
    ["detail", "TEXT NULL"],
    ["ip", "VARCHAR(64) NOT NULL DEFAULT ''"],
  ],
};

async function runSchemaSql() {
  const sql = fs.readFileSync(SCHEMA_PATH, "utf-8");
  // 先去掉行注释（-- 开头的行）和块注释，再按分号拆分
  // 注意：不能简单用 startsWith("--") 过滤整条语句，因为建表语句前会有注释行
  const cleanedSql = sql
    .replace(/\/\*[\s\S]*?\*\//g, "") // 移除块注释
    .split("\n")
    .filter((line) => !line.trim().startsWith("--")) // 移除行注释
    .join("\n");
  const statements = cleanedSql
    .split(/;\s*(?:\n|$)/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  for (const stmt of statements) {
    await pool.query(stmt);
  }
}

async function ensureColumns() {
  for (const [table, cols] of Object.entries(REQUIRED_COLUMNS)) {
    const [rows] = await pool.query(
      `SELECT COLUMN_NAME FROM information_schema.columns
       WHERE table_schema = DATABASE() AND table_name = ?`,
      [table]
    );
    const existing = new Set(rows.map((r) => r.COLUMN_NAME));
    for (const [col, definition] of cols) {
      if (!existing.has(col)) {
        await pool.query(`ALTER TABLE ${table} ADD COLUMN ${col} ${definition}`);
        logger.info({ table, column: col }, "已补齐缺失列");
      }
    }
  }
}

export async function initDatabase() {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await runSchemaSql();
    await ensureColumns();
    await conn.commit();
    logger.info("数据库初始化/自检完成");
  } catch (err) {
    await conn.rollback().catch(() => {});
    throw err;
  } finally {
    conn.release();
  }
}

// 直接执行（npm run init-db）
if (import.meta.url === `file://${process.argv[1]}`) {
  initDatabase()
    .then(() => {
      logger.info("数据库初始化脚本执行完成");
      process.exit(0);
    })
    .catch((err) => {
      logger.error({ err }, "数据库初始化脚本执行失败");
      process.exit(1);
    });
}
