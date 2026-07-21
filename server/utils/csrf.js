import { doubleCsrf } from "csrf-csrf";
import { logger } from "./logger.js";

const isProduction = process.env.NODE_ENV === "production";

// HTTPS 判定：
//   1. 显式环境变量 HTTPS=true / FORCE_HTTPS=true 优先
//   2. 生产环境默认假设部署在 HTTPS 反向代理后（Render/Vercel/Nginx 等都是如此）
//   3. 开发环境默认 HTTP
// 非 HTTPS 时不能使用 __Host- 前缀和 secure 标记，否则浏览器会静默丢弃 cookie，
// 导致前端拿不到 CSRF token、所有 POST 请求返回 403。
const isHttps =
  process.env.HTTPS === "true" ||
  process.env.FORCE_HTTPS === "true" ||
  isProduction;

// __Host- 前缀要求 secure=true 且 path=/ 且不带 domain，仅 HTTPS 环境可用
const csrfCookieName = isHttps
  ? "__Host-psifi.x-csrf-token"
  : "psifi.x-csrf-token";

const { generateCsrfToken, validateRequest, doubleCsrfProtection } = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET || "csrf-secret-change-me-in-production",
  getSessionIdentifier: (req) => {
    const authHeader = req.headers.authorization || "";
    if (authHeader.startsWith("Bearer ")) {
      return authHeader.slice(7);
    }
    return `${req.ip || ""}:${req.headers["user-agent"] || ""}`;
  },
  cookieName: csrfCookieName,
  cookieOptions: {
    // lax 在同站 fetch 请求中会携带 cookie，比 strict 更兼容跨站跳转后首次访问
    sameSite: "lax",
    path: "/",
    secure: isHttps,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 小时
  },
  size: 64,
  ignoredMethods: ["GET", "HEAD", "OPTIONS"],
  getCsrfTokenFromRequest: (req) => {
    // 从请求头或请求体获取 CSRF token
    return (
      req.headers["x-csrf-token"] ||
      req.headers["x-xsrf-token"] ||
      (req.body && req.body._csrf)
    );
  },
});

// 导出所有需要的函数
export { generateCsrfToken as generateToken, validateRequest, doubleCsrfProtection };

/**
 * CSRF Token 生成中间件
 * 为每个请求生成新的 CSRF token
 */
export function csrfTokenMiddleware(req, res, next) {
  // 只为需要 CSRF 保护的请求生成 token
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    // 检查是否已经设置过 cookie
    const existingToken = req.cookies[csrfCookieName];
    if (!existingToken) {
      try {
        const token = generateCsrfToken(req, res);
        res.locals.csrfToken = token;
      } catch (error) {
        // 如果生成失败，忽略（可能是首次访问）
        logger.debug("CSRF token generation skipped");
      }
    } else {
      res.locals.csrfToken = existingToken;
    }
  }
  next();
}

/**
 * CSRF 错误处理中间件
 */
export function csrfErrorHandler(error, req, res, next) {
  if (error.code === "EBADCSRFTOKEN") {
    logger.warn({
      ip: req.ip,
      method: req.method,
      url: req.originalUrl,
      message: "CSRF token validation failed",
    });

    res.status(403).json({
      success: false,
      error: {
        code: "CSRF_TOKEN_INVALID",
        message: "安全验证失败，请刷新页面重试",
      },
    });
  } else {
    next(error);
  }
}

/**
 * 为前端提供 CSRF token 的路由
 */
export function csrfTokenRoute(req, res) {
  const token = generateCsrfToken(req, res);
  res.json({
    success: true,
    csrfToken: token,
  });
}

export default {
  doubleCsrfProtection,
  csrfTokenMiddleware,
  csrfErrorHandler,
  csrfTokenRoute,
  generateToken: generateCsrfToken,
};
