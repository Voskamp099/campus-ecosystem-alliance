# 部署指南

本文档提供北京校园生态合作联盟网站的完整部署指南，包括开发环境、测试环境和生产环境的部署方案。

---

## 📋 部署前准备

### 系统要求

- **操作系统**：Linux（推荐 Ubuntu 20.04+）/ macOS / Windows
- **Node.js**：>= 18.0.0
- **MySQL**：>= 5.7（可选）
- **内存**：>= 512MB
- **磁盘**：>= 1GB

### 必需软件

```bash
# Node.js（Ubuntu）
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# MySQL（Ubuntu）
sudo apt-get install -y mysql-server

# Docker（可选）
curl -fsSL https://get.docker.com | bash
```

---

## 🚀 快速部署

### 方式一：本地开发部署

**1. 克隆项目**

```bash
git clone <repository-url>
cd alliance-website
```

**2. 安装依赖**

```bash
npm install
```

**3. 配置环境变量**

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```bash
# 服务配置
PORT=3001
NODE_ENV=development
JWT_SECRET=your-secret-key-change-me

# 管理员配置
ADMIN_USERNAME=gly
ADMIN_PASSWORD=123456
ADMIN_EMAIL=admin@example.com

# 数据库配置（可选）
# MYSQL_HOST=127.0.0.1
# MYSQL_PORT=3306
# MYSQL_USER=root
# MYSQL_PASSWORD=your-password
# MYSQL_DATABASE=alliance_website
```

**4. 启动服务**

```bash
# 开发模式（支持热重载）
npm run dev

# 生产模式
npm start
```

**5. 访问应用**

- 前台首页：http://localhost:3001/
- 后台管理：http://localhost:3001/admin
- API文档：http://localhost:3001/api-docs

---

### 方式二：Docker部署（推荐）

**1. 安装Docker和Docker Compose**

```bash
# Ubuntu
sudo apt-get update
sudo apt-get install -y docker.io docker-compose

# 启动Docker
sudo systemctl start docker
sudo systemctl enable docker
```

**2. 准备配置文件**

```bash
# 克隆项目
git clone <repository-url>
cd alliance-website

# 复制Docker环境变量
cp .env.docker .env
```

**3. 修改环境变量**

```bash
# 编辑 .env 文件
nano .env
```

修改以下配置：

```bash
JWT_SECRET=your-jwt-secret-key
ADMIN_PASSWORD=your-admin-password
MYSQL_ROOT_PASSWORD=your-root-password
MYSQL_PASSWORD=your-mysql-password
```

**4. 启动服务**

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f app

# 查看服务状态
docker-compose ps
```

**5. 访问应用**

- 前台首页：http://localhost:3000/
- 后台管理：http://localhost:3000/admin

**6. 管理命令**

```bash
# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 查看日志
docker-compose logs -f

# 进入容器
docker-compose exec app sh

# 清理所有数据
docker-compose down -v
```

---

### 方式三：生产环境部署

#### 1. 服务器准备

**推荐配置**
- CPU：2核+
- 内存：2GB+
- 磁盘：20GB+
- 系统：Ubuntu 20.04 LTS

**安全配置**

```bash
# 更新系统
sudo apt-get update && sudo apt-get upgrade -y

# 配置防火墙
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw enable

# 安装必要软件
sudo apt-get install -y nginx mysql-server nodejs npm
```

#### 2. 数据库配置

**创建数据库**

```bash
# 登录MySQL
sudo mysql -u root -p

# 创建数据库和用户
CREATE DATABASE alliance_website CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'alliance'@'localhost' IDENTIFIED BY 'your-password';
GRANT ALL PRIVILEGES ON alliance_website.* TO 'alliance'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# 导入数据库结构
mysql -u root -p alliance_website < database/schema.sql
```

#### 3. 应用部署

**克隆代码**

```bash
# 创建应用目录
sudo mkdir -p /var/www/alliance-website
sudo chown -R $USER:$USER /var/www/alliance-website

