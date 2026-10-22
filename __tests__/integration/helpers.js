/**
 * 集成测试公共工具
 *
 * 后台的写操作都挂了 CSRF 防护: token 由 GET /api/csrf-token 下发,
 * 同时写进一个 cookie 并要求请求头带回同一个值, 两者不一致就返回 403.
 * 这里用 supertest 的 agent 持有 cookie, 模拟同一个浏览器会话.
 */

import request from "supertest";
import app from "../../server/index.js";

/** 开一个带 cookie 的会话, 并先握手拿 CSRF token */
export async function client() {
  const agent = request.agent(app);
  const res = await agent.get("/api/csrf-token");
  const token = res.body.csrfToken;
  const withCsrf = (req) => req.set("x-csrf-token", token);
  return {
    token,
    agent,
    post: (url) => withCsrf(agent.post(url)),
    put: (url) => withCsrf(agent.put(url)),
    del: (url) => withCsrf(agent.delete(url)),
    get: (url) => agent.get(url),
  };
}

/** 一个合法的注册请求体 */
export function validUser(overrides = {}) {
  return {
    email: "test.user@example.com",
    password: "Str0ngPass!2026",
    nickname: "ceshi",
    phone: "",
    realName: "",
    orgName: "",
    orgRole: "",
    ...overrides,
  };
}

/** 管理员登录凭据, 与 jest.setup.js 注入的一致 */
export const ADMIN = {
  username: process.env.ADMIN_USERNAME,
  password: process.env.ADMIN_PASSWORD,
};
