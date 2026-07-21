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

// 增加测试超时时间
jest.setTimeout(10000);

// 全局清理：关闭所有打开的 handle（MySQL 连接池、pino transport 等）
afterAll(async () => {
  // 清理自定义资源
  if (global.__TEST_CLEANUP__) {
    await global.__TEST_CLEANUP__();
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