# 克隆项目
cd /var/www/alliance-website
git clone <repository-url> .
```

**安装依赖**

```bash
npm install --production
```

**配置环境变量**

```bash
cp .env.example .env
nano .env
```

生产环境配置：

```bash
NODE_ENV=production
PORT=3000
JWT_SECRET=your-very-strong-secret-key

ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-strong-password
ADMIN_EMAIL=admin@yourdomain.com

MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=alliance
MYSQL_PASSWORD=your-mysql-password
MYSQL_DATABASE=alliance_website

# 可选：邮件服务
SMTP_HOST=smtp.example.com
SMTP_PORT=465
SMTP_USER=your-email@example.com
SMTP_PASS=your-smtp-password
SMTP_FROM=noreply@yourdomain.com

# 可选：Sentry错误追踪
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

**生成JWT密钥**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 4. 使用PM2管理进程

**安装PM2**

```bash
sudo npm install -g pm2
```

**创建PM2配置**

```javascript
// ecosystem.config.cjs
module.exports = {
  apps: [{
    name: 'alliance-website',
    script: 'server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

**启动应用**

```bash
# 启动
pm2 start ecosystem.config.cjs --env production

# 查看状态
pm2 status

# 查看日志
pm2 logs alliance-website

# 开机自启
pm2 startup
pm2 save
```

#### 5. Nginx配置

**创建Nginx配置**

```nginx
# /etc/nginx/sites-available/alliance-website
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # 重定向到HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL证书
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # 日志
    access_log /var/log/nginx/alliance-access.log;
    error_log /var/log/nginx/alliance-error.log;

    # 静态文件
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # 超时配置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 上传文件大小限制
    client_max_body_size 10M;

    # Gzip压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_min_length 1000;
}
```

**启用站点**

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/alliance-website /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx
```

#### 6. SSL证书配置

**使用Let's Encrypt**

```bash
# 安装Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 自动续期
sudo certbot renew --dry-run
```

---

## 🔧 配置说明

### 环境变量详解

| 变量 | 必填 | 默认值 | 说明 |
|------|------|--------|------|
| `NODE_ENV` | ❌ | development | 运行环境 |
| `PORT` | ❌ | 3000 | 服务端口 |
| `JWT_SECRET` | ✅ | - | JWT密钥（必须修改） |
| `ADMIN_USERNAME` | ✅ | - | 管理员用户名 |
| `ADMIN_PASSWORD` | ✅ | - | 管理员密码（必须修改） |
| `MYSQL_HOST` | ❌ | 127.0.0.1 | MySQL地址 |
| `MYSQL_PORT` | ❌ | 3306 | MySQL端口 |
| `MYSQL_USER` | ❌ | root | MySQL用户名 |
| `MYSQL_PASSWORD` | ❌ | - | MySQL密码 |
| `MYSQL_DATABASE` | ❌ | alliance_website | 数据库名 |
| `SMTP_HOST` | ❌ | - | SMTP服务器 |
| `SMTP_PORT` | ❌ | 587 | SMTP端口 |
| `SMTP_USER` | ❌ | - | SMTP用户名 |
| `SMTP_PASS` | ❌ | - | SMTP密码 |
| `SENTRY_DSN` | ❌ | - | Sentry DSN |
| `CORS_ORIGIN` | ❌ | * | CORS源 |

### 数据库配置

**方式一：使用MySQL**

```bash
# 启用MySQL配置
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=alliance
MYSQL_PASSWORD=your-password
MYSQL_DATABASE=alliance_website
```

**方式二：JSON降级模式**

不配置MySQL相关变量，系统自动使用JSON文件存储：

```bash
# 注释或删除MySQL配置
# MYSQL_HOST=127.0.0.1
# MYSQL_PORT=3306
```

---

## 🔒 安全配置

### 1. 修改默认密码

```bash
# 生成强密码
openssl rand -base64 32

# 更新.env
ADMIN_PASSWORD=your-strong-password
JWT_SECRET=your-jwt-secret
MYSQL_PASSWORD=your-mysql-password
```

### 2. 配置防火墙

