import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import swaggerUi from "swagger-ui-express";
import compression from "compression";
import { config } from "./config.js";
import { pool } from "./db.js";
import { logger, requestLogger } from "./utils/logger.js";
import { errorHandler, notFoundHandler } from "./utils/errors.js";
import { apiLimiter } from "./utils/rate-limiter.js";
import { corsMiddleware, corsErrorHandler } from "./utils/cors.js";
import { doubleCsrfProtection, csrfTokenMiddleware, csrfErrorHandler, csrfTokenRoute } from "./utils/csrf.js";
import { initSentry, sentryRequestHandler, sentryTracingHandler, sentryErrorHandler } from "./utils/sentry.js";
import { initDatabase } from "./scripts/init-db.js";
import { healthCheck, readinessCheck, livenessCheck, getPerformanceMetrics, performanceMonitor } from "./utils/monitoring.js";
import publicRouter from "./routes/public.js";
import adminRouter from "./routes/admin.js";
import userCenterRouter from "./routes/user-center.js";
import authRouter from "./routes/auth.js";
import userSubmissionRouter from "./routes/user-submissions.js";
import { swaggerSpec } from "./swagger.js";
import { verifyToken } from "./services/auth-service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// 初始化 Sentry 错误追踪
initSentry();

const app = express();

// 信任反向代理（Nginx），使 req.ip / X-Forwarded-For 正确生效
app.set("trust proxy", 1);

// ── Sentry 请求追踪 ────────────────────────────────────────────────
app.use(sentryRequestHandler());
app.use(sentryTracingHandler());

// ── 安全中间件 ────────────────────────────────────────────────
// Helmet 安全头
app.use(helmet({
  contentSecurityPolicy: config.isProduction ? {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
      connectSrc: ["'self'"],
      frameAncestors: ["'self'"],
    },
  } : false,
  crossOriginEmbedderPolicy: false,
}));

// Cookie 解析
app.use(cookieParser());

// Gzip 压缩（生产环境）
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  threshold: 1024, // 大于 1KB 才压缩
  level: 6, // 压缩级别 (1-9)
}));

// CORS
app.use(corsMiddleware);

// 请求日志中间件
app.use(requestLogger);

// API 限流（应用于所有 API 路由）
app.use("/api/", apiLimiter);

// 文件上传中间件
app.use(fileUpload({
  limits: { fileSize: 5 * 1024 * 1024 }, // 最大 5MB
  abortOnLimit: true,
  responseOnLimit: "文件大小超过限制（5MB）"
}));

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// 静态资源服务（带缓存配置）
app.use("/assets", express.static(path.join(rootDir, "public/assets"), {
  etag: true,
  lastModified: true,
  maxAge: '7d'
}));

// 上传文件静态服务
app.use("/uploads", express.static(path.join(rootDir, "public/uploads"), {
  etag: true,
  lastModified: true,
  maxAge: '30d'
}));

// 站点根目录：public/ 同时承载页面 HTML 与静态资源（favicon、assets 等）
// 注意：不能对 HTML 设置 maxAge，否则浏览器缓存旧版页面（如标题字号修改后返回首页仍看到旧版）。
// express.static 的 maxAge 会生成 Cache-Control: public, max-age=...，对 .html 文件会覆盖下方 no-cache 头。
// 解决方式：用 setHeaders 回调按扩展名区分，HTML 不缓存，其他资源保留 1 天缓存。
app.use(express.static(path.join(rootDir, "public"), {
  index: false,
  etag: true,
  lastModified: true,
  maxAge: '1d',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }
}));

// ── 静态资源缓存头 ────────────────────────────────────────
app.use((req, res, next) => {
  if (res.headersSent) return next();
  const ext = path.extname(req.path).toLowerCase();
  // 图片：长期缓存（1年）
  if (["ico","png","jpg","jpeg","gif","svg","webp","avif"].includes(ext.slice(1))) {
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  } 
  // JS/CSS/字体：中期缓存（7天）
  else if (["js","css","woff2","woff","ttf","eot"].includes(ext.slice(1))) {
    res.setHeader("Cache-Control", "public, max-age=604800");
  }
  // HTML：不缓存
  else if (ext === ".html") {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
  }
  next();
});

// ── CSRF 保护 ────────────────────────────────────────────────
// CSRF Token 中间件（为前端提供 token）
app.use(csrfTokenMiddleware);

// CSRF Token 路由（前端获取 token）
app.get("/api/csrf-token", csrfTokenRoute);

// CSRF 保护（应用于所有状态改变的路由）
// 注意：活动报名/投递记录等用户提交写接口的前缀是 /api/activity-registrations、/api/delivery-records，
// 与下面被删除的 /api/activity、/api/delivery 前缀不同；前端对这些接口未携带 CSRF token，故不在此强制 CSRF。
app.use("/api/admin", doubleCsrfProtection);
app.use("/api/auth", doubleCsrfProtection);
app.use("/api/user", doubleCsrfProtection);

// ── API 路由 ──────────────────────────────────────────────────
// API 文档（Swagger UI）
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "北京校园生态合作联盟 API 文档"
}));

// API 文档 JSON 格式
app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

app.use("/api/admin", adminRouter);
app.use("/api/auth", authRouter);
app.use("/api/public", publicRouter);
app.use("/api", userCenterRouter);
app.use("/api", userSubmissionRouter);

