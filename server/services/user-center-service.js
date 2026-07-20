import { pool, isDatabaseAvailable } from "../db.js";
import { loadJson, saveJson } from "./json-store.js";
import { logger } from "../utils/logger.js";

// 统一的状态映射
const STATUS_MAP = {
  directory: {
    pending: { label: "联盟初审中", color: "#f59e0b" },
    reviewing: { label: "对接评估中", color: "#3b82f6" },
    matched: { label: "已转交对接", color: "#8b5cf6" },
    contacted: { label: "对接沟通中", color: "#0ea5e9" },
    completed: { label: "对接已完成", color: "#22c55e" },
    approved: { label: "对接已完成", color: "#22c55e" },
    rejected: { label: "当前暂不匹配", color: "#ef4444" }
  },
  activity: {
    pending: { label: "待确认", color: "#f59e0b" },
    confirmed: { label: "已确认", color: "#22c55e" },
    cancelled: { label: "已取消", color: "#6b7280" },
    rejected: { label: "未通过", color: "#ef4444" }
  },
  delivery: {
    pending: { label: "待处理", color: "#f59e0b" },
    reviewing: { label: "审核中", color: "#3b82f6" },
    accepted: { label: "已通过", color: "#22c55e" },
    rejected: { label: "未通过", color: "#ef4444" }
  }
};

const ACTIVITY_FILE = "activity_registrations.json";
const DELIVERY_FILE = "delivery_records.json";

function normalizePhone(phone) {
  return String(phone || "").trim().replace(/\s+/g, "");
}

function loadActivityRegs() {
  return loadJson(ACTIVITY_FILE, []);
}

function saveActivityRegs(data) {
  return saveJson(ACTIVITY_FILE, data);
}

function loadDeliveries() {
  return loadJson(DELIVERY_FILE, []);
}

function saveDeliveries(data) {
  return saveJson(DELIVERY_FILE, data);
}

function getNextId(arr) {
  if (arr.length === 0) return 1;
  return Math.max(...arr.map(item => item.id)) + 1;
}

// 查询用户的生态对接申请（支持 phone 或 userId）
export async function getUserDirectoryApplications(phone, userId) {
  if (await isDatabaseAvailable()) {
    let rows;
    if (userId) {
      [rows] = await pool.query(
        `SELECT 
          id, user_id as userId, directory_type as directoryType, tracking_code as trackingCode, target_title as targetTitle,
          target_meta as targetMeta, applicant_name as applicantName, applicant_org as applicantOrg,
          cooperation_intent as cooperationIntent, phone, status, status_note as statusNote, created_at as createdAt, updated_at as updatedAt
        FROM directory_applications 
        WHERE user_id = ? 
        ORDER BY created_at DESC`,
        [userId]
      );
    } else {
      const normalizedPhone = normalizePhone(phone);
      if (!normalizedPhone) return [];
      [rows] = await pool.query(
        `SELECT 
          id, directory_type as directoryType, tracking_code as trackingCode, target_title as targetTitle,
          target_meta as targetMeta, applicant_name as applicantName, applicant_org as applicantOrg,
          cooperation_intent as cooperationIntent, status, status_note as statusNote, created_at as createdAt, updated_at as updatedAt
        FROM directory_applications 
        WHERE phone = ? 
        ORDER BY created_at DESC`,
        [normalizedPhone]
      );
    }
    return rows.map(row => ({
      ...row,
      type: "directory",
      typeLabel: "生态对接",
      statusInfo: STATUS_MAP.directory[row.status] || { label: row.status, color: "#6b7280" }
    }));
  }

  // JSON 降级
  const apps = loadJson("directory_applications.json", []);
  let filtered = apps;
  if (userId) {
    filtered = apps.filter(a => a.user_id === userId);
  } else {
    const normalizedPhone = normalizePhone(phone);
    if (normalizedPhone) {
      filtered = apps.filter(a => a.phone === normalizedPhone);
    }
  }
  return filtered.map(row => ({
    id: row.id,
    directoryType: row.directory_type,
    trackingCode: row.tracking_code,
    targetTitle: row.target_title,
    targetMeta: row.target_meta,
    applicantName: row.applicant_name,
    applicantOrg: row.applicant_org,
    cooperationIntent: row.cooperation_intent,
    phone: row.phone,
    status: row.status,
    statusNote: row.status_note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    type: "directory",
    typeLabel: "生态对接",
    statusInfo: STATUS_MAP.directory[row.status] || { label: row.status, color: "#6b7280" }
  }));
}

