import dotenv from "dotenv";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

function readNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function readBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === "") return fallback;
  return value === "true" || value === "1";
}

/**
 * 环境变量验证
 */
function validateConfig() {
  const errors = [];
  const warnings = [];

  // 生产环境必须配置的变量
  if (isProduction) {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET === "change-me") {
      errors.push("JWT_SECRET 必须设置为随机字符串（生产环境）");
    }
    if (!process.env.ADMIN_PASSWORD && !process.env.ADMIN_PASSWORD_HASH) {
      errors.push("ADMIN_PASSWORD 或 ADMIN_PASSWORD_HASH 必须设置（生产环境）");
    }
    if (process.env.ADMIN_PASSWORD === "123456") {
      errors.push("ADMIN_PASSWORD 不能使用默认密码（生产环境）");
    }
  }

  // 推荐配置的变量
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === "change-me") {
    warnings.push("JWT_SECRET 未设置，使用默认值，存在安全风险");
  }
  if (!process.env.ADMIN_PASSWORD && !process.env.ADMIN_PASSWORD_HASH) {
    warnings.push("ADMIN_PASSWORD 未设置，后台登录密码为空");
  }

  return { errors, warnings };
}

const config = {
  env: process.env.NODE_ENV || "development",
  isProduction,
  port: readNumber(process.env.PORT, 3000),
  logLevel: process.env.LOG_LEVEL || (isProduction ? "info" : "debug"),
  
  // 认证配置
  jwtSecret: process.env.JWT_SECRET || "change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  
  // 管理员配置
  adminUsername: process.env.ADMIN_USERNAME || "gly",
  adminEmail: process.env.ADMIN_EMAIL || "gly@alliance.local",
  adminPassword: process.env.ADMIN_PASSWORD || "123456",
  adminPasswordHash: process.env.ADMIN_PASSWORD_HASH || "",
  
  // MySQL 配置
  mysql: {
    host: process.env.MYSQL_HOST || "127.0.0.1",
    port: readNumber(process.env.MYSQL_PORT, 3306),
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || "alliance_website",
    connectionLimit: readNumber(process.env.MYSQL_CONNECTION_LIMIT, 10),
  },
  
  // 邮件服务配置
  email: {
    smtpHost: process.env.SMTP_HOST || "",
    smtpPort: readNumber(process.env.SMTP_PORT, 587),
    smtpUser: process.env.SMTP_USER || "",
    smtpPass: process.env.SMTP_PASS || "",
    from: process.env.SMTP_FROM || "noreply@alliance.local",
  },
  
  // 网站配置
  siteUrl: process.env.SITE_URL || `http://localhost:${readNumber(process.env.PORT, 3000)}`,
  
  // 火山引擎 TOS 配置
  tos: {
    region: process.env.TOS_REGION || "",
    endpoint: process.env.TOS_ENDPOINT || "",
    bucket: process.env.TOS_BUCKET || "",
    accessKeyId: process.env.TOS_ACCESS_KEY || "",
    accessKeySecret: process.env.TOS_SECRET_KEY || "",
    publicBaseUrl: (process.env.TOS_PUBLIC_BASE_URL || "").replace(/\/$/, ""),
    uploadPrefix: (process.env.UPLOAD_PREFIX || "alliance").replace(/^\/+|\/+$/g, ""),
    maxUploadSizeMb: readNumber(process.env.MAX_UPLOAD_SIZE_MB, 10)
  },
  
  // 安全配置
  rateLimit: {
    windowMs: readNumber(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000), // 15 分钟
    max: readNumber(process.env.RATE_LIMIT_MAX, 100), // 每个 IP 最多 100 次请求
  },
  
  // CORS 配置
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    credentials: readBoolean(process.env.CORS_CREDENTIALS, true),
  },
  
  // Sentry 错误追踪配置
  sentryDsn: process.env.SENTRY_DSN || "",
};

// 启动时验证配置
const { errors, warnings } = validateConfig();

// 配置验证日志（在 logger 初始化之前）
const logPrefix = "[Config]";

if (warnings.length > 0) {
  warnings.forEach(warning => console.warn(`${logPrefix} ⚠ ${warning}`));
}

if (errors.length > 0) {
  console.error(`${logPrefix} 配置错误：`);
  errors.forEach(error => console.error(`${logPrefix}   ✗ ${error}`));
  
  if (isProduction) {
    console.error(`${logPrefix}\n生产环境配置验证失败，服务器拒绝启动`);
    process.exit(1);
  }
}

export { config };
export function getConfig() {
  return config;
}
