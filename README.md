# Campus Ecosystem Alliance

**北京校园生态合作联盟** — a full-stack platform that connects university students,
companies and government partners, so that internships, events and collaboration
requests actually get matched instead of sitting in a WeChat group.

连接高校、企业与政府伙伴的生态对接平台：聚合三方资源，提供实习实践、活动报名、
资源对接与后台审核流程。

[![CI](https://github.com/Voskamp099/campus-ecosystem-alliance/actions/workflows/ci.yml/badge.svg)](https://github.com/Voskamp099/campus-ecosystem-alliance/actions/workflows/ci.yml)

> **About this repository** — published as a portfolio artefact so the engineering can be
> reviewed. It is not an open-source release and carries no licence; see [NOTICE](NOTICE).
> Sample data has been redacted and the commit history is preserved as written.

![Homepage](docs/screenshots/home-hero.jpg)

<p align="center">
  <img src="docs/screenshots/home-directory.jpg" width="49%" alt="生态对接名录" />
  <img src="docs/screenshots/admin-dashboard.jpg" width="49%" alt="后台控制台" />
</p>

---

## What it does

| Module | What it does |
| --- | --- |
| 首页 Home | Hero carousel, partner matrix, benefits hub, featured jobs and events |
| 联盟权益中心 Benefits hub | Benefits grouped by life scenario, each with its own detail list |
| 生态对接名录 Directory | University / company / government partners, filterable and searchable |
| 对接申请 Applications | Users file an application against a listed partner; the system issues a tracking code and drives it through a five-stage workflow |
| 用户发布 User posts | Registered users publish events and internships; admins approve or reject with a reason |
| 个人中心 Personal centre | Applications, event registrations and job submissions in one place |
| 后台管理 Admin | Full CRUD and ordering for every content section, plus moderation, user list, statistics and an audit log |

## Engineering highlights

### Degrades instead of failing

The whole data layer sits behind one interface: `isDatabaseAvailable()`. If MySQL is
unreachable, reads fall back to a JSON file store and writes report `503` rather than
crashing the process. The service still boots, still serves the site, and the admin
console still works. This is not theoretical — the app was built and tested with MySQL
down for most of its life.

MySQL 不可用时服务自动降级到 JSON 文件存储，站点照常可用，不会整体崩溃。

### Security model

Every write goes through a fixed chain, and each link is a deliberate choice:

| Layer | Mechanism |
| --- | --- |
| Session | JWT in `Authorization: Bearer`, verified per request by `verifyToken` |
| CSRF | Double-submit cookie — the token is issued by `GET /api/csrf-token`, stored in a cookie, and must be echoed in `x-csrf-token`; mismatch is `403` |
| Identity | Records are scoped to the `userId` inside the token, never to a phone number in the query string |
| Input | `express-validator` schemas plus an `xss` filter on request bodies |
| Transport | `helmet` security headers, `cors` with an allowlist, `csrf-csrf` |
| Abuse | Per-route rate limiters, global API limiter, `trust proxy` so `req.ip` is correct behind Nginx |
| Passwords | bcrypt with cost 12; hashes are never logged |
| Headers | Pino structured logs, Sentry error tracking, `/health` `/ready` `/live` probes |

### One bug worth calling out

Four legacy routes under `/api/user/*` took a phone number from the query string and
returned that person's directory applications, activity registrations and delivery
records. No authentication was required. Anyone who guessed a phone number could pull
another person's records — including their name, organisation and contact details.

They now require a JWT and resolve the identity from the token, matching the
`/api/user-center/*` routes sitting next to them. `__tests__/integration/user-records-auth.test.js`
pins the behaviour down, including the case where a valid token is combined with
someone else's phone number in the query.

### Testing

64 tests across 8 suites, driving the real Express app through `supertest` — no mocks
of the framework itself.

```
Test Suites: 8 passed, 8 total
Tests:       64 passed, 64 total
```

Coverage is 91% on `utils/csrf.js`, 93% on `utils/validator.js` and 87% on
`server/auth.js`. The suite is written so a failure names the guarantee that broke
("写操作不带 CSRF token 时被拒绝") rather than a line number.

## Architecture

```
                    ┌──────────────────────────────┐
  Browser  ───────▶ │  Express app                 │
                    │  helmet · cors · csrf · rate  │
                    │  limiter · sentry · pino      │
                    └───────────────┬──────────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              ▼                     ▼                     ▼
      /api/auth  /api/admin   /api/user   /api/public   service layer
      JWT + bcrypt           admin console               │
                                                            ▼
                                              ┌─────────────────────────┐
                                              │  isDatabaseAvailable()  │
                                              └───────┬─────────┬───────┘
                                          MySQL OK    │         │  MySQL down
                                          ┌───────────▼──┐   ┌──▼──────────────┐
                                          │  MySQL 8     │   │  JSON file store│
                                          │  InnoDB      │   │  (fallback)    │
                                          └──────────────┘   └─────────────────┘
```

Content is modelled as `section_key` + `group_key` + ordered items, which is why one
admin table can drive the hero carousel, the benefits hub, the directory and the
events list without any of them knowing about the others.

## Tech stack

**Backend** Node.js 18+, Express 4, MySQL 8 (InnoDB, utf8mb4), `mysql2`, `jsonwebtoken`,
`bcryptjs`, `csrf-csrf`, `helmet`, `express-rate-limit`, `express-validator`, `xss`,
`pino`, `@sentry/node`, `swagger-jsdoc`, `nodemailer`, `sharp`, `@volcengine/tos-sdk`

**Frontend** Vanilla HTML / CSS / ES6+. No framework, no build step required to run it.
The admin console is a single-page app with drag-and-drop ordering; it also runs
entirely in `file://` mode against `localStorage` so it can be demoed with no server.

**Testing** Jest + supertest

## Project layout

```
server/
  index.js              Express app; exports the app so tests can drive it without a port
  routes/               auth, admin, user-center, user-submissions, public
  services/             business logic, one module per bounded area
  utils/                csrf, cors, rate-limiter, validator, sentry, logger, errors
  scripts/              MySQL init and migration
  docs/                 OpenAPI specs
public/
  index.html            homepage
  admin.html            content console
  assets/               styles, scripts, polish layer
  assets/dist/          minified builds for production
database/
  schema.sql            full schema
  migrations/           incremental migrations
docs/
  ARCHITECTURE.md       detailed design
  DEPLOYMENT.md         deployment guide
  screenshots/
__tests__/
  unit/                 service-level tests
  integration/          supertest suites against the real app
```

## Getting started

```bash
npm install
cp .env.example .env      # fill in JWT_SECRET and ADMIN_PASSWORD at minimum
node server/index.js
```

The site is on `http://localhost:3000`, the console on `http://localhost:3000/admin`.

You can also skip the server entirely — open `public/index.html` directly in a browser
and it runs in local mode with `localStorage` as the backing store.

```bash
npm test                  # 64 tests
npm run test:coverage     # coverage report
```

The API is documented with Swagger at `/api-docs` while the server is running.

## Notes

- The partner names and example listings shipped as seed content are **demo data**
  (`server/defaults.js`), not formal partnerships.
- Personal data that ended up in the sample dataset has been redacted, and the same
  redaction was applied across the full commit history.
- `CSRF_SECRET` in `.env.example` is still a placeholder. Replace it before deploying.

## License

Not open source. See [NOTICE](NOTICE) — no permission is granted to copy, modify or
redistribute this code.
