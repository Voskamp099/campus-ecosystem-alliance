# 北京校园生态合作联盟

正式版内容管理站点，包含：

- 前台展示页：`/`
- 后台管理页：`/admin`
- API 文档：`/api-docs`
- 后端：`Node.js + Express`
- 数据库：`MySQL`（可选，本地开发可无 DB 运行）
- 图片存储：火山引擎对象存储 TOS（可选）

## 快速启动

```bash
npm install
cp .env.example .env   # 复制环境变量配置
node server/index.js   # 启动服务器
```

访问 http://localhost:3000

API 文档 http://localhost:3000/api-docs

## Docker 部署

### 快速启动（推荐）

使用 Docker Compose 一键部署：

```bash
# 1. 复制环境变量配置
cp .env.docker .env

# 2. 编辑 .env 文件，修改必要的配置
#    - JWT_SECRET（JWT 密钥）
#    - ADMIN_USERNAME（后台账号）
#    - ADMIN_PASSWORD（后台密码）
#    - MYSQL_PASSWORD（数据库密码）
#    - MYSQL_ROOT_PASSWORD（数据库 root 密码）

# 3. 启动服务
docker-compose up -d

# 4. 查看日志
docker-compose logs -f app
```

访问 http://localhost:3000

### Docker 常用命令

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 查看日志
docker-compose logs -f app

# 进入容器
docker-compose exec app sh

# 重新构建镜像
docker-compose build --no-cache

# 清理所有数据（包括数据库）
docker-compose down -v
```

### 仅启动应用（使用外部 MySQL）

如果你已有 MySQL 数据库：

```bash
# 1. 构建镜像
docker build -t alliance-website .

# 2. 运行容器
docker run -d \
  --name alliance-website \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e JWT_SECRET=your-jwt-secret \
  -e ADMIN_USERNAME=admin \
  -e ADMIN_PASSWORD=your-password \
  -e MYSQL_HOST=your-mysql-host \
  -e MYSQL_USER=your-mysql-user \
  -e MYSQL_PASSWORD=your-mysql-password \
  -e MYSQL_DATABASE=alliance_website \
  -v $(pwd)/public/uploads:/app/public/uploads \
  alliance-website
```

### Docker 环境变量

Docker Compose 会自动读取 `.env` 文件中的环境变量。主要配置项：

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `PORT` | 服务端口 | 3000 |
| `JWT_SECRET` | JWT 密钥 | - |
| `ADMIN_USERNAME` | 后台账号 | admin |
| `ADMIN_PASSWORD` | 后台密码 | - |
| `MYSQL_ROOT_PASSWORD` | MySQL root 密码 | - |
| `MYSQL_DATABASE` | 数据库名 | alliance_website |
| `MYSQL_USER` | MySQL 用户名 | alliance |
| `MYSQL_PASSWORD` | MySQL 密码 | - |

### 数据持久化

Docker Compose 会创建以下卷：

- `mysql-data`：MySQL 数据库数据
- `uploads`：用户上传的文件（头像等）

### 健康检查

容器内置健康检查，每 30 秒检查一次：

```bash
# 查看容器健康状态
docker ps

