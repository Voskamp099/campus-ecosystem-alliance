import { describe, it, expect, beforeEach } from "@jest/globals";
import {
  sanitizeInput,
  sanitizeObject,
} from "../../server/utils/validator.js";
import {
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  DatabaseError,
} from "../../server/utils/errors.js";

describe("错误类", () => {
  describe("ValidationError", () => {
    it("应该创建验证错误", () => {
      const error = new ValidationError("数据验证失败");
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe("VALIDATION_ERROR");
      expect(error.isOperational).toBe(true);
    });
  });

  describe("UnauthorizedError", () => {
    it("应该创建未授权错误", () => {
      const error = new UnauthorizedError("未授权访问");
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe("UNAUTHORIZED");
    });
  });

  describe("ForbiddenError", () => {
    it("应该创建禁止访问错误", () => {
      const error = new ForbiddenError("禁止访问");
      expect(error.statusCode).toBe(403);
      expect(error.code).toBe("FORBIDDEN");
    });
  });

  describe("NotFoundError", () => {
    it("应该创建资源不存在错误", () => {
      const error = new NotFoundError("资源不存在");
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe("NOT_FOUND");
    });
  });

  describe("ConflictError", () => {
    it("应该创建资源冲突错误", () => {
      const error = new ConflictError("资源冲突");
      expect(error.statusCode).toBe(409);
      expect(error.code).toBe("CONFLICT");
    });
  });

  describe("DatabaseError", () => {
    it("应该创建数据库错误", () => {
      const error = new DatabaseError("数据库操作失败");
      expect(error.statusCode).toBe(503);
      expect(error.code).toBe("DATABASE_ERROR");
    });
  });
});

describe("XSS 过滤", () => {
  describe("sanitizeInput", () => {
    it("应该过滤 script 标签", () => {
      const input = '<script>alert("XSS")</script>Hello';
      const result = sanitizeInput(input);
      expect(result).toBe("Hello");
    });

    it("应该保留安全的 HTML 标签", () => {
      const input = "<b>Bold</b> and <i>italic</i>";
      const result = sanitizeInput(input);
      expect(result).toBe("<b>Bold</b> and <i>italic</i>");
    });

    it("应该过滤危险属性", () => {
      const input = '<a href="javascript:alert(1)">Link</a>';
      const result = sanitizeInput(input);
      expect(result).toBe('<a href>Link</a>');
    });

    it("应该处理非字符串输入", () => {
      expect(sanitizeInput(null)).toBe(null);
      expect(sanitizeInput(undefined)).toBe(undefined);
      expect(sanitizeInput(123)).toBe(123);
    });
  });

  describe("sanitizeObject", () => {
    it("应该递归过滤对象", () => {
      const input = {
        name: '<script>alert(1)</script>John',
        email: "test@example.com",
        nested: {
          value: '<script>alert(2)</script>Safe',
        },
      };
      const result = sanitizeObject(input);
      expect(result.name).toBe("John");
      expect(result.email).toBe("test@example.com");
      expect(result.nested.value).toBe("Safe");
    });

    it("应该处理数组", () => {
      const input = [
        '<script>alert(1)</script>Item1',
        '<script>alert(2)</script>Item2',
      ];
      const result = sanitizeObject(input);
      expect(result[0]).toBe("Item1");
      expect(result[1]).toBe("Item2");
    });
  });
});