app.get(["/", "/index.html"], (req, res) => {
  res.sendFile(path.join(rootDir, "public", "index.html"));
});

app.get(["/categories", "/categories.html"], (req, res) => {
  res.sendFile(path.join(rootDir, "public", "categories.html"));
});

app.get(["/directory", "/directory.html"], (req, res) => {
  res.sendFile(path.join(rootDir, "public", "directory.html"));
});

app.get(["/directory-apply", "/directory-apply.html"], (req, res) => {
  res.sendFile(path.join(rootDir, "public", "directory-apply.html"));
});

app.get(["/directory-status", "/directory-status.html"], (req, res) => {
  res.sendFile(path.join(rootDir, "public", "directory-status.html"));
});

app.get(["/admin", "/admin.html"], (req, res) => {
  res.sendFile(path.join(rootDir, "public", "admin.html"));
});

app.get(["/my", "/my.html"], (req, res) => {
  res.sendFile(path.join(rootDir, "public", "my.html"));
});

app.get(["/publish", "/publish.html"], (req, res) => {
  res.sendFile(path.join(rootDir, "public", "publish.html"));
});

app.get(["/login", "/login.html"], (req, res) => {
  res.sendFile(path.join(rootDir, "public", "login.html"));
});

app.get(["/register", "/register.html"], (req, res) => {
  res.sendFile(path.join(rootDir, "public", "register.html"));
});

app.get(["/forgot-password", "/forgot-password.html"], (req, res) => {
  res.sendFile(path.join(rootDir, "public", "forgot-password.html"));
});

app.get(["/privacy", "/privacy.html"], (req, res) => {
  res.sendFile(path.join(rootDir, "public", "privacy.html"));
});

app.get(["/terms", "/terms.html"], (req, res) => {
  res.sendFile(path.join(rootDir, "public", "terms.html"));
});

// ── 健康检查和监控端点 ────────────────────────────────────────────────
// 性能监控中间件
app.use(performanceMonitor);

// 健康检查（Docker/Kubernetes）
app.get("/health", healthCheck);
app.get("/healthz", healthCheck); // Kubernetes 兼容
app.get("/ready", readinessCheck); // Kubernetes Readiness Probe
app.get("/live", livenessCheck); // Kubernetes Liveness Probe

// 性能指标（仅管理员）
app.get("/api/metrics", verifyToken, (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "需要管理员权限" });
  }
  getPerformanceMetrics()
    .then((metrics) => res.json(metrics))
    .catch(next);
});

// robots.txt
app.get("/robots.txt", (req, res) => {
  res.type("text/plain").send(
    "User-agent: *\n" +
    "Allow: /\n" +
    "Disallow: /admin\n" +
    "Disallow: /api/\n" +
    `Sitemap: ${req.protocol}://${req.get("host")}/sitemap.xml\n`
  );
});

// sitemap.xml
app.get("/sitemap.xml", (req, res) => {
  const base = `${req.protocol}://${req.get("host")}`;
  res.type("application/xml").send(
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    `<url><loc>${base}/</loc><priority>1.0</priority><changefreq>weekly</changefreq></url>\n` +
    `<url><loc>${base}/categories.html</loc><priority>0.8</priority><changefreq>weekly</changefreq></url>\n` +
    `<url><loc>${base}/directory.html</loc><priority>0.8</priority><changefreq>weekly</changefreq></url>\n` +
    `<url><loc>${base}/directory-apply.html</loc><priority>0.7</priority><changefreq>monthly</changefreq></url>\n` +
    `<url><loc>${base}/directory-status.html</loc><priority>0.6</priority><changefreq>monthly</changefreq></url>\n` +
    `<url><loc>${base}/my.html</loc><priority>0.6</priority><changefreq>monthly</changefreq></url>\n` +
    `<url><loc>${base}/login.html</loc><priority>0.4</priority><changefreq>yearly</changefreq></url>\n` +
    `<url><loc>${base}/register.html</loc><priority>0.4</priority><changefreq>yearly</changefreq></url>\n` +
    '</urlset>'
  );
});

// 404：所有未匹配路由（必须在 /health /robots.txt /sitemap.xml 之后）
app.use(notFoundHandler);

// CORS 错误处理
app.use(corsErrorHandler);

// CSRF 错误处理
app.use(csrfErrorHandler);

// Sentry 错误处理（必须在其他错误处理中间件之前）
app.use(sentryErrorHandler());

// 全局错误处理中间件
app.use(errorHandler);

// 启动时初始化/自愈数据库结构（MySQL 不可用时仅告警，不阻断启动，JSON 降级仍可用）
// 导出 app 供 supertest 集成测试直接引入，测试时不占用任何端口
export default app;

// 仅在非测试环境下启动监听并初始化数据库结构
// （测试通过 jest.setup.js 注入 NODE_ENV=test，走 JSON 降级存储）
if (config.env !== "test") {
  initDatabase()
    .then(() => logger.info("数据库结构已就绪"))
    .catch((err) => logger.warn({ err }, "数据库初始化跳过（MySQL 不可用，将使用 JSON 降级）"))
    .finally(() => {
      app.listen(config.port, () => {
        logger.info(`Alliance website server running at http://localhost:${config.port}`);
        logger.info(`Environment: ${config.env}`);
        logger.info(`Database: ${config.mysql.host}:${config.mysql.port}/${config.mysql.database}`);
      });
    });
}
