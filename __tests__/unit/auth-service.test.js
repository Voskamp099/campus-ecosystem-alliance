import { describe, it, expect } from "@jest/globals";
import {
  hashPassword,
  verifyPassword,
  generateToken,
} from "../../server/services/auth-service.js";

describe("认证服务", () => {
  describe("密码处理", () => {
    it("应该成功哈希密码", async () => {
      const password = "TestPassword123!";
      const hashedPassword = await hashPassword(password);
      
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(0);
    });

    it("应该成功验证正确的密码", async () => {
      const password = "TestPassword123!";
      const hashedPassword = await hashPassword(password);
      const isValid = await verifyPassword(password, hashedPassword);
      
      expect(isValid).toBe(true);
    });

    it("应该拒绝错误的密码", async () => {
      const password = "TestPassword123!";
      const hashedPassword = await hashPassword(password);
      const isValid = await verifyPassword("WrongPassword", hashedPassword);
      
      expect(isValid).toBe(false);
    });
  });

  describe("Token 生成", () => {
    it("应该成功生成随机 token", () => {
      const token = generateToken();
      
      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.length).toBe(64); // 32 bytes = 64 hex chars
    });

    it("应该生成不同的 token", () => {
      const token1 = generateToken();
      const token2 = generateToken();
      
      expect(token1).not.toBe(token2);
    });
  });
});
