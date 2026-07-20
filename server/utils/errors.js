import { logger } from "./logger.js";

/**
 * 自定义应用错误类
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, code = "INTERNAL_ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true; // 可预期的错误
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 常见错误类型
 */
export class ValidationError extends AppError {
  constructor(message = "数据验证失败") {
    super(message, 400, "VALIDATION_ERROR");
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "未授权访问") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "禁止访问") {
    super(message, 403, "FORBIDDEN");
  }
}

export class NotFoundError extends AppError {
  constructor(message = "资源不存在") {
    super(message, 404, "NOT_FOUND");
  }
}

export class ConflictError extends AppError {
  constructor(message = "资源冲突") {
    super(message, 409, "CONFLICT");
  }
}

export class DatabaseError extends AppError {
  constructor(message = "数据库操作失败") {
    super(message, 503, "DATABASE_ERROR");
  }
}

/**
 * 异步路由处理器包装器
 * 自动捕获异步错误并传递给错误处理中间件
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * 404 处理中间件
 */
export function notFoundHandler(req, res, next) {
  const error = new NotFoundError(`路由 ${req.originalUrl} 不存在`);
  next(error);
}

/**
 * 全局错误处理中间件
 */
export function errorHandler(error, req, res, next) {
  // 如果响应已经发送，交给 Express 默认错误处理
  if (res.headersSent) {
    return next(error);
  }

  let statusCode = error.statusCode || 500;
  let code = error.code || "INTERNAL_ERROR";
  let message = error.message || "服务器内部错误";

  // MySQL 错误处理
  if (error.code === "ECONNREFUSED" || error.code === "ER_ACCESS_DENIED_ERROR") {
    statusCode = 503;
    code = "DATABASE_UNAVAILABLE";
    message = "数据库服务暂时不可用";
  }

  // JWT 错误处理
  if (error.name === "JsonWebTokenError") {
    statusCode = 401;
    code = "INVALID_TOKEN";
    message = "无效的认证令牌";
  } else if (error.name === "TokenExpiredError") {
    statusCode = 401;
    code = "TOKEN_EXPIRED";
    message = "认证令牌已过期";
  }

  // Multer 文件上传错误
  if (error.code === "LIMIT_FILE_SIZE") {
    statusCode = 400;
    code = "FILE_TOO_LARGE";
    message = "文件大小超出限制";
  } else if (error.code === "LIMIT_UNEXPECTED_FILE") {
    statusCode = 400;
    code = "UNEXPECTED_FILE";
    message = "意外的文件字段";
  }

  // 验证错误（Joi、express-validator 等）
  if (error.name === "ValidationError") {
    statusCode = 400;
    code = "VALIDATION_ERROR";
    message = error.details?.[0]?.message || error.message;
  }

  // 记录错误日志
  const logData = {
    code,
    statusCode,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    stack: error.stack,
  };

  if (statusCode >= 500) {
    logger.error(logData, message);
  } else {
    logger.warn(logData, message);
  }

  // 生产环境隐藏敏感错误信息
  const isDev = process.env.NODE_ENV !== "production";
  const response = {
    success: false,
    error: {
      code,
      message,
    },
  };

  if (isDev) {
    response.error.stack = error.stack;
    response.error.details = error.details || null;
  }

  res.status(statusCode).json(response);
}

export default {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  DatabaseError,
  asyncHandler,
  notFoundHandler,
  errorHandler,
};
