import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { pool, isDatabaseAvailable } from "../db.js";
import { getConfig } from "../config.js";
import { loadJson, saveJson } from "./json-store.js";
import { logger } from "../utils/logger.js";

const SALT_ROUNDS = 12;
const USERS_FILE = "users.json";

// ========== 工具函数 ==========

export async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function normalizeIdentifier(identifier) {
  return String(identifier || "").trim();
}

function sanitizeUser(user) {
  if (!user) return null;
  const { password_hash, verification_token, reset_token, reset_token_expires, is_admin, ...safe } = user;
  if (is_admin === 1) safe.isAdmin = true;
  return safe;
}

// ========== JSON 持久化存储 ==========

function loadUsers() {
  return loadJson(USERS_FILE, []);
}

function saveUsers(users) {
  return saveJson(USERS_FILE, users);
}

function getNextId(users) {
  if (users.length === 0) return 1;
  return Math.max(...users.map(u => u.id)) + 1;
}

// ========== 数据库 / JSON 双通道 ==========

export async function findUserByEmail(email) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return null;

  if (await isDatabaseAvailable()) {
    const [rows] = await pool.query(
      `SELECT id, email, password_hash, nickname, avatar_url, phone,
              real_name, org_name, org_role, email_verified,
              last_login_at, status, created_at
       FROM users WHERE email = ? AND status != 'banned'`,
      [normalizedEmail]
    );
    return rows[0] || null;
  }

  // 降级：JSON 文件
  const users = loadUsers();
  return users.find(u => u.email === normalizedEmail && u.status !== 'banned') || null;
}

export async function findUserForLogin(identifier) {
  const rawIdentifier = normalizeIdentifier(identifier);
  const normalizedEmail = normalizeEmail(identifier);
  if (!rawIdentifier) return null;

  if (await isDatabaseAvailable()) {
    const [rows] = await pool.query(
      `SELECT id, email, password_hash, nickname, avatar_url, phone,
              real_name, org_name, org_role, email_verified,
              last_login_at, status, created_at, is_admin
       FROM users
       WHERE (email = ? OR nickname = ?) AND status != 'banned'
       LIMIT 1`,
      [normalizedEmail, rawIdentifier]
    );
    return rows[0] || null;
  }

  const users = loadUsers();
  return users.find(u =>
    u.status !== "banned" &&
    (u.email === normalizedEmail || u.nickname === rawIdentifier)
  ) || null;
}

export async function findUserById(id) {
  if (await isDatabaseAvailable()) {
    const [rows] = await pool.query(
      `SELECT id, email, nickname, avatar_url, phone,
              real_name, org_name, org_role, email_verified,
              last_login_at, status, created_at
       FROM users WHERE id = ? AND status = 'active'`,
      [id]
    );
    return rows[0] || null;
  }

  // 降级：JSON 文件
  const users = loadUsers();
  return users.find(u => u.id === id && u.status === 'active') || null;
}

