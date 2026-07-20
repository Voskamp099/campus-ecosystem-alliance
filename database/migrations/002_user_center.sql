-- 用户中心相关表结构（userId 支持）
-- 执行此文件前请确保已备份数据

-- 1. 给 directory_applications 添加 user_id 字段（用于用户查询）
ALTER TABLE directory_applications ADD COLUMN user_id BIGINT UNSIGNED NULL COMMENT '用户ID' AFTER id;
ALTER TABLE directory_applications ADD INDEX idx_user_id (user_id);

-- 2. 给 activity_registrations 添加 user_id 字段
ALTER TABLE activity_registrations ADD COLUMN user_id BIGINT UNSIGNED NULL COMMENT '用户ID' AFTER id;
ALTER TABLE activity_registrations ADD INDEX idx_user_id (user_id);

-- 3. 给 delivery_records 添加 user_id 字段
ALTER TABLE delivery_records ADD COLUMN user_id BIGINT UNSIGNED NULL COMMENT '用户ID' AFTER id;
ALTER TABLE delivery_records ADD INDEX idx_user_id (user_id);
