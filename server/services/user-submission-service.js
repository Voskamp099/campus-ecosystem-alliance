/**
 * 用户发布服务
 * 管理用户发布的活动和实习实践内容，支持审核状态流转
 * 双通道：MySQL 优先，JSON 文件降级
 */
import { pool, isDatabaseAvailable } from "../db.js";
import { loadJson, saveJson } from "./json-store.js";
import { logger } from "../utils/logger.js";

const EVENTS_FILE = "user_events.json";
const RECRUITS_FILE = "user_recruits.json";

const STATUS = {
  PENDING: "pending",     // 待审核
  APPROVED: "approved",   // 已通过
  REJECTED: "rejected"    // 已拒绝
};

const STATUS_LABELS = {
  pending: "待审核",
  approved: "已通过",
  rejected: "已拒绝"
};

// ========== 行映射：DB 列名 -> 前端字段名 ==========

function mapEventRow(row) {
  return {
    id: row.id,
    user_id: row.user_id,
    user_name: row.user_name || "",
    user_org: row.user_org || "",
    title: row.title,
    meta: row.meta || "",
    desc: row.description || "",
    image: row.image_url || "",
    link: row.link_url || "",
    event_date: row.event_date || "",
    event_location: row.event_location || "",
    max_participants: row.max_participants || 0,
    status: row.status,
    review_note: row.reject_reason || "",
    reviewed_at: row.reviewed_at || null,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

function mapRecruitRow(row) {
  return {
    id: row.id,
    user_id: row.user_id,
    user_name: row.user_name || "",
    user_org: row.user_org || "",
    title: row.title,
    meta: row.meta || "",
    desc: row.description || "",
    image: row.image_url || "",
    link: row.link_url || "",
    opportunity_type: row.opportunity_type || "internship",
    status: row.status,
    review_note: row.reject_reason || "",
    reviewed_at: row.reviewed_at || null,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

// ========== 活动 ==========

export async function createEvent(payload) {
  const {
    userId,
    userName,
    userOrg,
    title,
    meta,
    desc,
    image,
    link,
    eventDate,
    eventLocation,
    maxParticipants
  } = payload;

  if (!title?.trim()) throw new Error("活动标题不能为空");
  if (!desc?.trim()) throw new Error("活动描述不能为空");

  const now = new Date().toISOString();

  if (await isDatabaseAvailable()) {
    const [result] = await pool.query(
      `INSERT INTO user_events
        (user_id, user_name, user_org, title, meta, description, image_url, link_url,
         event_date, event_location, max_participants, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        userId || null,
        userName || "",
        userOrg || "",
        title.trim(),
        (meta || "用户发布").trim(),
        desc.trim(),
        image || "",
        link || "",
        eventDate || "",
        eventLocation || "",
        maxParticipants || 0
      ]
    );
    const [rows] = await pool.query("SELECT * FROM user_events WHERE id = ?", [result.insertId]);
    logger.info({ id: result.insertId, title: title.trim(), status: "pending" }, "新活动发布（待审核）");
    return mapEventRow(rows[0]);
  }

  // 降级：JSON 文件
  const item = {
    id: getNextId(loadJson(EVENTS_FILE, [])),
    user_id: userId || null,
    user_name: userName || "",
    user_org: userOrg || "",
    title: title.trim(),
    meta: (meta || "用户发布").trim(),
    desc: desc.trim(),
    image: image || "",
    link: link || "",
    event_date: eventDate || "",
    event_location: eventLocation || "",
    max_participants: maxParticipants || 0,
    status: STATUS.PENDING,
    created_at: now,
    updated_at: now,
    reviewed_at: null,
    review_note: ""
  };

  const items = loadJson(EVENTS_FILE, []);
  items.push(item);
  saveJson(EVENTS_FILE, items);
  logger.info({ title: item.title, status: "pending" }, "新活动发布（待审核，JSON 模式）");
  return item;
}

export async function createRecruit(payload) {
  const {
    userId,
    userName,
    userOrg,
    title,
    meta,
    desc,
    image,
    link,
    opportunityType
  } = payload;

  if (!title?.trim()) throw new Error("职位标题不能为空");
  if (!desc?.trim()) throw new Error("职位描述不能为空");

  const now = new Date().toISOString();

  if (await isDatabaseAvailable()) {
    const [result] = await pool.query(
      `INSERT INTO user_recruits
        (user_id, user_name, user_org, title, meta, description, image_url, link_url,
         opportunity_type, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        userId || null,
        userName || "",
        userOrg || "",
        title.trim(),
        (meta || "用户发布").trim(),
        desc.trim(),
        image || "",
        link || "",
        opportunityType || "internship"
      ]
    );
    const [rows] = await pool.query("SELECT * FROM user_recruits WHERE id = ?", [result.insertId]);
    logger.info({ id: result.insertId, title: title.trim(), status: "pending" }, "新实习实践发布（待审核）");
    return mapRecruitRow(rows[0]);
  }

  // 降级：JSON 文件
  const item = {
    id: getNextId(loadJson(RECRUITS_FILE, [])),
    user_id: userId || null,
    user_name: userName || "",
    user_org: userOrg || "",
    title: title.trim(),
    meta: (meta || "用户发布").trim(),
    desc: desc.trim(),
    image: image || "",
    link: link || "",
    opportunity_type: opportunityType || "internship",
    status: STATUS.PENDING,
    created_at: now,
    updated_at: now,
    reviewed_at: null,
    review_note: ""
  };

  const items = loadJson(RECRUITS_FILE, []);
  items.push(item);
  saveJson(RECRUITS_FILE, items);
  logger.info({ title: item.title, status: "pending" }, "新实习实践发布（待审核，JSON 模式）");
  return item;
}

// 获取已审核通过的内容（前台展示用）
export async function getApprovedEvents() {
  if (await isDatabaseAvailable()) {
    const [rows] = await pool.query(
      "SELECT * FROM user_events WHERE status = 'approved' ORDER BY created_at DESC"
    );
    return rows.map(mapEventRow);
  }
  const items = loadJson(EVENTS_FILE, []);
  return items.filter(i => i.status === STATUS.APPROVED);
}

export async function getApprovedRecruits() {
  if (await isDatabaseAvailable()) {
    const [rows] = await pool.query(
      "SELECT * FROM user_recruits WHERE status = 'approved' ORDER BY created_at DESC"
    );
    return rows.map(mapRecruitRow);
  }
  const items = loadJson(RECRUITS_FILE, []);
  return items.filter(i => i.status === STATUS.APPROVED);
}

// 获取用户自己的发布（个人中心用）
export async function getUserEvents(userId) {
  if (await isDatabaseAvailable()) {
    const [rows] = await pool.query(
      "SELECT * FROM user_events WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );
    return rows.map(mapEventRow);
  }
  const items = loadJson(EVENTS_FILE, []);
  return items.filter(i => i.user_id === userId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export async function getUserRecruits(userId) {
  if (await isDatabaseAvailable()) {
    const [rows] = await pool.query(
      "SELECT * FROM user_recruits WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );
    return rows.map(mapRecruitRow);
  }
  const items = loadJson(RECRUITS_FILE, []);
  return items.filter(i => i.user_id === userId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

// ========== Admin 接口 ==========

export async function listPendingEvents() {
  if (await isDatabaseAvailable()) {
    const [rows] = await pool.query(
      "SELECT * FROM user_events WHERE status = 'pending' ORDER BY created_at DESC"
    );
    return rows.map(mapEventRow);
  }
  const items = loadJson(EVENTS_FILE, []);
  return items.filter(i => i.status === STATUS.PENDING).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export async function listPendingRecruits() {
  if (await isDatabaseAvailable()) {
    const [rows] = await pool.query(
      "SELECT * FROM user_recruits WHERE status = 'pending' ORDER BY created_at DESC"
    );
    return rows.map(mapRecruitRow);
  }
  const items = loadJson(RECRUITS_FILE, []);
  return items.filter(i => i.status === STATUS.PENDING).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export async function listAllUserEvents() {
  if (await isDatabaseAvailable()) {
    const [rows] = await pool.query("SELECT * FROM user_events ORDER BY created_at DESC");
    return rows.map(mapEventRow);
  }
  const items = loadJson(EVENTS_FILE, []);
  return items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export async function listAllUserRecruits() {
  if (await isDatabaseAvailable()) {
    const [rows] = await pool.query("SELECT * FROM user_recruits ORDER BY created_at DESC");
    return rows.map(mapRecruitRow);
  }
  const items = loadJson(RECRUITS_FILE, []);
  return items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

// 审核通过
export async function approveEvent(id) {
  return updateItemStatus("event", EVENTS_FILE, id, STATUS.APPROVED);
}

export async function approveRecruit(id) {
  return updateItemStatus("recruit", RECRUITS_FILE, id, STATUS.APPROVED);
}

// 审核拒绝
export async function rejectEvent(id, note = "") {
  return updateItemStatus("event", EVENTS_FILE, id, STATUS.REJECTED, note);
}

export async function rejectRecruit(id, note = "") {
  return updateItemStatus("recruit", RECRUITS_FILE, id, STATUS.REJECTED, note);
}

// 删除
export async function deleteUserEvent(id) {
  return deleteItem("event", EVENTS_FILE, id);
}

export async function deleteUserRecruit(id) {
  return deleteItem("recruit", RECRUITS_FILE, id);
}

// ========== 内部工具 ==========

function getNextId(arr) {
  if (arr.length === 0) return 1;
  return Math.max(...arr.map(i => i.id)) + 1;
}

async function updateItemStatus(type, filename, id, status, reviewNote = "") {
  const table = type === "event" ? "user_events" : "user_recruits";
  const mapFn = type === "event" ? mapEventRow : mapRecruitRow;

  if (await isDatabaseAvailable()) {
    const [result] = await pool.query(
      `UPDATE ${table} SET status = ?, reject_reason = ?, reviewed_at = NOW() WHERE id = ?`,
      [status, reviewNote, id]
    );
    if (result.affectedRows === 0) throw new Error("内容不存在");
    const [rows] = await pool.query(`SELECT * FROM ${table} WHERE id = ?`, [id]);
    return mapFn(rows[0]);
  }

  // 降级：JSON 文件
  const items = loadJson(filename, []);
  const idx = items.findIndex(i => i.id === id);
  if (idx === -1) throw new Error("内容不存在");
  items[idx].status = status;
  items[idx].updated_at = new Date().toISOString();
  items[idx].reviewed_at = new Date().toISOString();
  items[idx].review_note = reviewNote;
  saveJson(filename, items);
  return items[idx];
}

async function deleteItem(type, filename, id) {
  const table = type === "event" ? "user_events" : "user_recruits";

  if (await isDatabaseAvailable()) {
    const [result] = await pool.query(`DELETE FROM ${table} WHERE id = ?`, [id]);
    if (result.affectedRows === 0) throw new Error("内容不存在");
    return true;
  }

  // 降级：JSON 文件
  const items = loadJson(filename, []);
  const idx = items.findIndex(i => i.id === id);
  if (idx === -1) throw new Error("内容不存在");
  items.splice(idx, 1);
  saveJson(filename, items);
  return true;
}

export { STATUS, STATUS_LABELS };