export async function createUser(payload) {
  const {
    email, password, nickname = "", phone = "",
    realName = "", orgName = "", orgRole = "",
    isAdmin = false
  } = payload;

  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) throw new Error("请填写邮箱");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) throw new Error("邮箱格式不正确");
  if (!password || password.length < 6) throw new Error("密码至少需要6位");

  const existing = await findUserByEmail(normalizedEmail);
  if (existing) throw new Error("该邮箱已被注册");

  const passwordHash = await hashPassword(password);
  const now = new Date().toISOString();

  if (await isDatabaseAvailable()) {
    const verificationToken = generateToken();
    const [result] = await pool.query(
      `INSERT INTO users
       (email, password_hash, nickname, phone, real_name, org_name, org_role, verification_token, email_verified, is_admin)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [normalizedEmail, passwordHash, nickname, phone, realName, orgName, orgRole, verificationToken, false, isAdmin ? 1 : 0]
    );
    const user = await findUserById(result.insertId);
    return { user, verificationToken };
  }

  // 降级：JSON 文件
  const users = loadUsers();
  const id = getNextId(users);
  const user = {
    id,
    email: normalizedEmail,
    password_hash: passwordHash,
    nickname,
    phone,
    real_name: realName,
    org_name: orgName,
    org_role: orgRole,
    is_admin: isAdmin ? 1 : 0,
    email_verified: false,
    status: "active",
    created_at: now,
    last_login_at: null
  };
  users.push(user);
  saveUsers(users);
  logger.info({ email: normalizedEmail }, "用户注册成功（JSON 模式）");
  return { user, verificationToken: null };
}

export async function validateLogin(identifier, password) {
  const user = await findUserForLogin(identifier);

  if (!user) throw new Error("邮箱或密码错误");

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) throw new Error("邮箱或密码错误");

  // 更新登录信息
  if (await isDatabaseAvailable()) {
    await pool.query(
      `UPDATE users SET last_login_at = NOW(), login_count = login_count + 1 WHERE id = ?`,
      [user.id]
    );
  } else {
    // JSON 模式：更新 last_login_at
    const users = loadUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      users[idx].last_login_at = new Date().toISOString();
      saveUsers(users);
    }
  }

  return user;
}

export async function findUserByVerificationToken(token) {
  if (await isDatabaseAvailable()) {
    const [rows] = await pool.query(
      `SELECT id, email, email_verified FROM users
       WHERE verification_token = ? AND status = 'active'`,
      [token]
    );
    return rows[0] || null;
  }
  return null;
}

export async function findUserByResetToken(token) {
  if (await isDatabaseAvailable()) {
    const [rows] = await pool.query(
      `SELECT * FROM users WHERE reset_token = ? AND status != 'banned'`,
      [token]
    );
    return rows[0] || null;
  }
  // JSON 模式
  const users = loadUsers();
  return users.find(u => u.reset_token === token && u.status !== 'banned') || null;
}

export async function verifyEmail(token) {
  const user = await findUserByVerificationToken(token);
  if (!user) throw new Error("验证链接无效或已过期");
  if (user.email_verified) return { alreadyVerified: true, user };

  if (await isDatabaseAvailable()) {
    await pool.query(
      `UPDATE users SET email_verified = TRUE, email_verified_at = NOW(), verification_token = '' WHERE id = ?`,
      [user.id]
    );
    return { alreadyVerified: false, user: await findUserById(user.id) };
  }
  return { alreadyVerified: false, user };
}

export async function createPasswordResetToken(email) {
  const normalizedEmail = normalizeEmail(email);
  const user = await findUserByEmail(normalizedEmail);
  if (!user) return { user: null, token: null };

  const token = generateToken();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  if (await isDatabaseAvailable()) {
    await pool.query(
      `UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?`,
      [token, expires, user.id]
    );
  } else {
    // JSON 模式：保存 token 到 JSON 文件
    const users = loadUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      users[idx].reset_token = token;
      users[idx].reset_token_expires = expires.toISOString();
      saveUsers(users);
    }
  }
  return { user, token };
}

export async function resetPassword(token, newPassword) {
  if (!newPassword || newPassword.length < 6) throw new Error("密码至少需要6位");
  const user = await findUserByResetToken(token);
  if (!user) throw new Error("重置链接无效或已过期");

  if (new Date(user.reset_token_expires) < new Date()) {
    throw new Error("重置链接已过期，请重新申请");
  }

  const passwordHash = await hashPassword(newPassword);

  if (await isDatabaseAvailable()) {
    await pool.query(
      `UPDATE users SET password_hash = ?, reset_token = '', reset_token_expires = NULL WHERE id = ?`,
      [passwordHash, user.id]
    );
  } else {
    // JSON 模式
    const users = loadUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      users[idx].password_hash = passwordHash;
      users[idx].reset_token = '';
      users[idx].reset_token_expires = null;
      saveUsers(users);
    }
  }
  return { success: true };
}

export async function changePassword(userId, oldPassword, newPassword) {
  if (!newPassword || newPassword.length < 6) throw new Error("新密码至少需要6位");

  if (await isDatabaseAvailable()) {
    const [rows] = await pool.query(
      `SELECT password_hash FROM users WHERE id = ? AND status = 'active'`, [userId]
    );
    if (!rows.length) throw new Error("用户不存在");
    const valid = await verifyPassword(oldPassword, rows[0].password_hash);
    if (!valid) throw new Error("当前密码错误");
    const passwordHash = await hashPassword(newPassword);
    await pool.query(`UPDATE users SET password_hash = ? WHERE id = ?`, [passwordHash, userId]);
  } else {
    // JSON 模式
    const users = loadUsers();
    const idx = users.findIndex(u => u.id === userId && u.status === 'active');
    if (idx === -1) throw new Error("用户不存在");
    const valid = await verifyPassword(oldPassword, users[idx].password_hash);
    if (!valid) throw new Error("当前密码错误");
    users[idx].password_hash = await hashPassword(newPassword);
    saveUsers(users);
  }
  return { success: true };
}

export async function updateUserProfile(userId, payload) {
  const allowedFields = ["nickname", "phone", "real_name", "org_name", "org_role"];
  const updates = [];
  const values = [];

  for (const [key, value] of Object.entries(payload)) {
    const dbField = key.replace(/[A-Z]/g, m => `_${m.toLowerCase()}`);
    if (allowedFields.includes(dbField)) {
      updates.push(`${dbField} = ?`);
      values.push(value);
    }
  }

  if (updates.length === 0) throw new Error("没有可更新的字段");

  if (await isDatabaseAvailable()) {
    values.push(userId);
    await pool.query(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, values);
    return findUserById(userId);
  }

  // 降级：JSON 文件
  const users = loadUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) throw new Error("用户不存在");
  for (const [key, value] of Object.entries(payload)) {
    const dbField = key.replace(/[A-Z]/g, m => `_${m.toLowerCase()}`);
    if (allowedFields.includes(dbField)) users[idx][dbField] = value;
  }
  saveUsers(users);
  return users[idx];
}

export async function logLoginAttempt(payload) {
  if (!(await isDatabaseAvailable())) return; // 降级时跳过日志
  const { userId, ipAddress, userAgent, loginType, success, failReason } = payload;
  await pool.query(
    `INSERT INTO user_login_logs (user_id, ip_address, user_agent, login_type, success, fail_reason)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId || 0, ipAddress || "", userAgent || "", loginType, success, failReason || ""]
  );
}

