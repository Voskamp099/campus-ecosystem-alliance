/**
 * 认证流程集成测试
 *
 * 覆盖注册、登录、令牌校验、改密码这一整条链路，
 * 重点验证「没登录的人拿不到受保护的数据」这条安全底线。
 */

import { describe, it, expect, beforeAll } from "@jest/globals";
import request from "supertest";
import app from "../../server/index.js";
import { client, validUser } from "./helpers.js";

let api;

beforeAll(async () => {
  api = await client();
});

describe("注册", () => {
  it("接受合法注册并返回令牌", async () => {
    const res = await api.post("/api/auth/register").send(validUser());
    // 现状返回 200。按 REST 惯例新建资源应为 201，这里如实记录当前行为
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.email).toBe(validUser().email);
  });

  it("拒绝缺少必填字段的注册", async () => {
    const res = await api.post("/api/auth/register").send({ email: "bad" });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("拒绝格式不合法的邮箱", async () => {
    const res = await api.post("/api/auth/register")
      .send(validUser({ email: "not-an-email" }));
    expect(res.status).toBe(400);
  });

  it("拒绝过短的密码", async () => {
    const res = await api.post("/api/auth/register")
      .send(validUser({ password: "123" }));
    expect(res.status).toBe(400);
  });

  it("拒绝重复注册同一个邮箱", async () => {
    const res = await api.post("/api/auth/register").send(validUser());
    // 现状返回 400。更准确的状态码是 409 Conflict
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe("登录", () => {
  it("正确的邮箱和密码可以登录并拿到令牌", async () => {
    const res = await api.post("/api/auth/login")
      .send({ email: validUser().email, password: validUser().password });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeTruthy();
  });

  it("密码错误时拒绝登录", async () => {
    const res = await api.post("/api/auth/login")
      .send({ email: validUser().email, password: "WrongPassword!1" });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("不存在的邮箱不泄露账号是否存在", async () => {
    const res = await api.post("/api/auth/login")
      .send({ email: "nobody@example.com", password: "Str0ngPass!2026" });
    expect(res.status).toBe(401);
  });
});

describe("令牌保护", () => {
  it("不带令牌访问 /api/auth/me 返回 401", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("带一个伪造的令牌同样返回 401", async () => {
    const res = await request(app).get("/api/auth/me")
      .set("Authorization", "Bearer forged.token.value");
    expect(res.status).toBe(401);
  });

  it("带合法令牌可以取回自己的资料", async () => {
    const login = await api.post("/api/auth/login")
      .send({ email: validUser().email, password: validUser().password });
    const res = await request(app).get("/api/auth/me")
      .set("Authorization", `Bearer ${login.body.token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(validUser().email);
  });
});

describe("修改密码", () => {
  it("旧密码不对时不允许改密码", async () => {
    const login = await api.post("/api/auth/login")
      .send({ email: validUser().email, password: validUser().password });
    const res = await api.put("/api/auth/change-password")
      .set("Authorization", `Bearer ${login.body.token}`)
      .send({ oldPassword: "TotallyWrong!9", newPassword: "N3wPassw0rd!26" });
    // 现状返回 400。更准确的状态码是 401 Unauthorized
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/密码错误/);
  });

  it("旧密码正确时可以用新密码登录", async () => {
    const newPassword = "N3wPassw0rd!26";
    const login = await api.post("/api/auth/login")
      .send({ email: validUser().email, password: validUser().password });
    const change = await api.put("/api/auth/change-password")
      .set("Authorization", `Bearer ${login.body.token}`)
      .send({ oldPassword: validUser().password, newPassword });
    expect(change.status).toBe(200);

    const relogin = await api.post("/api/auth/login")
      .send({ email: validUser().email, password: newPassword });
    expect(relogin.status).toBe(200);

    // 改回原密码，避免影响后续用例
    const back = await api.put("/api/auth/change-password")
      .set("Authorization", `Bearer ${relogin.body.token}`)
      .send({ oldPassword: newPassword, newPassword: validUser().password });
    expect(back.status).toBe(200);
  });
});
