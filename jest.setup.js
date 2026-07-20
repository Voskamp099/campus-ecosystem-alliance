// Jest 设置文件
import dotenv from "dotenv";
import { jest, afterAll } from "@jest/globals";

// 加载测试环境变量
dotenv.config({ path: ".env.test" });

// 设置测试环境
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret-key-for-jest";
process.env.ADMIN_USERNAME = "test-admin";
process.env.ADMIN_PASSWORD = "test-password";

// 增加测试超时时间
jest.setTimeout(10000);

// 全局清理
afterAll(async () => {
  // 清理资源（如数据库连接）
  if (global.__TEST_CLEANUP__) {
    await global.__TEST_CLEANUP__();
  }
});
