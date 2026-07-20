-- 用户账号系统迁移
-- 执行前请确保已备份数据

-- 1. 创建用户表
CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL COMMENT '邮箱（登录账号）',
  password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希（bcrypt）',
  nickname VARCHAR(128) NOT NULL DEFAULT '' COMMENT '昵称',
  avatar_url VARCHAR(1024) NOT NULL DEFAULT '' COMMENT '头像URL',
  phone VARCHAR(64) NOT NULL DEFAULT '' COMMENT '手机号',
  real_name VARCHAR(128) NOT NULL DEFAULT '' COMMENT '真实姓名',
  org_name VARCHAR(255) NOT NULL DEFAULT '' COMMENT '学校/单位',
  org_role VARCHAR(128) NOT NULL DEFAULT '' COMMENT '职务/角色',
  email_verified BOOLEAN NOT NULL DEFAULT FALSE COMMENT '邮箱是否验证',
  email_verified_at TIMESTAMP NULL COMMENT '邮箱验证时间',
  verification_token VARCHAR(255) NOT NULL DEFAULT '' COMMENT '邮箱验证令牌',
  reset_token VARCHAR(255) NOT NULL DEFAULT '' COMMENT '密码重置令牌',
  reset_token_expires TIMESTAMP NULL COMMENT '重置令牌过期时间',
  last_login_at TIMESTAMP NULL COMMENT '最后登录时间',
  login_count INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '登录次数',
  status ENUM('active', 'inactive', 'banned') NOT NULL DEFAULT 'active' COMMENT '账号状态',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_email (email),
  KEY idx_status_created (status, created_at),
  KEY idx_verification_token (verification_token),
  KEY idx_reset_token (reset_token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 2. 给现有表添加 user_id 字段（用于关联用户）
ALTER TABLE directory_applications 
ADD COLUMN user_id BIGINT UNSIGNED NULL COMMENT '关联用户ID',
ADD INDEX idx_user_id (user_id);

ALTER TABLE activity_registrations 
ADD COLUMN user_id BIGINT UNSIGNED NULL COMMENT '关联用户ID',
ADD INDEX idx_user_id (user_id);

ALTER TABLE delivery_records 
ADD COLUMN user_id BIGINT UNSIGNED NULL COMMENT '关联用户ID',
ADD INDEX idx_user_id (user_id);

-- 3. 创建登录日志表（安全审计）
CREATE TABLE IF NOT EXISTS user_login_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  ip_address VARCHAR(64) NOT NULL DEFAULT '' COMMENT 'IP地址',
  user_agent VARCHAR(512) NOT NULL DEFAULT '' COMMENT 'User-Agent',
  login_type ENUM('password', 'token', 'oauth') NOT NULL DEFAULT 'password' COMMENT '登录方式',
  success BOOLEAN NOT NULL DEFAULT TRUE COMMENT '是否成功',
  fail_reason VARCHAR(255) NOT NULL DEFAULT '' COMMENT '失败原因',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_user_id_created (user_id, created_at),
  KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='登录日志表';
