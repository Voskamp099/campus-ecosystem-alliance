/**
 * 头像上传服务
 * 支持本地上传和火山引擎 TOS 上传
 */
import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { uploadToTOS, isTOSConfigured } from "./upload-service.js";
import { logger } from "../utils/logger.js";

// 动态加载 sharp（可能不可用）
let sharp = null;
try {
  sharp = (await import("sharp")).default;
} catch (error) {
  logger.warn("Sharp 模块不可用，图片处理功能将被禁用");
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, "../../public/uploads/avatars");

// 确保上传目录存在
async function ensureUploadDir() {
  try {
    await fs.mkdir(uploadDir, { recursive: true });
  } catch (error) {
    // 目录已存在
  }
}

/**
 * 生成头像文件名
 * @param {number} userId - 用户 ID
 * @param {string} ext - 文件扩展名
 * @returns {string} 文件名
 */
function generateAvatarFilename(userId, ext = "jpg") {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${userId}-${timestamp}-${random}.${ext}`;
}

/**
 * 处理头像图片
 * @param {Buffer} buffer - 图片 Buffer
 * @param {Object} options - 选项
 * @returns {Promise<Buffer>} 处理后的图片 Buffer
 */
async function processAvatar(buffer, options = {}) {
  if (!sharp) {
    // Sharp 不可用，直接返回原始 buffer
    logger.warn("Sharp 不可用，跳过图片处理");
    return buffer;
  }

  const { width = 200, height = 200, quality = 85 } = options;

  return sharp(buffer)
    .resize(width, height, {
      fit: "cover",
      position: "center",
    })
    .jpeg({ quality })
    .toBuffer();
}

/**
 * 上传头像
 * @param {Object} options - 上传选项
 * @param {Buffer} options.buffer - 图片 Buffer
 * @param {number} options.userId - 用户 ID
 * @param {string} options.originalname - 原始文件名
 * @returns {Promise<string>} 头像 URL
 */
export async function uploadAvatar({ buffer, userId, originalname }) {
  await ensureUploadDir();

  // 处理图片（裁剪为正方形，压缩）
  const processedBuffer = await processAvatar(buffer);

  // 生成文件名
  const filename = generateAvatarFilename(userId);

  // 优先使用 TOS
  if (isTOSConfigured()) {
    try {
      const tosKey = `avatars/${filename}`;
      const url = await uploadToTOS(processedBuffer, tosKey, "image/jpeg");
      logger.info({ userId, url }, "头像上传到 TOS 成功");
      return url;
    } catch (error) {
      logger.error({ err: error, userId }, "TOS 上传失败，降级到本地存储");
    }
  }

  // 本地存储
  const filepath = path.join(uploadDir, filename);
  await fs.writeFile(filepath, processedBuffer);

  const url = `/uploads/avatars/${filename}`;
  logger.info({ userId, url }, "头像上传到本地成功");

  return url;
}

/**
 * 删除旧头像
 * @param {string} avatarUrl - 旧头像 URL
 */
export async function deleteOldAvatar(avatarUrl) {
  if (!avatarUrl || avatarUrl.startsWith("http")) {
    // TOS 或外部 URL，不删除
    return;
  }

  // 本地文件
  if (avatarUrl.startsWith("/uploads/avatars/")) {
    const filepath = path.join(uploadDir, path.basename(avatarUrl));
    try {
      await fs.unlink(filepath);
      logger.info({ avatarUrl }, "旧头像删除成功");
    } catch (error) {
      // 文件不存在，忽略
    }
  }
}

/**
 * 获取默认头像 URL
 * @param {string} nickname - 用户昵称
 * @returns {string} 默认头像 URL（使用 UI Avatars 服务）
 */
export function getDefaultAvatarUrl(nickname) {
  const name = encodeURIComponent(nickname || "用户");
  const colors = ["60a5fa", "8b5cf6", "ec4899", "f59e0b", "10b981"];
  const color = colors[Math.abs(hashCode(nickname)) % colors.length];
  
  return `https://ui-avatars.com/api/?name=${name}&background=${color}&color=fff&size=200&bold=true`;
}

/**
 * 简单的字符串哈希函数
 */
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}

export default {
  uploadAvatar,
  deleteOldAvatar,
  getDefaultAvatarUrl,
};
