import path from "node:path";
import crypto from "node:crypto";
import TOS from "@volcengine/tos-sdk";
import { config } from "../config.js";

let tosClient = null;

function ensureClient() {
  if (!config.tos.region || !config.tos.endpoint || !config.tos.bucket || !config.tos.accessKeyId || !config.tos.accessKeySecret) {
    throw new Error("对象存储配置不完整，请检查 TOS 相关环境变量");
  }

  if (!tosClient) {
    tosClient = new TOS({
      region: config.tos.region,
      endpoint: config.tos.endpoint,
      accessKeyId: config.tos.accessKeyId,
      accessKeySecret: config.tos.accessKeySecret
    });
  }

  return tosClient;
}

function buildPublicUrl(key) {
  if (config.tos.publicBaseUrl) {
    return `${config.tos.publicBaseUrl}/${key}`;
  }
  return `https://${config.tos.bucket}.${config.tos.endpoint}/${key}`;
}

export async function uploadImage(file) {
  const client = ensureClient();
  const ext = path.extname(file.originalname || "").toLowerCase() || ".png";
  const safeName = `${Date.now()}-${crypto.randomUUID()}${ext}`;
  const key = `${config.tos.uploadPrefix}/${safeName}`;

  await client.putObject({
    bucket: config.tos.bucket,
    key,
    body: file.buffer,
    contentType: file.mimetype
  });

  return {
    key,
    url: buildPublicUrl(key)
  };
}

/**
 * 上传 Buffer 到 TOS
 * @param {Buffer} buffer - 文件 Buffer
 * @param {string} key - 对象键
 * @param {string} contentType - 内容类型
 * @returns {Promise<string>} 公开 URL
 */
export async function uploadToTOS(buffer, key, contentType = "application/octet-stream") {
  const client = ensureClient();

  await client.putObject({
    bucket: config.tos.bucket,
    key,
    body: buffer,
    contentType
  });

  return buildPublicUrl(key);
}

/**
 * 检查 TOS 是否已配置
 * @returns {boolean}
 */
export function isTOSConfigured() {
  return !!(
    config.tos.region &&
    config.tos.endpoint &&
    config.tos.bucket &&
    config.tos.accessKeyId &&
    config.tos.accessKeySecret
  );
}