# 查看健康检查日志
docker inspect --format='{{json .State.Health}}' alliance-website | jq
```

### 本地开发（无需 MySQL）

服务器启动时会自动检测 MySQL 是否可用：
- **有 MySQL**：所有内容从数据库读取，支持完整的增删改查、导入导出。
- **无 MySQL**：自动降级到内置默认数据，页面完整可用，但无法保存修改（适合预览）。

### 完整功能（需要 MySQL）

1. 在 MySQL 中创建数据库并导入 schema：
```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS alliance_website CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p alliance_website < database/schema.sql
```

2. 复制并编辑 `.env`，填入 MySQL 连接信息和后台账号密码。

3. （可选）迁移 JSON 数据到 MySQL：
```bash
node server/scripts/migrate-to-mysql.js
```

4. 重启服务器：
```bash
node server/index.js
```

## 环境变量说明

| 变量 | 必填 | 说明 |
|---|---|---|
| `NODE_ENV` | ❌ | 运行环境：development / production |
| `PORT` | ❌ | 服务端口，默认 3000 |
| `LOG_LEVEL` | ❌ | 日志级别：debug / info / warn / error |
| `ADMIN_USERNAME` | ✅ | 后台登录账号 |
| `ADMIN_EMAIL` | ❌ | 管理员邮箱 |
| `ADMIN_PASSWORD` | ✅ | 后台登录密码（务必修改） |
| `JWT_SECRET` | ✅ | JWT 密钥（务必修改，建议 32 位随机字符串） |
| `JWT_EXPIRES_IN` | ❌ | JWT 过期时间，默认 7d |
| `MYSQL_HOST` | 部分 | MySQL 地址，默认 `127.0.0.1` |
| `MYSQL_PORT` | 部分 | MySQL 端口，默认 `3306` |
| `MYSQL_USER` | 部分 | MySQL 用户名，默认 `root` |
| `MYSQL_PASSWORD` | 部分 | MySQL 密码 |
| `MYSQL_DATABASE` | 部分 | 数据库名，默认 `alliance_website` |
| `MYSQL_CONNECTION_LIMIT` | ❌ | 连接池大小，默认 10 |
| `RATE_LIMIT_WINDOW_MS` | ❌ | API 限流时间窗口（毫秒），默认 900000（15分钟） |
| `RATE_LIMIT_MAX` | ❌ | 每个 IP 在时间窗口内的最大请求数，默认 100 |
| `CORS_ORIGIN` | ❌ | CORS 允许的源，默认 * |
| `SENTRY_DSN` | ❌ | Sentry 错误追踪 DSN（生产环境推荐配置） |
| `SMTP_HOST` | ❌ | SMTP 服务器地址（邮件服务） |
| `SMTP_PORT` | ❌ | SMTP 端口，默认 587 |
| `SMTP_USER` | ❌ | SMTP 用户名 |
| `SMTP_PASS` | ❌ | SMTP 密码 |
| `SMTP_FROM` | ❌ | 发件人地址，默认 noreply@alliance.local |
| `SITE_URL` | ❌ | 网站公开访问地址，默认 http://localhost:3000 |
| `TOS_REGION` | ❌ | 火山引擎 TOS 区域（不使用图片上传可留空） |
| `TOS_ENDPOINT` | ❌ | TOS 入口地址 |
| `TOS_BUCKET` | ❌ | TOS 存储桶名称 |
| `TOS_ACCESS_KEY` | ❌ | TOS Access Key |
| `TOS_SECRET_KEY` | ❌ | TOS Secret Key |
| `TOS_PUBLIC_BASE_URL` | ❌ | 图片公开访问地址 |

> ⚠️ **安全提示**：`JWT_SECRET` 和 `ADMIN_PASSWORD` 必须修改为随机值，否则存在被伪造登录的风险。
> 生成随机 JWT 密钥：`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

## 目录结构

```
├── index.html              # 首页
├── admin.html              # 管理后台
├── categories.html         # 联盟权益中心
├── directory.html          # 生态对接名录
├── directory-apply.html    # 发起对接申请
├── public/
│   └── assets/
│       ├── site.js         # 前台页面逻辑
│       ├── admin.js         # 后台页面逻辑
│       ├── category-hub.js  # 权益中心逻辑
│       ├── directory-hub.js # 名录页逻辑
│       └── directory-apply.js # 申请页逻辑
└── server/
    ├── index.js            # Express 入口
    ├── config.js           # 配置读取
    ├── auth.js             # JWT 鉴权
    ├── db.js               # MySQL 连接池
    ├── defaults.js         # 默认数据
    ├── utils/              # 工具函数
    │   ├── logger.js       # 日志系统
    │   ├── errors.js       # 错误处理
    │   └── rate-limiter.js # API 限流
    ├── scripts/            # 脚本
    │   └── migrate-to-mysql.js # 数据迁移
    ├── routes/
    │   ├── public.js       # 公开 API
    │   └── admin.js        # 管理 API
    └── services/
        ├── content-service.js           # 内容管理
        ├── directory-application-service.js # 对接申请
        └── upload-service.js            # 图片上传
```

## 开发指南

### 日志系统

项目使用 Pino 作为日志系统，支持以下级别：
- `trace` - 详细调试信息
- `debug` - 调试信息
- `info` - 一般信息（生产环境默认）
- `warn` - 警告信息
- `error` - 错误信息
- `fatal` - 致命错误

开发环境自动启用彩色输出和格式化。

### 错误处理

统一的错误处理中间件，支持：
- 自定义错误类型（ValidationError、UnauthorizedError 等）
- MySQL 错误自动转换
- JWT 错误自动转换
- 文件上传错误处理
- 生产环境错误信息隐藏

### API 限流

- 通用 API：每个 IP 15 分钟内最多 100 次请求
- 登录接口：每个 IP 15 分钟内最多 5 次尝试
- 注册接口：每个 IP 1 小时内最多 3 次尝试
- 文件上传：每个 IP 1 小时内最多 20 次上传

可通过环境变量自定义配置。

### 输入验证和 XSS 防护

项目使用 express-validator 进行输入验证，xss 库进行 XSS 过滤：

