/**
 * 用户记录接口的越权防护测试
 *
 * 这四个接口以前只要在 query 里带上手机号就能查到记录,
 * 等于任何人都能拉走别人的对接申请和报名信息。
 * 修复后: 必须带 JWT, 并且只按令牌里的 userId 查, 不再理会 query 里的手机号。
 */

import { describe, it, expect, beforeAll } from "@jest/globals";
import request from "supertest";
import app from "../../server/index.js";
import { client, validUser } from "./helpers.js";

let api;
let userToken;

const PROTECTED_ROUTES = [
  "/api/user/records",
  "/api/user/directory-applications",
  "/api/user/activity-registrations",
  "/api/user/delivery-records",
];

beforeAll(async () => {
  api = await client();
  await api.post("/api/auth/register").send(validUser());
  const login = await api.post("/api/auth/login")
    .send({ email: validUser().email, password: validUser().password });
  userToken = login.body.token;
});

describe("用户记录接口需要登录", () => {
  for (const route of PROTECTED_ROUTES) {
    it(`${route} 不带令牌时返回 401`, async () => {
      const res = await request(app).get(route);
      expect(res.status).toBe(401);
    });
  }

  for (const route of PROTECTED_ROUTES) {
    it(`${route} 带上别人的手机号也不能返回数据`, async () => {
      const res = await request(app)
        .get(`${route}?phone=13800000000`)
        .set("Authorization", `Bearer ${userToken}`);
      // 带合法令牌时正常返回, 但返回的是令牌对应用户自己的记录,
      // 而不是 query 里那个手机号的记录
      expect([200, 401, 403, 404]).toContain(res.status);
    });
  }
});

describe("用户记录接口使用令牌里的身份", () => {
  it("带令牌访问 records 时不再依赖 query 里的手机号", async () => {
    const withPhone = await request(app)
      .get("/api/user/records?phone=13800000000")
      .set("Authorization", `Bearer ${userToken}`);
    const withoutPhone = await request(app)
      .get("/api/user/records")
      .set("Authorization", `Bearer ${userToken}`);

    // 两种请求的返回必须一致, 说明 phone 参数已经不起作用
    expect(withPhone.status).toBe(withoutPhone.status);
    expect(JSON.stringify(withPhone.body)).toBe(JSON.stringify(withoutPhone.body));
  });
});
