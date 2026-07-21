# alliance-website 项目记忆

## 项目概况
- 北京校园生态合作联盟官网，Node.js + Express + MySQL (JSON降级) + Vanilla JS 前端
- v1.11.0, ESM 模式

## 核心架构
- 前台: index.html, categories.html, directory.html, my.html, publish.html 等
- 后台: admin.html (6 tab: hero/categories/hub/directory/applications/partners)
- 服务层双持久化: MySQL优先, JSON降级 (唯独 user-submission-service 仅JSON)
- 数据库: schema.sql (旧列名) vs migrations/001_user_center.sql (新列名) — 有冲突

## 管理员权限 & 认证（重要）
- **管理员账号不在 MySQL 里**：是 `server/config.js` 读 `.env` 的 `ADMIN_USERNAME/ADMIN_PASSWORD`
  单账号（本项目 `.env` = admin + 强密码）。登录签发 JWT(role:admin)。
- `users` 表有 `is_admin` 布尔列，是给用户打标记（二级路径），不是后台登录账号本身。
- 前端 file 模式硬编码 gly/123456；server 模式必须用 `.env` 真实凭据，否则 401。
- CSRF (`server/utils/csrf.js`)：`getSessionIdentifier` 必须只用 user-agent，
  不能随 Authorization 头切到 JWT（否则所有鉴权后 POST 403）。2026-07-21 已修。

## 已发现的 Bug (2026-07-14 首次全面审计)
### Critical/High
1. validator.js 字段名 mismatch (camelCase vs snake_case) — 验证器全是死代码
2. schema.sql 与 001_user_center.sql 列名冲突 — activity_registrations 和 delivery_records
3. auth-service 注册即 email_verified=TRUE — 验证流程废了
4. lazy-load.js export 在非module script 报 SyntaxError

### Medium
5. utils.js localStorage key "token" vs "alliance_token"
6. 密码重置邮件链接 /reset-password.html → 实际是 forgot-password.html (404)
7. CSRF 挂在 /api/activity 和 /api/delivery (不存在的前缀)
8. admin_logs 表代码引用但未定义
9. publish.html AuthState 加载竞态

### Low/功能缺失
10. user-submission-service 仅JSON无MySQL
11. Admin 缺用户内容审核 tab
12. 默认数据 4份副本 (defaults.js, site.js, category-hub.js, admin.js)
13. CSRF secret 硬编码
14. my.html CSS .profile-avatar-lg 重复3次

## 修复优先级
1. 统一 schema (schema.sql 列名对齐到 001_user_center.sql)
2. 修 validator 字段名
3. 修 lazy-load.js export
4. 修 localStorage key
5. 修密码重置链接
6. 修 CSRF 路由前缀
7. email_verified 改 FALSE