**后端验证**：
- 用户注册/登录验证
- 活动报名验证
- 投递记录验证
- 对接申请验证
- 内容管理验证

**前端防护**：
- HTML 转义函数
- XSS 过滤工具

### CSRF 保护

项目使用 csrf-csrf 实现双重提交 Cookie 保护：

**工作原理**：
1. 服务器生成 CSRF Token 并设置到 Cookie
2. 前端从 API 获取 Token
3. 前端在请求中携带 Token（Header）
4. 服务器验证 Token 有效性

**前端集成**：
```javascript
// 获取 CSRF Token
const response = await fetch('/api/csrf-token');
const { csrfToken } = await response.json();

// 在请求中携带 Token
fetch('/api/admin/content', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken
  },
  body: JSON.stringify(data)
});
```

### CORS 配置

项目使用 cors 中间件进行跨域控制：

**开发环境**：
- 允许所有源（`*`）
- 允许凭证

**生产环境**：
- 白名单机制
- 严格源验证
- 配置：`CORS_ORIGIN=https://yourdomain.com`

### 安全头

项目使用 Helmet 中间件添加安全响应头：

- `X-Frame-Options` - 防止点击劫持
- `X-Content-Type-Options` - 防止 MIME 类型嗅探
- `X-XSS-Protection` - XSS 过滤器
- `Referrer-Policy` - 控制 Referrer 信息
- `Content-Security-Policy` - 内容安全策略（生产环境）
- `Permissions-Policy` - 限制浏览器功能

### 监控和错误追踪

项目集成了 Sentry 错误追踪和性能监控：

**健康检查端点：**
- `GET /health` - 健康检查（Docker/Kubernetes）
- `GET /healthz` - Kubernetes 兼容健康检查
- `GET /ready` - 就绪检查（Readiness Probe）
- `GET /live` - 存活检查（Liveness Probe）
- `GET /api/metrics` - 性能指标（CPU、内存、数据库）

**Sentry 配置：**
```bash
# 在 .env 中配置
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

**性能监控：**
- 自动记录慢请求（>1s）
- 响应时间头（X-Response-Time）
- 内存和 CPU 使用情况
- 数据库连接状态

### 测试

项目使用 Jest 作为测试框架：

```bash
# 运行所有测试
npm test

# 监听模式
npm run test:watch

# 生成覆盖率报告
npm run test:coverage
```

### CI/CD

项目使用 GitHub Actions 实现自动化 CI/CD：

**CI 工作流（.github/workflows/ci.yml）：**
- 自动运行测试（Node.js 18/20）
- 代码安全审计（npm audit + Snyk）
- Docker 镜像构建测试
- 测试覆盖率上传（Codecov）

**CD 工作流（.github/workflows/cd.yml）：**
- 自动构建并推送 Docker 镜像
- 支持多镜像仓库（Docker Hub + GitHub Container Registry）
- 自动部署到 staging 环境（main/master 分支）
- 自动部署到 production 环境（版本标签）

**配置步骤：**
1. 在 GitHub 仓库设置中添加 Secrets：
   - `DOCKER_USERNAME` - Docker Hub 用户名
   - `DOCKER_PASSWORD` - Docker Hub 密码
   - `SNYK_TOKEN` - Snyk API Token（可选）
   - `STAGING_HOST` - 测试服务器地址
   - `STAGING_USERNAME` - 测试服务器用户名
   - `STAGING_SSH_KEY` - 测试服务器 SSH 私钥
   - `PRODUCTION_HOST` - 生产服务器地址
   - `PRODUCTION_USERNAME` - 生产服务器用户名
   - `PRODUCTION_SSH_KEY` - 生产服务器 SSH 私钥

2. 推送代码到 main/master 分支触发 CI
3. 创建版本标签（如 `v1.7.0`）触发 CD

**手动触发部署：**
```bash
# 在 GitHub Actions 页面手动触发工作流
```

测试目录结构：
```
__tests__/
├── unit/           # 单元测试
│   ├── errors.test.js
│   └── config.test.js
└── integration/    # 集成测试
    └── api.test.js
