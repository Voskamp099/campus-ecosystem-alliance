import { pool } from "../db.js";
import { logger } from "../utils/logger.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, "../../data");

/**
 * 迁移 JSON 数据到 MySQL
 */
async function migrateData() {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // 1. 迁移用户数据
    await migrateUsers(connection);
    
    // 2. 迁移活动报名数据
    await migrateActivityRegistrations(connection);
    
    // 3. 迁移投递记录数据
    await migrateDeliveryRecords(connection);
    
    // 4. 迁移用户发布的活动数据
    await migrateUserEvents(connection);
    
    // 5. 迁移用户发布的实习实践数据
    await migrateUserRecruits(connection);
    
    // 6. 迁移对接申请数据
    await migrateDirectoryApplications(connection);
    
    await connection.commit();
    logger.info("数据迁移完成");
    
  } catch (error) {
    await connection.rollback().catch(() => {});
    logger.error({ err: error }, "数据迁移失败");
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * 迁移用户数据
 */
async function migrateUsers(connection) {
  const filePath = path.join(dataDir, "users.json");
  if (!fs.existsSync(filePath)) {
    logger.info("用户数据文件不存在，跳过迁移");
    return;
  }
  
  const users = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  if (!users || users.length === 0) {
    logger.info("用户数据为空，跳过迁移");
    return;
  }
  
  logger.info(`开始迁移 ${users.length} 个用户...`);
  
  const sql = `
    INSERT INTO users (
      id, email, password_hash, nickname, avatar_url, phone, real_name, 
      org_name, org_role, bio, email_verified, email_verified_at, 
      verification_token, reset_token, reset_token_expires, is_admin, 
      status, login_count, created_at, last_login_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      password_hash = VALUES(password_hash),
      nickname = VALUES(nickname),
      avatar_url = VALUES(avatar_url),
      phone = VALUES(phone),
      real_name = VALUES(real_name),
      org_name = VALUES(org_name),
      org_role = VALUES(org_role),
      bio = VALUES(bio),
      email_verified = VALUES(email_verified),
      email_verified_at = VALUES(email_verified_at),
      verification_token = VALUES(verification_token),
      reset_token = VALUES(reset_token),
      reset_token_expires = VALUES(reset_token_expires),
      is_admin = VALUES(is_admin),
      status = VALUES(status),
      login_count = VALUES(login_count),
      last_login_at = VALUES(last_login_at)
  `;
  
  for (const user of users) {
    await connection.query(sql, [
      user.id,
      user.email,
      user.password_hash,
      user.nickname || "",
      user.avatar_url || "",
      user.phone || "",
      user.real_name || "",
      user.org_name || "",
      user.org_role || "",
      user.bio || null,
      user.email_verified || false,
      user.email_verified_at || null,
      user.verification_token || "",
      user.reset_token || "",
      user.reset_token_expires || null,
      user.is_admin || false,
      user.status || "active",
      user.login_count || 0,
      user.created_at || new Date(),
      user.last_login_at || null,
    ]);
  }
  
  logger.info(`用户迁移完成，共 ${users.length} 条记录`);
}

/**
 * 迁移活动报名数据
 */
async function migrateActivityRegistrations(connection) {
  const filePath = path.join(dataDir, "activity_registrations.json");
  if (!fs.existsSync(filePath)) {
    logger.info("活动报名数据文件不存在，跳过迁移");
    return;
  }
  
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  if (!data || data.length === 0) {
    logger.info("活动报名数据为空，跳过迁移");
    return;
  }
  
  logger.info(`开始迁移 ${data.length} 条活动报名记录...`);
  
  const sql = `
    INSERT INTO activity_registrations (
      user_id, activity_id, activity_title, applicant_name, applicant_org,
      phone, wechat, email, remark, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  for (const item of data) {
    await connection.query(sql, [
      item.user_id || null,
      item.activity_id || "",
      item.activity_title || "",
      item.applicant_name || "",
      item.applicant_org || "",
      item.phone || "",
      item.wechat || "",
      item.email || "",
      item.remark || "",
      item.status || "pending",
      item.created_at || new Date(),
    ]);
  }
  
  logger.info(`活动报名迁移完成，共 ${data.length} 条记录`);
}

/**
 * 迁移投递记录数据
 */
async function migrateDeliveryRecords(connection) {
  const filePath = path.join(dataDir, "delivery_records.json");
  if (!fs.existsSync(filePath)) {
    logger.info("投递记录数据文件不存在，跳过迁移");
    return;
  }
  
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  if (!data || data.length === 0) {
    logger.info("投递记录数据为空，跳过迁移");
    return;
  }
  
  logger.info(`开始迁移 ${data.length} 条投递记录...`);
  
  const sql = `
    INSERT INTO delivery_records (
      user_id, opportunity_id, opportunity_title, opportunity_type,
      applicant_name, applicant_org, phone, wechat, email,
      resume_url, cover_letter, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  for (const item of data) {
    await connection.query(sql, [
      item.user_id || null,
      item.opportunity_id || "",
      item.opportunity_title || "",
      item.opportunity_type || "internship",
      item.applicant_name || "",
      item.applicant_org || "",
      item.phone || "",
      item.wechat || "",
      item.email || "",
      item.resume_url || "",
      item.cover_letter || "",
      item.status || "pending",
      item.created_at || new Date(),
    ]);
  }
  
  logger.info(`投递记录迁移完成，共 ${data.length} 条记录`);
}

/**
 * 迁移用户发布的活动数据
 */
async function migrateUserEvents(connection) {
  const filePath = path.join(dataDir, "user_events.json");
  if (!fs.existsSync(filePath)) {
    logger.info("用户活动数据文件不存在，跳过迁移");
    return;
  }
  
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  if (!data || data.length === 0) {
    logger.info("用户活动数据为空，跳过迁移");
    return;
  }
  
  logger.info(`开始迁移 ${data.length} 条用户活动记录...`);
  
  const sql = `
    INSERT INTO user_events (
      user_id, title, meta, description, image_url, link_url, 
      status, reject_reason, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  for (const item of data) {
    await connection.query(sql, [
      item.user_id || null,
      item.title || "",
      item.meta || "",
      item.description || "",
      item.image_url || "",
      item.link_url || "",
      item.status || "pending",
      item.reject_reason || "",
      item.created_at || new Date(),
    ]);
  }
  
  logger.info(`用户活动迁移完成，共 ${data.length} 条记录`);
}

/**
 * 迁移用户发布的实习实践数据
 */
async function migrateUserRecruits(connection) {
  const filePath = path.join(dataDir, "user_recruits.json");
  if (!fs.existsSync(filePath)) {
    logger.info("用户实习实践数据文件不存在，跳过迁移");
    return;
  }
  
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  if (!data || data.length === 0) {
    logger.info("用户实习实践数据为空，跳过迁移");
    return;
  }
  
  logger.info(`开始迁移 ${data.length} 条用户实习实践记录...`);
  
  const sql = `
    INSERT INTO user_recruits (
      user_id, title, meta, description, image_url, link_url, 
      status, reject_reason, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  for (const item of data) {
    await connection.query(sql, [
      item.user_id || null,
      item.title || "",
      item.meta || "",
      item.description || "",
      item.image_url || "",
      item.link_url || "",
      item.status || "pending",
      item.reject_reason || "",
      item.created_at || new Date(),
    ]);
  }
  
  logger.info(`用户实习实践迁移完成，共 ${data.length} 条记录`);
}

/**
 * 迁移对接申请数据
 */
async function migrateDirectoryApplications(connection) {
  const filePath = path.join(dataDir, "directory_applications.json");
  if (!fs.existsSync(filePath)) {
    logger.info("对接申请数据文件不存在，跳过迁移");
    return;
  }
  
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  if (!data || data.length === 0) {
    logger.info("对接申请数据为空，跳过迁移");
    return;
  }
  
  logger.info(`开始迁移 ${data.length} 条对接申请记录...`);
  
  const sql = `
    INSERT INTO directory_applications (
      directory_type, tracking_code, target_title, target_meta, 
      applicant_name, applicant_org, applicant_role, phone, 
      wechat, email, cooperation_intent, message, status, 
      status_note, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  for (const item of data) {
    await connection.query(sql, [
      item.directory_type || "",
      item.tracking_code || "",
      item.target_title || "",
      item.target_meta || "",
      item.applicant_name || "",
      item.applicant_org || "",
      item.applicant_role || "",
      item.phone || "",
      item.wechat || "",
      item.email || "",
      item.cooperation_intent || "",
      item.message || "",
      item.status || "pending",
      item.status_note || "",
      item.created_at || new Date(),
    ]);
  }
  
  logger.info(`对接申请迁移完成，共 ${data.length} 条记录`);
}

// 执行迁移（仅作为脚本直接运行时执行）
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateData()
    .then(() => {
      logger.info("迁移脚本执行完成");
      process.exit(0);
    })
    .catch((error) => {
      logger.error({ err: error }, "迁移脚本执行失败");
      process.exit(1);
    });
}
