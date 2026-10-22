# 系统架构文档

## 📐 整体架构

### 技术栈

**后端**
- Node.js 18.19.1
- Express 4.22.2
- MySQL 5.7+（可选）
- Pino（日志）
- JWT（认证）
- bcryptjs（密码加密）

**前端**
- HTML5 + CSS3 + JavaScript (ES6+)
- 原生 CSS（assets/styles.css 公共样式层 + assets/polish.css 视觉打磨层）
- 原生组件（无框架依赖、无构建步骤）

**安全**
- Helmet（安全头）
- CSRF保护
- XSS过滤
- Rate Limiting（速率限制）

### 架构模式

项目采用**前后端分离**架构，支持两种运行模式：

```
┌─────────────────┐      ┌─────────────────┐
│   前端（HTML）   │ ←──→ │   后端（API）    │
└─────────────────┘      └─────────────────┘
                                   │
                                   ↓
                         ┌─────────────────┐
                         │  数据存储层      │
                         │  MySQL / JSON   │
                         └─────────────────┘
```

---

## 🗂️ 目录结构

```
alliance-website/
├── server/                  # 后端代码
│   ├── routes/              # API 路由
│   │   ├── auth.js          # 认证路由
│   │   ├── public.js        # 公开数据路由
│   │   ├── admin.js         # 管理后台路由
│   │   ├── user-center.js   # 用户中心路由
│   │   └── batch.js         # 批量操作路由
│   ├── services/            # 业务逻辑层
│   │   ├── auth-service.js  # 认证服务
│   │   ├── email-service.js # 邮件服务
│   │   ├── content-service.js # 内容服务
│   │   └── ...
│   ├── utils/               # 工具函数
│   │   ├── logger.js        # 日志系统
│   │   ├── validator.js     # 输入验证
│   │   ├── rate-limiter.js  # 速率限制
│   │   ├── csrf.js          # CSRF保护
│   │   └── ...
│   ├── middleware/          # 中间件
│   ├── docs/                # API文档（Swagger）
│   ├── migrations/          # 数据库迁移
│   └── index.js             # 应用入口
│
├── public/                  # 前端静态资源
│   ├── assets/              # JS/CSS资源
│   │   ├── site.js          # 前台页面逻辑
│   │   ├── admin.js         # 后台页面逻辑
│   │   ├── auth-guard.js    # 认证守卫
│   │   └── ...
│   ├── uploads/             # 上传文件存储
│   └── ...
│
├── data/                    # JSON数据存储（降级模式）
│   ├── users.json           # 用户数据
│   ├── categories.json      # 分类数据
│   └── ...
│
├── database/                # 数据库脚本
│   ├── schema.sql           # 数据库结构
│   └── migrations/          # 迁移脚本
│
├── deploy/                  # 部署配置
│   ├── nginx.alliance.conf.example
│   └── ecosystem.config.cjs
│
├── .github/                 # CI/CD配置
│   └── workflows/
│       ├── ci.yml           # 持续集成
│       └── cd.yml           # 持续部署
│
├── __tests__/               # 测试文件
│   ├── unit/                # 单元测试
│   └── integration/         # 集成测试
│
└── docs/                    # 项目文档
    ├── ARCHITECTURE.md      # 架构文档
    ├── DEPLOYMENT.md        # 部署指南
    └── API.md               # API文档
```

---

## 🔧 核心模块

### 1. 认证系统

**技术实现**
- JWT Token认证
- bcryptjs密码加密
- 双因素认证（预留）

**流程**
```
用户登录 → 验证密码 → 生成JWT Token → 返回Token
    ↓
访问受保护资源 → 验证Token → 获取用户信息 → 授权访问
```

**关键文件**
- `server/routes/auth.js` - 认证路由
- `server/services/auth-service.js` - 认证服务
- `server/utils/auth.js` - 认证中间件

### 2. 安全系统

**多层安全防护**

```
请求 → Helmet安全头 → CORS检查 → CSRF验证
         ↓               ↓           ↓
    X-Frame-Options  白名单检查  Token验证
         ↓               ↓           ↓
    XSS过滤 → SQL注入防护 → 速率限制 → 业务逻辑
```

**关键文件**
- `server/utils/csrf.js` - CSRF保护
- `server/utils/validator.js` - 输入验证
- `server/utils/rate-limiter.js` - 速率限制

### 3. 数据存储

**双模式存储**

```javascript
// 检测数据库是否可用
if (await isDatabaseAvailable()) {
  // 使用MySQL
  const [rows] = await pool.query('SELECT * FROM users');
  return rows;
} else {
  // 降级到JSON文件
  const users = loadJson('users.json');
  return users;
}
```

**优势**
- 无需配置MySQL即可运行
- 支持灵活部署
- 数据自动迁移

---

## 📊 数据模型

### 用户表（users）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| email | VARCHAR(255) | 邮箱 |
| password_hash | VARCHAR(255) | 密码哈希 |
| nickname | VARCHAR(100) | 昵称 |
| avatar_url | VARCHAR(500) | 头像URL |
| phone | VARCHAR(20) | 电话 |
| real_name | VARCHAR(100) | 真实姓名 |
| org_name | VARCHAR(200) | 机构名称 |
| org_role | VARCHAR(100) | 机构角色 |
| email_verified | BOOLEAN | 邮箱是否验证 |
| is_admin | BOOLEAN | 是否管理员 |
| status | ENUM | 状态（active/banned） |
| created_at | TIMESTAMP | 创建时间 |
| last_login_at | TIMESTAMP | 最后登录时间 |

