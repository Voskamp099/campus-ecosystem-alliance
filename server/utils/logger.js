import pino from "pino";
import { config } from "../config.js";

const isDev = process.env.NODE_ENV !== "production";

// 日志级别：trace < debug < info < warn < error < fatal
const level = config.logLevel || (isDev ? "debug" : "info");

const transport = isDev
  ? {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
      },
    }
  : undefined;

export const logger = pino({
  level,
  transport,
  serializers: {
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
    err: pino.stdSerializers.err,
  },
});

// 请求日志中间件
export function requestLogger(req, res, next) {
  const start = Date.now();
  
  res.on("finish", () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress,
    };
    
    // 只记录慢请求和错误
    if (res.statusCode >= 400) {
      logger.error(logData, "Request error");
    } else if (duration > 1000) {
      logger.warn(logData, "Slow request");
    } else if (config.logLevel === "debug") {
      logger.debug(logData, "Request completed");
    }
  });
  
  next();
}

// 错误日志包装器
export function logError(error, context = {}) {
  logger.error({ err: error, ...context }, error.message || "Unknown error");
}

// 性能监控
export function logPerformance(operation, duration, metadata = {}) {
  if (duration > 1000) {
    logger.warn({ operation, duration, ...metadata }, "Slow operation");
  } else {
    logger.debug({ operation, duration, ...metadata }, "Performance metric");
  }
}

export default logger;