export function formatUserResponse(user) {
  return sanitizeUser(user);
}

// ========== 获取所有用户（管理员用）==========
export async function getAllUsers() {
  if (await isDatabaseAvailable()) {
    const [rows] = await pool.query(
      `SELECT id, email, nickname, phone, real_name, org_name, org_role, 
              email_verified, status, created_at, last_login_at, is_admin 
       FROM users ORDER BY created_at DESC`
    );
    return rows.map(row => ({
      id: row.id,
      email: row.email,
      nickname: row.nickname,
      phone: row.phone,
      realName: row.real_name,
      orgName: row.org_name,
      orgRole: row.org_role,
      emailVerified: row.email_verified,
      status: row.status,
      createdAt: row.created_at,
      lastLoginAt: row.last_login_at,
      isAdmin: !!row.is_admin
    }));
  }
  
  // 降级：JSON 文件
  const users = loadUsers();
  return users.map(u => ({
    id: u.id,
    email: u.email,
    nickname: u.nickname,
    phone: u.phone,
    realName: u.real_name,
    orgName: u.org_name,
    orgRole: u.org_role,
    emailVerified: u.email_verified,
    status: u.status,
    createdAt: u.created_at,
    lastLoginAt: u.last_login_at,
    isAdmin: !!u.is_admin
  }));
}

export async function getUserStats() {
  const users = await getAllUsers();
  const now = new Date();
  const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
  
  return {
    total: users.length,
    admin: users.filter(u => u.isAdmin).length,
    active: users.filter(u => u.status === 'active').length,
    newToday: users.filter(u => u.createdAt && new Date(u.createdAt) > oneDayAgo).length,
    newThisWeek: users.filter(u => u.createdAt && new Date(u.createdAt) > sevenDaysAgo).length,
    newThisMonth: users.filter(u => u.createdAt && new Date(u.createdAt) > thirtyDaysAgo).length,
    recentLogin: users.filter(u => u.lastLoginAt && new Date(u.lastLoginAt) > sevenDaysAgo).length
  };
}


// ========== JWT 验证中间件 ==========
export function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "请先登录" });
  }
  
  const token = authHeader.slice(7);
  try {
    const config = getConfig();
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = { userId: decoded.userId, email: decoded.email, role: decoded.role };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "登录已过期，请重新登录" });
  }
}
