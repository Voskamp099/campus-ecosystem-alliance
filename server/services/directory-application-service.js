import { pool, isDatabaseAvailable } from "../db.js";
import { loadJson, saveJson } from "./json-store.js";
import { logger } from "../utils/logger.js";

const ALLOWED_DIRECTORY_TYPES = new Set(["campus", "government", "company"]);
const APPLICATIONS_FILE = "directory_applications.json";

function normalizeText(value, max = 255) {
  return String(value || "").trim().slice(0, max);
}

function mapRow(row) {
  return {
    id: row.id,
    directoryType: row.directory_type,
    trackingCode: row.tracking_code || "",
    targetTitle: row.target_title,
    targetMeta: row.target_meta,
    applicantName: row.applicant_name,
    applicantOrg: row.applicant_org,
    applicantRole: row.applicant_role,
    phone: row.phone,
    wechat: row.wechat,
    email: row.email,
    cooperationIntent: row.cooperation_intent,
    message: row.message || "",
    status: row.status,
    statusNote: row.status_note || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function normalizePhone(value) {
  return String(value || "").trim().replace(/\s+/g, "");
}

function normalizeStatus(value) {
  const status = normalizeText(value, 32);
  const allowed = new Set(["pending", "reviewing", "matched", "contacted", "completed", "rejected"]);
  if (!allowed.has(status)) {
    throw new Error("无效的申请状态");
  }
  return status;
}

function generateTrackingCode() {
  const stamp = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `DX${stamp}${random}`;
}

function validatePayload(payload = {}) {
  const directoryType = normalizeText(payload.directoryType, 32);
  if (!ALLOWED_DIRECTORY_TYPES.has(directoryType)) {
    throw new Error("请选择正确的对接类型");
  }

  const applicantName = normalizeText(payload.applicantName, 128);
  const applicantOrg = normalizeText(payload.applicantOrg, 255);
  const applicantRole = normalizeText(payload.applicantRole, 255);
  const phone = normalizeText(payload.phone, 64);
  const wechat = normalizeText(payload.wechat, 128);
  const email = normalizeText(payload.email, 255);
  const targetTitle = normalizeText(payload.targetTitle, 255);
  const targetMeta = normalizeText(payload.targetMeta, 255);
  const cooperationIntent = normalizeText(payload.cooperationIntent, 255);
  const message = String(payload.message || "").trim().slice(0, 5000);

  if (!targetTitle) {
    throw new Error("缺少对接对象信息，请返回名录页重新发起");
  }
  if (!applicantName) {
    throw new Error("请填写联系人姓名");
  }
  if (!cooperationIntent) {
    throw new Error("请填写合作意向");
  }
  if (!message) {
    throw new Error("请填写对接说明");
  }
  if (!phone && !wechat && !email) {
    throw new Error("请至少填写一种联系方式");
  }

  return {
    directoryType,
    targetTitle,
    targetMeta,
    applicantName,
    applicantOrg,
    applicantRole,
    phone,
    wechat,
    email,
    cooperationIntent,
    message
  };
}

function loadApplications() {
  return loadJson(APPLICATIONS_FILE, []);
}

function saveApplications(apps) {
  return saveJson(APPLICATIONS_FILE, apps);
}

function getNextId(apps) {
  if (apps.length === 0) return 1;
  return Math.max(...apps.map(a => a.id)) + 1;
}

export async function createDirectoryApplication(payload) {
  const data = validatePayload(payload);
  
  if (!(await isDatabaseAvailable())) {
    // JSON 文件持久化
    const apps = loadApplications();
    const now = new Date().toISOString();
    const item = {
      id: getNextId(apps),
      directory_type: data.directoryType,
      tracking_code: generateTrackingCode(),
      target_title: data.targetTitle,
      target_meta: data.targetMeta,
      applicant_name: data.applicantName,
      applicant_org: data.applicantOrg,
      applicant_role: data.applicantRole,
      phone: data.phone,
      wechat: data.wechat,
      email: data.email,
      cooperation_intent: data.cooperationIntent,
      message: data.message,
      status: 'pending',
      status_note: '',
      created_at: now,
      updated_at: now
    };
    apps.push(item);
    saveApplications(apps);
    logger.info({ targetTitle: data.targetTitle, applicantName: data.applicantName }, "新对接申请（JSON 模式）");
    return mapRow(item);
  }
  
  const [result] = await pool.query(
    `INSERT INTO directory_applications (
      directory_type, tracking_code, target_title, target_meta, applicant_name, applicant_org, applicant_role,
      phone, wechat, email, cooperation_intent, message, status, status_note
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', '')`,
    [
      data.directoryType,
      generateTrackingCode(),
      data.targetTitle,
      data.targetMeta,
      data.applicantName,
      data.applicantOrg,
      data.applicantRole,
      data.phone,
      data.wechat,
      data.email,
      data.cooperationIntent,
      data.message
    ]
  );
  const [rows] = await pool.query("SELECT * FROM directory_applications WHERE id = ?", [result.insertId]);
  return mapRow(rows[0]);
}

export async function listDirectoryApplications() {
  if (!(await isDatabaseAvailable())) {
    return loadApplications().map(mapRow);
  }
  
  const [rows] = await pool.query(
    "SELECT * FROM directory_applications ORDER BY created_at DESC, id DESC"
  );
  return rows.map(mapRow);
}

export async function updateDirectoryApplication(id, payload = {}) {
  const status = normalizeStatus(payload.status);
  const statusNote = normalizeText(payload.statusNote, 500);

  if (!(await isDatabaseAvailable())) {
    const apps = loadApplications();
    const index = apps.findIndex(item => Number(item.id) === Number(id));
    if (index < 0) throw new Error("对接申请不存在");
    apps[index] = {
      ...apps[index],
      status,
      status_note: statusNote,
      updated_at: new Date().toISOString()
    };
    saveApplications(apps);
    return mapRow(apps[index]);
  }

  await pool.query(
    "UPDATE directory_applications SET status = ?, status_note = ? WHERE id = ?",
    [status, statusNote, id]
  );
  const [rows] = await pool.query("SELECT * FROM directory_applications WHERE id = ?", [id]);
  if (!rows[0]) throw new Error("对接申请不存在");
  return mapRow(rows[0]);
}

export async function queryDirectoryApplicationProgress(payload = {}) {
  const trackingCode = normalizeText(payload.trackingCode, 32).toUpperCase();
  const phone = normalizePhone(payload.phone);
  const wechat = normalizeText(payload.wechat, 128);
  const email = normalizeText(payload.email, 255);

  if (!trackingCode) {
    throw new Error("请输入查询编号");
  }
  if (!phone && !wechat && !email) {
    throw new Error("请至少填写一种联系方式用于核验");
  }

  if (!(await isDatabaseAvailable())) {
    const apps = loadApplications();
    const item = apps.find(row =>
      String(row.tracking_code || "").toUpperCase() === trackingCode &&
      ((phone && normalizePhone(row.phone) === phone) ||
        (wechat && String(row.wechat || "") === wechat) ||
        (email && String(row.email || "") === email))
    );
    if (!item) throw new Error("没有找到匹配的对接申请，请检查查询编号和联系方式");
    return mapRow(item);
  }

  const conditions = [];
  const values = [trackingCode];
  if (phone) {
    conditions.push("phone = ?");
    values.push(phone);
  }
  if (wechat) {
    conditions.push("wechat = ?");
    values.push(wechat);
  }
  if (email) {
    conditions.push("email = ?");
    values.push(email);
  }
  const [rows] = await pool.query(
    `SELECT * FROM directory_applications
     WHERE UPPER(tracking_code) = ?
       AND (${conditions.join(" OR ")})
     ORDER BY id DESC
     LIMIT 1`,
    values
  );
  if (!rows[0]) {
    throw new Error("没有找到匹配的对接申请，请检查查询编号和联系方式");
  }
  return mapRow(rows[0]);
}
