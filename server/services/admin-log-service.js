/**
 * 管理员操作日志服务
 * 支持 MySQL 和 JSON 文件双模式存储
 */
import { isDatabaseAvailable, pool } from "../db.js";
import { loadJson, saveJson } from "./json-store.js";

const LOGS_FILE = "admin_logs.json";

const ACTION_LABELS = {
  create: "创建",
  update: "更新",
  delete: "删除",
  approve: "审核通过",
  reject: "审核拒绝",
  login: "登录",
  export: "导出",
  import: "导入"
};

/**
 * 返回操作的中文名称
 */
export function formatAction(action) {
  return ACTION_LABELS[action] || action;
}

/**
 * 从 req 中提取 IP 地址
 */
function extractIp(req) {
  if (!req) return "";
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.headers["x-real-ip"] ||
    req.socket?.remoteAddress ||
    ""
  );
}

/**
 * 记录一条操作日志
 */
export async function logAction({ adminId, adminName, action, targetType, targetId, detail, ip, req }) {
  const finalIp = ip || extractIp(req);
  const now = new Date().toISOString();

  if (await isDatabaseAvailable()) {
    await pool.query(
      `INSERT INTO admin_logs (admin_id, admin_name, action, target_type, target_id, detail, ip)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        adminId || null,
        adminName || "",
        action || "",
        targetType || "",
        targetId || null,
        detail || null,
        finalIp
      ]
    );
  } else {
    // JSON 降级模式
    const logs = loadJson(LOGS_FILE, []);
    const newId = logs.length > 0 ? Math.max(...logs.map(l => l.id)) + 1 : 1;
    logs.push({
      id: newId,
      admin_id: adminId || null,
      admin_name: adminName || "",
      action: action || "",
      target_type: targetType || "",
      target_id: targetId || null,
      detail: detail || null,
      ip: finalIp,
      created_at: now
    });
    saveJson(LOGS_FILE, logs);
  }
}

/**
 * 分页查询操作日志
 */
export async function getAdminLogs({ page = 1, pageSize = 20, action, adminName, startDate, endDate } = {}) {
  const p = Math.max(1, Number(page) || 1);
  const ps = Math.max(1, Math.min(100, Number(pageSize) || 20));
  const offset = (p - 1) * ps;

  if (await isDatabaseAvailable()) {
    // MySQL 模式 - 构建动态查询
    const conditions = [];
    const params = [];

    if (action) {
      conditions.push("action = ?");
      params.push(action);
    }
    if (adminName) {
      conditions.push("admin_name LIKE ?");
      params.push(`%${adminName}%`);
    }
    if (startDate) {
      conditions.push("created_at >= ?");
      params.push(startDate);
    }
    if (endDate) {
      conditions.push("created_at <= ?");
      params.push(endDate);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM admin_logs ${whereClause}`,
      params
    );

    const [items] = await pool.query(
      `SELECT * FROM admin_logs ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, ps, offset]
    );

    return {
      items: items.map(row => ({
        id: row.id,
        admin_id: row.admin_id,
        admin_name: row.admin_name,
        action: row.action,
        action_label: formatAction(row.action),
        target_type: row.target_type,
        target_id: row.target_id,
        detail: row.detail,
        ip: row.ip,
        created_at: row.created_at
      })),
      total,
      page: p,
      pageSize: ps
    };
  } else {
    // JSON 降级模式
    let logs = loadJson(LOGS_FILE, []);

    if (action) {
      logs = logs.filter(l => l.action === action);
    }
    if (adminName) {
      const lowerName = adminName.toLowerCase();
      logs = logs.filter(l => (l.admin_name || "").toLowerCase().includes(lowerName));
    }
    if (startDate) {
      logs = logs.filter(l => l.created_at >= startDate);
    }
    if (endDate) {
      logs = logs.filter(l => l.created_at <= endDate);
    }

    logs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const total = logs.length;
    const items = logs.slice(offset, offset + ps).map(l => ({
      id: l.id,
      admin_id: l.admin_id,
      admin_name: l.admin_name,
      action: l.action,
      action_label: formatAction(l.action),
      target_type: l.target_type,
      target_id: l.target_id,
      detail: l.detail,
      ip: l.ip,
      created_at: l.created_at
    }));

    return { items, total, page: p, pageSize: ps };
  }
}