// 查询用户的活动报名（支持 phone 或 userId）
export async function getUserActivityRegistrations(phone, userId) {
  if (await isDatabaseAvailable()) {
    let rows;
    if (userId) {
      [rows] = await pool.query(
        `SELECT 
          id, user_id as userId, activity_id as activityId, activity_title as activityTitle,
          applicant_name as applicantName, applicant_org as applicantOrg, phone, status,
          created_at as createdAt, updated_at as updatedAt
        FROM activity_registrations 
        WHERE user_id = ? 
        ORDER BY created_at DESC`,
        [userId]
      );
    } else {
      const normalizedPhone = normalizePhone(phone);
      if (!normalizedPhone) return [];
      [rows] = await pool.query(
        `SELECT 
          id, activity_id as activityId, activity_title as activityTitle,
          applicant_name as applicantName, applicant_org as applicantOrg, status,
          created_at as createdAt, updated_at as updatedAt
        FROM activity_registrations 
        WHERE phone = ? 
        ORDER BY created_at DESC`,
        [normalizedPhone]
      );
    }
    return rows.map(row => ({
      ...row,
      type: "activity",
      typeLabel: "活动报名",
      title: row.activityTitle,
      statusInfo: STATUS_MAP.activity[row.status] || { label: row.status, color: "#6b7280" }
    }));
  }

  // JSON 降级
  const regs = loadActivityRegs();
  let filtered = regs;
  if (userId) {
    filtered = regs.filter(r => r.user_id === userId);
  } else {
    const normalizedPhone = normalizePhone(phone);
    if (normalizedPhone) {
      filtered = regs.filter(r => r.phone === normalizedPhone);
    }
  }
  return filtered.map(row => ({
    id: row.id,
    userId: row.user_id,
    activityId: row.activity_id,
    activityTitle: row.activity_title,
    applicantName: row.applicant_name,
    applicantOrg: row.applicant_org,
    phone: row.phone,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    type: "activity",
    typeLabel: "活动报名",
    title: row.activity_title,
    statusInfo: STATUS_MAP.activity[row.status] || { label: row.status, color: "#6b7280" }
  }));
}

// 查询用户的投递记录（支持 phone 或 userId）
export async function getUserDeliveryRecords(phone, userId) {
  if (await isDatabaseAvailable()) {
    let rows;
    if (userId) {
      [rows] = await pool.query(
        `SELECT 
          id, user_id as userId, opportunity_id as opportunityId, opportunity_title as opportunityTitle,
          opportunity_type as opportunityType, applicant_name as applicantName, applicant_org as applicantOrg,
          phone, status, status_note as statusNote, created_at as createdAt, updated_at as updatedAt
        FROM delivery_records 
        WHERE user_id = ? 
        ORDER BY created_at DESC`,
        [userId]
      );
    } else {
      const normalizedPhone = normalizePhone(phone);
      if (!normalizedPhone) return [];
      [rows] = await pool.query(
        `SELECT 
          id, opportunity_id as opportunityId, opportunity_title as opportunityTitle,
          opportunity_type as opportunityType, applicant_name as applicantName, applicant_org as applicantOrg,
          status, status_note as statusNote, created_at as createdAt, updated_at as updatedAt
        FROM delivery_records 
        WHERE phone = ? 
        ORDER BY created_at DESC`,
        [normalizedPhone]
      );
    }
    const typeLabels = { internship: "实习申请", practice: "实践申请", project: "项目申请" };
    return rows.map(row => ({
      ...row,
      type: "delivery",
      typeLabel: typeLabels[row.opportunityType] || "投递记录",
      title: row.opportunityTitle,
      statusInfo: STATUS_MAP.delivery[row.status] || { label: row.status, color: "#6b7280" }
    }));
  }

  // JSON 降级
  const deliveries = loadDeliveries();
  let filtered = deliveries;
  if (userId) {
    filtered = deliveries.filter(d => d.user_id === userId);
  } else {
    const normalizedPhone = normalizePhone(phone);
    if (normalizedPhone) {
      filtered = deliveries.filter(d => d.phone === normalizedPhone);
    }
  }
  const typeLabels = { internship: "实习申请", practice: "实践申请", project: "项目申请" };
  return filtered.map(row => ({
    id: row.id,
    userId: row.user_id,
    opportunityId: row.opportunity_id,
    opportunityTitle: row.opportunity_title,
    opportunityType: row.opportunity_type,
    applicantName: row.applicant_name,
    applicantOrg: row.applicant_org,
    phone: row.phone,
    status: row.status,
    statusNote: row.status_note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    type: "delivery",
    typeLabel: typeLabels[row.opportunity_type] || "投递记录",
    title: row.opportunity_title,
    statusInfo: STATUS_MAP.delivery[row.status] || { label: row.status, color: "#6b7280" }
  }));
}