```

## 更新日志

### v1.11.0 (2026-05-20)
- ⚡ 前端资源压缩优化（节省 32.1% 空间）
- 🗜️ 启用 Gzip 压缩中间件
- 📦 配置静态资源缓存策略
- 🖼️ 新增图片懒加载功能
- 🔧 新增资源构建脚本（npm run build）

### v1.10.0 (2026-05-20)
- 🐛 修复 bcrypt 密码哈希兼容性问题（统一使用 $2b$ 版本）
- 🐛 修复 CSRF Token 验证问题
- 🐛 修复登录速率限制过严问题（开发环境放宽至 50次/15分钟）
- 📦 更新依赖包到最新版本（@sentry/node、helmet、mysql2、nodemailer、swagger-jsdoc）
- 🔧 替换 console.log 为 logger（统一日志系统）
- 📚 完善项目文档（README、架构、部署指南）
- ✨ 优化错误处理和用户体验

### v1.9.0 (2026-05-20)
- 📦 新增前端构建配置（Rollup）
- 🗃️ 新增数据库迁移工具
- ⚡ 优化前端资源加载

### v1.8.0 (2026-05-20)
- 📚 完善项目文档体系
- 📚 新增架构文档、部署文档、API文档
- 📝 新增贡献指南

### v1.7.0 (2026-05-20)
- 🔍 集成 Sentry 错误追踪（自动捕获异常和性能数据）
- 📊 新增性能监控端点（/health、/ready、/live、/api/metrics）
- 🚀 新增 GitHub Actions CI/CD 工作流
  - 自动化测试（支持 Node.js 18/20）
  - 安全审计（npm audit + Snyk）
  - Docker 镜像构建和推送
  - 自动化部署（staging/production）
- 📦 更新依赖包（bcryptjs 3.0.3、dotenv 17.4.2）
- 🔧 新增 SENTRY_DSN 环境变量配置

### v1.6.0 (2026-05-20)
- 🐳 新增 Docker 支持（Dockerfile + docker-compose.yml）
- 🐳 新增 .dockerignore 文件
- 🐳 新增 .env.docker 环境变量模板
- 📚 更新 README.md 添加 Docker 部署文档
- 🔧 优化 .gitignore（保留 .gitkeep 文件）
- 🏥 添加容器健康检查（/health 端点）

### v1.5.1 (2026-05-20)
- 🔧 完善 .gitignore 文件（添加更多忽略项）
- 🔧 解决文件上传中间件重复问题（保留 multer 和 express-fileupload，各有用途）
- 📦 更新依赖包（express 4.22.2、mysql2 3.22.3、dotenv 16.6.1）
- 🧪 修复测试文件语法错误（async/await、导入路径）
- 🧪 新增认证服务单元测试
- 🧪 测试覆盖率提升至 24 个测试用例

### v1.5.0 (2026-05-20)
- 📚 新增 Swagger API 文档（/api-docs）
- 📚 新增 OpenAPI 3.0 规范的 API 定义
- 📚 新增认证、用户、公开数据等 API 文档
- ✨ 完善邮件服务集成（验证邮件、密码重置邮件）
- 🔧 统一日志系统（全部使用 Pino logger）
- 🔧 优化头像上传服务（Sharp 模块动态加载）

### v1.4.0 (2026-05-14)
- 🔒 添加 CSRF 保护（csrf-csrf 双重提交 Cookie）
- 🔒 添加 CORS 配置（白名单机制）
- 🔒 添加 Helmet 安全头中间件
- 🔒 添加 Cookie 解析器
- 📝 新增安全配置指南文档（SECURITY.md）
- 🔧 完善安全防护体系

### v1.3.0 (2026-05-14)
- ✨ 新增输入验证和 XSS 防护（express-validator + xss）
- ✨ 新增前端工具库（全局加载、错误提示、API 封装）
- ✨ 新增图片懒加载功能
- ✨ 新增 Jest 测试框架和核心测试
- 🔧 完善安全防护体系

### v1.2.0 (2026-05-14)
- ✨ 合并优化版本，整合所有优势功能
- ✨ 新增邮件服务（验证邮件、密码重置）
- ✨ 新增全局搜索功能（搜索历史、热门搜索）
- ✨ 新增骨架屏加载效果
- ✨ 新增管理员日志服务
- ✨ 新增本地文件上传（支持缩略图生成）
- ✨ 新增 Content-Security-Policy 安全头
- ✨ 新增 PM2 和 Nginx 配置文件
- ✨ 新增统一 API 响应格式工具
- 🔧 集成 Pino 日志系统
- 🔧 统一错误处理中间件
- 🔧 环境变量验证和配置管理增强
- 🔧 API 限流保护（防暴力攻击）
- 🔧 数据库 schema 扩展（8 张表）
- 📝 完善环境变量配置文档

### v1.1.0 (2026-05-14)
- ✨ 添加 Pino 日志系统
- ✨ 统一错误处理中间件
- ✨ 环境变量验证和配置管理增强
- ✨ API 限流保护（防暴力攻击）
- ✨ 用户数据从 JSON 迁移到 MySQL
- ✨ 数据库 schema 扩展（用户、登录日志、活动报名等）
- 📝 完善环境变量配置文档
