import os from "os";
import { pool, isDatabaseAvailable } from "../db.js";
import { logger } from "./logger.js";

/**
 * 性能监控数据收集
 */
export async function getPerformanceMetrics() {
  const metrics = {
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    node: {
      version: process.version,
      platform: process.platform,
      arch: process.arch,
      pid: process.pid,
    },
    memory: {
      heapTotal: process.memoryUsage().heapTotal,
      heapUsed: process.memoryUsage().heapUsed,
      external: process.memoryUsage().external,
      rss: process.memoryUsage().rss,
      heapUsagePercent: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100),
    },
    cpu: {
      usage: process.cpuUsage(),
      loadAverage: os.loadavg(),
    },
    system: {
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      memoryUsagePercent: Math.round(((os.totalmem() - os.freemem()) / os.totalmem()) * 100),
      cpus: os.cpus().length,
      uptime: os.uptime(),
    },
    database: {
      available: false,
      connectionCount: 0,
      responseTime: null,
    },
  };

  // 数据库状态检查
  if (await isDatabaseAvailable()) {
    try {
      const startTime = Date.now();
      const connection = await pool.getConnection();
      const [rows] = await connection.query("SHOW STATUS LIKE 'Threads_connected'");
      connection.release();
      
      metrics.database.available = true;
      metrics.database.responseTime = Date.now() - startTime;
      metrics.database.connectionCount = parseInt(rows[0]?.Value || 0);
    } catch (error) {
      logger.error({ error: error.message }, "数据库健康检查失败");
      metrics.database.error = error.message;
    }
  }

  return metrics;
}

/**
 * 健康检查端点
 */
export async function healthCheck(req, res) {
  try {
    const dbAvailable = await isDatabaseAvailable();
    
    if (dbAvailable) {
      const connection = await pool.getConnection();
      await connection.query("SELECT 1");
      connection.release();
    }

    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbAvailable ? "connected" : "unavailable",
    });
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
}

/**
 * 就绪检查端点（Kubernetes Readiness Probe）
 */
export async function readinessCheck(req, res) {
  try {
    const dbAvailable = await isDatabaseAvailable();
    
    if (!dbAvailable) {
      // 数据库不可用时，服务仍然可以运行（降级模式）
      return res.json({
        status: "ready",
        mode: "degraded",
        message: "服务运行在降级模式（无数据库）",
      });
    }

    const connection = await pool.getConnection();
    await connection.query("SELECT 1");
    connection.release();

    res.json({
      status: "ready",
      mode: "normal",
      database: "connected",
    });
  } catch (error) {
    res.status(503).json({
      status: "not_ready",
      error: error.message,
    });
  }
}

/**
 * 存活检查端点（Kubernetes Liveness Probe）
 */
export function livenessCheck(req, res) {
  res.json({
    status: "alive",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}

/**
 * 性能监控中间件
 */
export function performanceMonitor(req, res, next) {
  const startTime = Date.now();
  
  // 响应完成后记录性能数据
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    
    // 记录慢请求（超过 1 秒）
    if (duration > 1000) {
      logger.warn({
        method: req.method,
        url: req.url,
        status: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip,
      }, "慢请求警告");
    }
    
    // 添加响应时间头（仅在响应未发送时）
    if (!res.headersSent) {
      res.setHeader("X-Response-Time", `${duration}ms`);
    }
  });
  
  next();
}
