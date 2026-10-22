// Jest 设置文件
import dotenv from "dotenv";
import { jest, afterAll } from "@jest/globals";

// 加载测试环境变量
dotenv.config({ path: ".env.test" });

// 设置测试环境（必须在 config.js 被 import 之前设置，dotenv.config 不会覆盖已存在的值）
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret-key-for-jest";
process.env.ADMIN_USERNAME = "test-admin";
process.env.ADMIN_PASSWORD = "test-password";
process.env.MYSQL_HOST = "127.0.0.1";
process.env.MYSQL_PORT = "3306";
process.env.MYSQL_USER = "root";
process.env.MYSQL_PASSWORD = "";
process.env.MYSQL_DATABASE = "alliance_website_test";

// JSON 降级存储指向临时目录：MySQL 不可用时服务会退到 data/ 下的 JSON 文件，
// 不隔离的话跑一次测试就会往真实业务数据里写测试用户。
// 目录名带上进程号，每次跑测试都是全新的一份，用例之间互不干扰。
import fs from "node:fs";

const TEST_DATA_DIR = `/tmp/alliance-website-test-${process.pid}`;
fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true });
process.env.DATA_DIR = TEST_DATA_DIR;

// 增加测试超时时间
jest.setTimeout(10000);

// 全局清理：关闭所有打开的 handle（MySQL 连接池、pino transport 等）
afterAll(async () => {
  // 清理自定义资源
  if (global.__TEST_CLEANUP__) {
    await global.__TEST_CLEANUP__();
  }

  // 删除本次测试的临时数据目录
  try {
    fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true });
  } catch (e) {
    // 目录不存在时忽略
  }

  // 关闭 MySQL 连接池 + 清除 setInterval（db.js 模块加载时即创建）
  try {
    const { closePool } = await import("./server/db.js");
    if (typeof closePool === "function") {
      await closePool();
    }
  } catch (e) {
    // db.js 未被任何测试导入则跳过
  }

  // 关闭 pino transport（pino-pretty 在 dev 模式下会启动 worker thread）
  try {
    const { logger } = await import("./server/utils/logger.js");
    if (logger && typeof logger.flush === "function") {
      await new Promise((resolve) => {
        logger.flush(resolve);
        setTimeout(resolve, 500);
      });
    }
  } catch (e) {
    // logger 未被导入则跳过
  }
});
