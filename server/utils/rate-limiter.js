import rateLimit from "express-rate-limit";
import { config } from "../config.js";
import { logger } from "./logger.js";

/**
 * 通用 API 限流
 * 默认：每个 IP 在 15 分钟内最多 100 次请求
 */
export const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "请求过于频繁，请稍后再试",
    },
  },
  standardHeaders: true, // 返回 `RateLimit-*` 标准头
  legacyHeaders: false, // 禁用 `X-RateLimit-*` 旧版头
  handler: (req, res) => {
    logger.warn({
      ip: req.ip,
      method: req.method,
      url: req.originalUrl,
      message: "Rate limit exceeded",
    });
    res.status(429).json({
      success: false,
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: "请求过于频繁，请稍后再试",
      },
    });
  },
});

/**
 * 登录接口限流（更严格）
 * 开发环境：每个 IP 在 15 分钟内最多 50 次登录尝试
 * 生产环境：每个 IP 在 15 分钟内最多 5 次登录尝试
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: process.env.NODE_ENV === 'production' ? 5 : 50, // 开发环境放宽限制
  message: {
    success: false,
    error: {
      code: "TOO_MANY_LOGIN_ATTEMPTS",
      message: "登录尝试次数过多，请 15 分钟后再试",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // 成功的请求不计入限制
  handler: (req, res) => {
    logger.warn({
      ip: req.ip,
      message: "Too many login attempts",
    });
    res.status(429).json({
      success: false,
      error: {
        code: "TOO_MANY_LOGIN_ATTEMPTS",
        message: "登录尝试次数过多，请 15 分钟后再试",
      },
    });
  },
});

/**
 * 注册接口限流
 * 开发环境：每个 IP 在 1 小时内最多 30 次注册尝试
 * 生产环境：每个 IP 在 1 小时内最多 3 次注册尝试
 */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 小时
  max: process.env.NODE_ENV === 'production' ? 3 : 30, // 开发环境放宽限制
  message: {
    success: false,
    error: {
      code: "TOO_MANY_REGISTRATIONS",
      message: "注册请求过于频繁，请 1 小时后再试",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn({
      ip: req.ip,
      message: "Too many registration attempts",
    });
    res.status(429).json({
      success: false,
      error: {
        code: "TOO_MANY_REGISTRATIONS",
        message: "注册请求过于频繁，请 1 小时后再试",
      },
    });
  },
});

/**
 * 文件上传限流
 * 每个 IP 在 1 小时内最多 20 次上传
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 小时
  max: 20, // 最多 20 次上传
  message: {
    success: false,
    error: {
      code: "UPLOAD_LIMIT_EXCEEDED",
      message: "上传次数过多，请稍后再试",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn({
      ip: req.ip,
      message: "Upload rate limit exceeded",
    });
    res.status(429).json({
      success: false,
      error: {
        code: "UPLOAD_LIMIT_EXCEEDED",
        message: "上传次数过多，请稍后再试",
      },
    });
  },
});

export default {
  apiLimiter,
  loginLimiter,
  registerLimiter,
  uploadLimiter,
};
