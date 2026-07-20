import { describe, it, expect } from "@jest/globals";

describe("配置管理", () => {
  it("应该加载默认配置", async () => {
    const { config } = await import("../../server/config.js");
    
    expect(config).toBeDefined();
    expect(config.port).toBeDefined();
    expect(config.jwtSecret).toBeDefined();
    expect(config.mysql).toBeDefined();
  });

  it("应该有正确的默认值", async () => {
    const { config } = await import("../../server/config.js");
    
    expect(config.port).toBe(3000);
    expect(config.env).toBe("test");
    expect(config.isProduction).toBe(false);
    expect(config.mysql.host).toBe("127.0.0.1");
    expect(config.mysql.port).toBe(3306);
  });

  it("应该有日志配置", async () => {
    const { config } = await import("../../server/config.js");
    
    expect(config.logLevel).toBeDefined();
  });

  it("应该有安全配置", async () => {
    const { config } = await import("../../server/config.js");
    
    expect(config.rateLimit).toBeDefined();
    expect(config.rateLimit.windowMs).toBeGreaterThan(0);
    expect(config.rateLimit.max).toBeGreaterThan(0);
  });
});
