import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "./config.js";

const TOKEN_EXPIRES_IN = "12h";

export function createAdminToken() {
  return jwt.sign({ role: "admin", username: config.adminUsername }, config.jwtSecret, {
    expiresIn: TOKEN_EXPIRES_IN
  });
}

export async function verifyAdminCredentials(username, password) {
  if (username !== config.adminUsername) return false;
  if (config.adminPasswordHash) {
    return bcrypt.compare(password, config.adminPasswordHash);
  }
  return password === config.adminPassword;
}

export function requireAdmin(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (!token) {
    return res.status(401).json({ message: "请先登录后台" });
  }

  try {
    req.admin = jwt.verify(token, config.jwtSecret);
    next();
  } catch (error) {
    return res.status(401).json({ message: "登录态已失效，请重新登录" });
  }
}
