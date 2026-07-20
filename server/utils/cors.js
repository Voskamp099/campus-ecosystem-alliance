import cors from "cors";
import { config } from "../config.js";
import { logger } from "./logger.js";

/**
 * CORS 配置
 */
const corsOptions = {
  origin: (origin, callback) => {
    // 允许的源列表
    const allowedOrigins = config.cors.origin === "*" 
      ? true 
      : config.cors.origin.split(",").map(o => o.trim());

    // 开发环境允许所有源
    if (config.env === "development") {
      return callback(null, true);
    }

    // 生产环境严格检查
    if (allowedOrigins === true) {
      // 允许所有源（不推荐生产环境使用）
      callback(null, true);
    } else if (!origin) {
      // 允许同源请求（无 origin 头）
      callback(null, true);
    } else if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn({ origin, allowedOrigins }, "CORS blocked request");
      callback(new Error("不允许的源"));
    }
  },
  credentials: config.cors.credentials,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "X-CSRF-Token",
    "X-XSRF-Token",
  ],
  exposedHeaders: ["X-CSRF-Token"],
  maxAge: 86400, // 24 小时
  optionsSuccessStatus: 204,
};

/**
 * CORS 中间件
 */
export const corsMiddleware = cors(corsOptions);

/**
 * CORS 错误处理
 */
export function corsErrorHandler(error, req, res, next) {
  if (error.message === "不允许的源") {
    res.status(403).json({
      success: false,
      error: {
        code: "CORS_FORBIDDEN",
        message: "不允许的跨域请求",
      },
    });
  } else {
    next(error);
  }
}

export default {
  corsMiddleware,
  corsErrorHandler,
};
