import * as Sentry from "@sentry/node";
import { config } from "../config.js";
import { logger } from "./logger.js";

/**
 * Sentry 错误追踪初始化
 */
export function initSentry() {
  if (!config.sentryDsn) {
    logger.debug("Sentry DSN 未配置，跳过错误追踪初始化");
    return false;
  }

  Sentry.init({
    dsn: config.sentryDsn,
    environment: config.env,
    
    // 性能监控采样率
    tracesSampleRate: config.isProduction ? 0.1 : 1.0,
    
    // 忽略特定错误
    ignoreErrors: [
      // 网络错误
      "NetworkError",
      "Network request failed",
      // 取消请求
      "cancelled",
      "canceled",
      // 超时
      "Timeout",
      "ETIMEDOUT",
      // 客户端错误（4xx）
      "Bad Request",
      "Unauthorized",
      "Forbidden",
      "Not Found",
    ],
    
    // 在发送前处理事件
    beforeSend(event, hint) {
      // 过滤敏感信息
      if (event.request) {
        delete event.request.cookies;
        if (event.request.headers) {
          delete event.request.headers.authorization;
          delete event.request.headers.cookie;
        }
      }
      
      // 过滤请求体中的敏感字段
      if (event.request?.data) {
        const sensitiveFields = ["password", "password_hash", "token", "secret", "apiKey"];
        try {
          const data = typeof event.request.data === "string" 
            ? JSON.parse(event.request.data) 
            : event.request.data;
          
          for (const field of sensitiveFields) {
            if (data[field]) {
              data[field] = "[Filtered]";
            }
          }
          event.request.data = JSON.stringify(data);
        } catch (e) {
          // 解析失败，保持原样
        }
      }
      
      return event;
    },
  });

  logger.info({ env: config.env }, "Sentry 错误追踪已初始化");
  return true;
}

/**
 * Sentry 错误处理中间件
 */
export function sentryErrorHandler() {
  return Sentry.expressErrorHandler({
    shouldHandleError(error) {
      // 只捕获 4xx 和 5xx 错误
      const statusCode = error.statusCode || error.status || 500;
      return statusCode >= 400;
    },
  });
}

/**
 * Sentry 请求处理中间件
 */
export function sentryRequestHandler() {
  return (req, res, next) => {
    // 设置用户上下文
    if (req.user) {
      Sentry.setUser({
        id: req.user.id,
        email: req.user.email,
        username: req.user.nickname || req.user.email,
      });
    }
    
    // 添加请求信息
    Sentry.setContext("request", {
      method: req.method,
      url: req.url,
      headers: req.headers,
      query: req.query,
      body: req.body,
    });
    
    next();
  };
}

/**
 * Sentry 事务处理中间件
 */
export function sentryTracingHandler() {
  return (req, res, next) => {
    // 开始事务
    const transaction = Sentry.startSpan({
      name: `${req.method} ${req.route?.path || req.path}`,
      op: "http.server",
    }, () => {
      next();
    });
    
    // 结束事务
    res.on("finish", () => {
      transaction?.end();
    });
  };
}

/**
 * 捕获异常
 */
export function captureException(error, context = {}) {
  Sentry.withScope((scope) => {
    if (context.user) {
      scope.setUser(context.user);
    }
    if (context.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }
    if (context.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }
    Sentry.captureException(error);
  });
}

/**
 * 捕获消息
 */
export function captureMessage(message, level = "info", context = {}) {
  Sentry.withScope((scope) => {
    if (context.user) {
      scope.setUser(context.user);
    }
    if (context.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }
    Sentry.captureMessage(message, level);
  });
}

/**
 * 设置用户上下文
 */
export function setUserContext(user) {
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.nickname || user.email,
    });
  } else {
    Sentry.setUser(null);
  }
}

export default Sentry;