// 获取用户所有记录汇总
export async function getUserAllRecords(phone, userId) {
  const [directoryApps, activityRegs, deliveries] = await Promise.all([
    getUserDirectoryApplications(phone, userId).catch(() => []),
    getUserActivityRegistrations(phone, userId).catch(() => []),
    getUserDeliveryRecords(phone, userId).catch(() => [])
  ]);

  const allRecords = [...directoryApps, ...activityRegs, ...deliveries];
  allRecords.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return {
    phone: normalizePhone(phone),
    userId: userId || null,
    summary: {
      total: allRecords.length,
      directory: directoryApps.length,
      activity: activityRegs.length,
      delivery: deliveries.length,
      pending: allRecords.filter(r => r.status === "pending").length
    },
    records: allRecords
  };
}

// 创建活动报名
export async function createActivityRegistration(payload) {
  const {
    userId,
    activityId,
    activityTitle,
    applicantName,
    applicantOrg,
    phone,
    wechat,
    email,
    remark
  } = payload;

  const normalizedPhone = normalizePhone(phone);
  if (!normalizedPhone) throw new Error("请填写手机号");
  if (!applicantName) throw new Error("请填写姓名");
  if (!activityId) throw new Error("活动信息缺失");

  if (await isDatabaseAvailable()) {
    const [result] = await pool.query(
      `INSERT INTO activity_registrations 
      (user_id, activity_id, activity_title, applicant_name, applicant_org, phone, wechat, email, remark, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [userId || null, activityId, activityTitle || "", applicantName, applicantOrg || "",
       normalizedPhone, wechat || "", email || "", remark || ""]
    );
    const [rows] = await pool.query("SELECT * FROM activity_registrations WHERE id = ?", [result.insertId]);
    return rows[0];
  }

  // JSON 降级
  const regs = loadActivityRegs();
  const now = new Date().toISOString();
  const item = {
    id: getNextId(regs),
    user_id: userId || null,
    activity_id: activityId,
    activity_title: activityTitle || "",
    applicant_name: applicantName,
    applicant_org: applicantOrg || "",
    phone: normalizedPhone,
    wechat: wechat || "",
    email: email || "",
    remark: remark || "",
    status: "pending",
    created_at: now,
    updated_at: now
  };
  regs.push(item);
  saveActivityRegs(regs);
  logger.info({ activityTitle, applicantName }, "新活动报名（JSON 模式）");
  return item;
}

// 创建投递记录
export async function createDeliveryRecord(payload) {
  const {
    userId,
    opportunityId,
    opportunityTitle,
    opportunityType,
    applicantName,
    applicantOrg,
    phone,
    wechat,
    email,
    resumeUrl,
    coverLetter
  } = payload;

  const normalizedPhone = normalizePhone(phone);
  if (!normalizedPhone) throw new Error("请填写手机号");
  if (!applicantName) throw new Error("请填写姓名");
  if (!opportunityId) throw new Error("职位信息缺失");

  if (await isDatabaseAvailable()) {
    const [result] = await pool.query(
      `INSERT INTO delivery_records 
      (user_id, opportunity_id, opportunity_title, opportunity_type, applicant_name, applicant_org, 
       phone, wechat, email, resume_url, cover_letter, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [userId || null, opportunityId, opportunityTitle || "", opportunityType || "internship",
       applicantName, applicantOrg || "", normalizedPhone, wechat || "", email || "",
       resumeUrl || "", coverLetter || ""]
    );
    const [rows] = await pool.query("SELECT * FROM delivery_records WHERE id = ?", [result.insertId]);
    return rows[0];
  }

  // JSON 降级
  const deliveries = loadDeliveries();
  const now = new Date().toISOString();
  const item = {
    id: getNextId(deliveries),
    user_id: userId || null,
    opportunity_id: opportunityId,
    opportunity_title: opportunityTitle || "",
    opportunity_type: opportunityType || "internship",
    applicant_name: applicantName,
    applicant_org: applicantOrg || "",
    phone: normalizedPhone,
    wechat: wechat || "",
    email: email || "",
    resume_url: resumeUrl || "",
    cover_letter: coverLetter || "",
    status: "pending",
    status_note: "",
    created_at: now,
    updated_at: now
  };
  deliveries.push(item);
  saveDeliveries(deliveries);
  logger.info({ opportunityTitle, applicantName }, "新投递记录（JSON 模式）");
  return item;
}

// ========== Admin 查询接口 ==========

export async function listActivityRegistrations() {
  if (await isDatabaseAvailable()) {
    const [rows] = await pool.query(
      "SELECT * FROM activity_registrations ORDER BY created_at DESC, id DESC"
    );
    return rows;
  }
  return loadActivityRegs();
}

export async function listDeliveryRecords() {
  if (await isDatabaseAvailable()) {
    const [rows] = await pool.query(
      "SELECT * FROM delivery_records ORDER BY created_at DESC, id DESC"
    );
    return rows;
  }
  return loadDeliveries();
}