### 其他表

- **categories** - 联盟分类
- **directory_applications** - 对接申请
- **activity_registrations** - 活动报名
- **delivery_records** - 投递记录
- **admin_logs** - 管理员日志
- **login_logs** - 登录日志

---

## 🔄 API设计

### RESTful API

**认证相关**
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出
- `POST /api/auth/forgot-password` - 忘记密码
- `POST /api/auth/reset-password` - 重置密码

**用户中心**
- `GET /api/user/profile` - 获取个人信息
- `PUT /api/user/profile` - 更新个人信息
- `POST /api/user/avatar` - 上传头像
- `PUT /api/user/password` - 修改密码

**公开数据**
- `GET /api/public/categories` - 获取分类
- `GET /api/public/activities` - 获取活动
- `POST /api/public/activity/register` - 活动报名

**管理后台**
- `GET /api/admin/users` - 用户列表
- `PUT /api/admin/users/:id` - 更新用户
- `GET /api/admin/logs` - 管理员日志
- `POST /api/admin/content` - 内容管理

### 响应格式

**成功响应**
```json
{
  "success": true,
  "message": "操作成功",
  "data": { ... }
}
```

**错误响应**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "参数验证失败"
  }
}
```

---

## 🚀 性能优化

### 后端优化

1. **数据库连接池**
   - 最大连接数：10
   - 自动重连
   - 连接复用

2. **日志性能**
   - Pino高性能日志
   - 异步写入
   - 日志级别控制

3. **缓存策略**
   - Redis缓存（预留）
   - 静态资源缓存
   - ETag支持

### 前端优化

1. **资源优化**
   - 按需加载
   - 懒加载图片
   - 骨架屏

2. **请求优化**
   - API合并
   - 防抖节流
   - 请求缓存

---

## 🔐 安全机制

### 1. 认证与授权

- JWT Token认证
- Token过期时间：7天
- 自动刷新机制

### 2. 密码安全

- bcrypt加密（12轮）
- 密码强度检查
- 密码重置流程

### 3. 防护措施

- **CSRF保护**：双重提交Cookie
- **XSS过滤**：输入输出转义
- **SQL注入**：参数化查询
- **暴力破解**：速率限制
- **点击劫持**：X-Frame-Options

### 4. 安全头

```http
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'
```

---

## 📈 监控与日志

### 日志系统

**日志级别**
- trace - 详细调试
- debug - 调试信息
- info - 一般信息
- warn - 警告信息
- error - 错误信息
- fatal - 致命错误

**日志格式**
```json
{
  "level": 30,
  "time": 1716201600000,
  "msg": "用户登录成功",
  "email": "user@example.com",
  "ip": "127.0.0.1"
}
```

### 健康检查

- `GET /health` - 健康检查
- `GET /ready` - 就绪检查
- `GET /live` - 存活检查
- `GET /api/metrics` - 性能指标

### 错误追踪

**Sentry集成**
- 自动捕获异常
- 性能监控
- 用户上下文
- 敏感信息过滤

---

## 🧪 测试策略

### 单元测试

- 测试框架：Jest
- 覆盖率：>80%
- 测试文件：`__tests__/unit/`

### 集成测试

- API测试
- 数据库测试
- 测试文件：`__tests__/integration/`

### 运行测试

```bash
# 运行测试
npm test

# 覆盖率报告
npm run test:coverage

# 监听模式
npm run test:watch
```

---

## 🚢 部署架构

### 单机部署

```
Nginx → Node.js → MySQL
  ↓
静态资源
```

### Docker部署

```
Docker Compose
├── app（Node.js应用）
├── mysql（数据库）
└── nginx（反向代理）
```

### 高可用部署

```
负载均衡器
    ↓
┌───┴───┐
↓       ↓
Node1   Node2
    ↓
MySQL主从
```

---

## 📝 扩展指南

### 添加新功能

1. 创建路由文件 `server/routes/new-feature.js`
2. 创建服务文件 `server/services/new-feature-service.js`
3. 添加API文档 `server/docs/new-feature.yaml`
4. 编写测试文件 `__tests__/unit/new-feature.test.js`
5. 更新README文档

### 添加新API

```javascript
// 1. 定义路由
router.get('/api/new-endpoint', middleware, handler);

// 2. 添加验证
validators.newEndpoint = [
  body('field').notEmpty(),
  validate
];

// 3. 添加文档
/**
 * @openapi
 * /api/new-endpoint:
 *   get:
 *     description: 新API
 */
```

---

## 🔮 未来规划

### 短期（1-3个月）

- [ ] 完善测试覆盖率
- [ ] 优化前端性能
- [ ] 添加更多API

### 中期（3-6个月）

- [ ] 微服务架构
- [ ] GraphQL支持
- [ ] 移动端适配

### 长期（6-12个月）

- [ ] 云原生改造
- [ ] 国际化支持
- [ ] AI功能集成
