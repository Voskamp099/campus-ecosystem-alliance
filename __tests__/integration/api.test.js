import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { ValidationError, NotFoundError } from "../../server/utils/errors.js";
import { errorHandler } from "../../server/utils/errors.js";

describe("错误处理中间件", () => {
  it("应该正确处理 ValidationError", () => {
    const error = new ValidationError("数据验证失败");
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe("VALIDATION_ERROR");
    expect(error.message).toBe("数据验证失败");
  });

  it("应该正确处理 NotFoundError", () => {
    const error = new NotFoundError("资源不存在");
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe("NOT_FOUND");
    expect(error.message).toBe("资源不存在");
  });

  it("应该正确处理普通错误", () => {
    const error = new Error("普通错误");
    error.statusCode = 500;
    expect(error.statusCode).toBe(500);
    expect(error.message).toBe("普通错误");
  });
});
