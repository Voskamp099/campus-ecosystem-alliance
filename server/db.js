import mysql from "mysql2/promise";
import { config } from "./config.js";
import { logger } from "./utils/logger.js";

export const pool = mysql.createPool({
  host: config.mysql.host,
  port: config.mysql.port,
  user: config.mysql.user,
  password: config.mysql.password,
  database: config.mysql.database,
  waitForConnections: true,
  connectionLimit: config.mysql.connectionLimit,
  namedPlaceholders: false
});

let _dbAvailable = null;

export async function isDatabaseAvailable() {
  if (_dbAvailable !== null) return _dbAvailable;
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    _dbAvailable = true;
    logger.info("MySQL 连接成功");
  } catch (e) {
    _dbAvailable = false;
    logger.warn({ err: e }, "MySQL 不可用，将使用内存存储降级模式");
  }
  return _dbAvailable;
}

// 清除可用性缓存，使下一次 isDatabaseAvailable() 重新探测
export function invalidateDbCache() {
  _dbAvailable = null;
}

// 每 60 秒重新检测 MySQL 可用性
const _healthCheckTimer = setInterval(() => { _dbAvailable = null; }, 60_000);
_healthCheckTimer.unref?.();

// 供测试 / 优雅关闭使用：关闭连接池并清除定时器
export async function closePool() {
  clearInterval(_healthCheckTimer);
  await pool.end();
}
