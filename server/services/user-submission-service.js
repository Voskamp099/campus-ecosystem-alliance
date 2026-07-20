/**
 * 用户发布服务
 * 管理用户发布的活动和实习实践内容，支持审核状态流转
 */
import { isDatabaseAvailable } from "../db.js";
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
  logger.info({ title: item.title, status: "pending" }, "新活动发布（待审核）");
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
  logger.info({ title: item.title, status: "pending" }, "新实习实践发布（待审核）");
  return item;
}

// 获取已审核通过的内容（前台展示用）
export async function getApprovedEvents() {
  const items = loadJson(EVENTS_FILE, []);
  return items.filter(i => i.status === STATUS.APPROVED);
}

export async function getApprovedRecruits() {
  const items = loadJson(RECRUITS_FILE, []);
  return items.filter(i => i.status === STATUS.APPROVED);
}

// 获取用户自己的发布（个人中心用）
export async function getUserEvents(userId) {
  const items = loadJson(EVENTS_FILE, []);
  return items.filter(i => i.user_id === userId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export async function getUserRecruits(userId) {
  const items = loadJson(RECRUITS_FILE, []);
  return items.filter(i => i.user_id === userId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

// ========== Admin 接口 ==========

export async function listPendingEvents() {
  const items = loadJson(EVENTS_FILE, []);
  return items.filter(i => i.status === STATUS.PENDING).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export async function listPendingRecruits() {
  const items = loadJson(RECRUITS_FILE, []);
  return items.filter(i => i.status === STATUS.PENDING).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export async function listAllUserEvents() {
  const items = loadJson(EVENTS_FILE, []);
  return items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export async function listAllUserRecruits() {
  const items = loadJson(RECRUITS_FILE, []);
  return items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

// 审核通过
export async function approveEvent(id) {
  return updateItemStatus(EVENTS_FILE, id, STATUS.APPROVED);
}

export async function approveRecruit(id) {
  return updateItemStatus(RECRUITS_FILE, id, STATUS.APPROVED);
}

// 审核拒绝
export async function rejectEvent(id, note = "") {
  return updateItemStatus(EVENTS_FILE, id, STATUS.REJECTED, note);
}

export async function rejectRecruit(id, note = "") {
  return updateItemStatus(RECRUITS_FILE, id, STATUS.REJECTED, note);
}

// 删除
export async function deleteUserEvent(id) {
  return deleteItem(EVENTS_FILE, id);
}

export async function deleteUserRecruit(id) {
  return deleteItem(RECRUITS_FILE, id);
}

// ========== 内部工具 ==========

function getNextId(arr) {
  if (arr.length === 0) return 1;
  return Math.max(...arr.map(i => i.id)) + 1;
}

function updateItemStatus(filename, id, status, reviewNote = "") {
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

function deleteItem(filename, id) {
  const items = loadJson(filename, []);
  const idx = items.findIndex(i => i.id === id);
  if (idx === -1) throw new Error("内容不存在");
  items.splice(idx, 1);
  saveJson(filename, items);
  return true;
}

export { STATUS, STATUS_LABELS };
