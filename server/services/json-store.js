/**
 * JSON 文件持久化存储
 * 用于 MySQL 不可用时的降级存储
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..', '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * 加载 JSON 文件，不存在返回默认值
 */
export function loadJson(filename, defaultValue = null) {
  const filePath = path.join(DATA_DIR, filename);
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (e) {
    logger.warn({ filename, err: e }, "加载 JSON 文件失败");
  }
  return defaultValue;
}

/**
 * 保存 JSON 文件
 */
export function saveJson(filename, data) {
  const filePath = path.join(DATA_DIR, filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (e) {
    logger.error({ filename, err: e }, "保存 JSON 文件失败");
    return false;
  }
}

/**
 * 获取文件路径
 */
export function getFilePath(filename) {
  return path.join(DATA_DIR, filename);
}

/**
 * 追加数据到数组文件
 */
export function appendToArray(filename, item) {
  const arr = loadJson(filename, []);
  arr.push(item);
  return saveJson(filename, arr);
}

/**
 * 更新数组中的项
 */
export function updateInArray(filename, id, updates) {
  const arr = loadJson(filename, []);
  const idx = arr.findIndex(item => item.id === id);
  if (idx !== -1) {
    arr[idx] = { ...arr[idx], ...updates, updated_at: new Date().toISOString() };
    return saveJson(filename, arr);
  }
  return false;
}
