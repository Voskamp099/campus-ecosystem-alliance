# 安全配置指南

## 概述

本文档说明项目的安全配置和最佳实践。

---

## 安全功能清单

### ✅ 已实现

1. **HTTPS 强制**
   - 生产环境强制 HTTPS
   - HSTS 头设置
   - Secure Cookie

2. **认证与授权**
   - JWT Token 认证
   - 密码加密（bcrypt）
   - Session 管理
   - 权限验证

3. **输入验证**
   - express-validator 参数验证
   - XSS 过滤（xss 库）
   - SQL 注入防护（参数化查询）
   - 文件上传验证

4. **CSRF 保护**
   - csrf-csrf 双重提交 Cookie
   - Token 验证
   - 自动 Token 刷新

5. **CORS 配置**
   - 白名单机制
   - 凭证控制
   - 预检请求缓存

6. **Rate Limiting**
   - API 限流
   - 登录限流
   - 注册限流
   - 上传限流

7. **安全头**
   - Helmet 中间件
   - Content-Security-Policy
   - X-Frame-Options
   - X-Content-Type-Options
   - X-XSS-Protection
   - Referrer-Policy
   - Permissions-Policy

8. **日志与监控**
   - Pino 日志系统
   - 请求日志
   - 错误日志
   - 登录日志
   - 管理员操作日志

---

## 环境变量配置

### 必需的安全变量

```bash
# JWT 密钥（必须修改）
JWT_SECRET=your-random-32-char-string

# CSRF 密钥（必须修改）
CSRF_SECRET=your-random-32-char-string

# 管理员密码（必须修改）
ADMIN_PASSWORD=your-secure-password

# CORS 允许的源（生产环境必须配置）
CORS_ORIGIN=https://yourdomain.com

# Session 密钥（如果使用 session）
SESSION_SECRET=your-random-32-char-string
```

### 生成随机密钥

```bash
# 生成 32 位随机字符串
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## CSRF 保护

### 工作原理

1. 服务器生成 CSRF Token 并设置到 Cookie
2. 前端从 Cookie 或 API 获取 Token
3. 前端在请求中携带 Token（Header 或 Body）
4. 服务器验证 Token 有效性

### 前端集成

```javascript
// 获取 CSRF Token
async function getCsrfToken() {
  const response = await fetch('/api/csrf-token');
  const data = await response.json();
  return data.csrfToken;
}

// 在请求中携带 Token
async function apiPost(url, data) {
  const csrfToken = await getCsrfToken();
  
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken
    },
    body: JSON.stringify(data)
  });
}
```

### 忽略的方法

以下 HTTP 方法不需要 CSRF 保护：
- GET
- HEAD
- OPTIONS

---

## CORS 配置

### 开发环境

```bash
CORS_ORIGIN=*
CORS_CREDENTIALS=true
```

### 生产环境

```bash
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
CORS_CREDENTIALS=true
```

### 允许的请求头

- Content-Type
- Authorization
- X-Requested-With
- X-CSRF-Token
- X-XSRF-Token

---

## Rate Limiting 配置

### 默认限制

| 类型 | 时间窗口 | 最大请求数 |
|------|---------|-----------|
| 通用 API | 15 分钟 | 100 次 |
| 登录 | 15 分钟 | 5 次 |
| 注册 | 1 小时 | 3 次 |
| 上传 | 1 小时 | 20 次 |

### 自定义配置

```bash
# 时间窗口（毫秒）
RATE_LIMIT_WINDOW_MS=900000

# 最大请求数
RATE_LIMIT_MAX=100
```

---

## 密码安全

### 密码要求

- 最小长度：6 个字符
- 最大长度：100 个字符
- 必须包含：字母和数字
- 推荐：包含特殊字符

### 密码存储

- 使用 bcrypt 加密
- 加密轮数：12
- 明文密码不存储

### 密码重置

1. 生成随机 Token
2. Token 有效期：1 小时
3. Token 使用后立即失效
4. 发送重置邮件（需配置 SMTP）

---

## 文件上传安全

### 限制

- 文件大小：默认 10MB
- 文件类型：通过 MIME 类型验证
- 文件名：随机生成，避免路径遍历

### 存储选项

1. **火山引擎 TOS**（推荐）
   - 配置 TOS 相关环境变量
   - 自动 CDN 加速

2. **本地存储**
   - 文件保存在 `public/uploads/`
   - 自动生成缩略图

### 验证

```javascript
// 文件类型白名单
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// 文件大小限制
const MAX_SIZE = 10 * 1024 * 1024; // 10MB
```

---

## 数据库安全

### 连接安全

- 使用连接池
- 限制连接数
- 参数化查询（防 SQL 注入）

### 敏感数据

- 密码加密存储
- Token 加密存储
- 日志脱敏

---

## 日志安全

### 记录内容

- 请求日志（IP、方法、URL、状态码）
- 错误日志（堆栈跟踪）
- 登录日志（成功/失败）
- 管理员操作日志

### 敏感信息处理

- 密码不记录
- Token 脱敏
- 个人信息脱敏

---

## 生产环境检查清单

### 部署前

- [ ] 修改所有默认密码
- [ ] 生成随机 JWT_SECRET
- [ ] 生成随机 CSRF_SECRET
- [ ] 配置 CORS 白名单
- [ ] 启用 HTTPS
- [ ] 配置防火墙规则
- [ ] 设置数据库访问权限
- [ ] 配置日志收集
- [ ] 设置监控告警

### 部署后

- [ ] 测试所有安全功能
- [ ] 检查日志输出
- [ ] 验证 HTTPS 证书
- [ ] 测试 Rate Limiting
- [ ] 测试 CSRF 保护
- [ ] 测试 CORS 配置
- [ ] 进行安全扫描

---

## 安全最佳实践

### 1. 最小权限原则

- 数据库用户只授予必要权限
- API 只暴露必要接口
- 文件只读必要目录

### 2. 纵深防御

- 多层验证（前端 + 后端）
- 多种防护（CSRF + XSS + SQL 注入）
- 多级限流（IP + 用户 + 接口）

### 3. 安全编码

- 输入验证
- 输出编码
- 参数化查询
- 错误处理
- 日志记录

### 4. 定期更新

- 更新依赖包
- 修复安全漏洞
- 审查代码

---

## 应急响应

### 发现安全漏洞

1. 立即修复漏洞
2. 评估影响范围
3. 通知相关用户
4. 更新安全措施
5. 记录并总结

### 数据泄露

1. 立即停止泄露
2. 评估泄露数据
3. 通知受影响用户
4. 修改相关密钥
5. 加强安全措施

---

## 联系方式

如发现安全问题，请联系：
- 邮箱：security@alliance.local
- 紧急电话：xxx-xxxx-xxxx