```bash
# Ubuntu UFW
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# CentOS Firewalld
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 3. 限制访问

```nginx
# 仅允许特定IP访问管理后台
location /admin {
    allow 192.168.1.0/24;
    deny all;
    proxy_pass http://localhost:3000;
}
```

### 4. 安全头配置

Nginx添加安全头：

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

---

## 📊 监控与日志

### 日志管理

**应用日志**

```bash
# PM2日志
pm2 logs alliance-website

# 日志文件位置
~/.pm2/logs/alliance-website-out.log
~/.pm2/logs/alliance-website-error.log
```

**Nginx日志**

```bash
/var/log/nginx/alliance-access.log
/var/log/nginx/alliance-error.log
```

**日志轮转**

```bash
# /etc/logrotate.d/alliance-website
/var/log/nginx/alliance-*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        [ -f /var/run/nginx.pid ] && kill -USR1 `cat /var/run/nginx.pid`
    endscript
}
```

### 性能监控

**健康检查端点**

```bash
# 健康检查
curl http://localhost:3000/health

# 性能指标
curl http://localhost:3000/api/metrics
```

**PM2监控**

```bash
# 监控面板
pm2 monit

# 内存使用
pm2 list
```

---

## 🔄 更新部署

### 常规更新

```bash
# 进入项目目录
cd /var/www/alliance-website

# 拉取最新代码
git pull origin main

# 安装依赖
npm install --production

# 运行数据库迁移（如有）
npm run migrate

# 重启服务
pm2 restart alliance-website
```

### 零停机更新

```bash
# 使用PM2集群模式
pm2 reload alliance-website
```

---

## 🐛 故障排查

### 常见问题

**1. 端口被占用**

```bash
# 查看端口占用
sudo lsof -i :3000

# 杀死进程
sudo kill -9 <PID>
```

**2. 数据库连接失败**

```bash
# 检查MySQL状态
sudo systemctl status mysql

# 测试连接
mysql -u alliance -p -h 127.0.0.1 alliance_website
```

**3. 权限问题**

```bash
# 修改文件所有者
sudo chown -R www-data:www-data /var/www/alliance-website

# 修改上传目录权限
chmod -R 755 public/uploads
```

**4. 内存不足**

```bash
# 查看内存使用
free -h

# 重启服务
pm2 restart alliance-website
```

### 日志查看

```bash
# 应用日志
pm2 logs alliance-website --lines 100

# Nginx错误日志
sudo tail -f /var/log/nginx/error.log

# 系统日志
sudo journalctl -u nginx -f
```

---

## 📦 备份与恢复

### 数据备份

**数据库备份**

```bash
# 备份数据库
mysqldump -u alliance -p alliance_website > backup_$(date +%Y%m%d).sql

# 自动备份脚本
# /etc/cron.daily/alliance-backup
#!/bin/bash
mysqldump -u alliance -ppassword alliance_website | gzip > /backup/alliance_$(date +%Y%m%d).sql.gz
find /backup -name "alliance_*.sql.gz" -mtime +7 -delete
```

**文件备份**

```bash
# 备份上传文件
tar -czf uploads_$(date +%Y%m%d).tar.gz public/uploads/

# 备份配置文件
tar -czf config_$(date +%Y%m%d).tar.gz .env
```

### 数据恢复

```bash
# 恢复数据库
mysql -u alliance -p alliance_website < backup_20260520.sql

# 恢复文件
tar -xzf uploads_20260520.tar.gz
```

---

## 🚀 性能优化

### Nginx优化

```nginx
# 启用Gzip
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

# 静态文件缓存
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# 请求体大小限制
client_max_body_size 10M;
```

### Node.js优化

```javascript
// PM2集群模式
instances: 'max',
exec_mode: 'cluster',

// 内存限制
max_memory_restart: '1G',
```

### 数据库优化

```sql
-- 创建索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);

-- 查询优化
EXPLAIN SELECT * FROM users WHERE email = 'user@example.com';
```

---

## 📞 技术支持

- **文档**：[GitHub Wiki]
- **问题反馈**：[GitHub Issues]
- **邮箱**：noreply@alliance.local
