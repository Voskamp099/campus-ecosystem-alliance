-- 用户中心相关表结构
-- 执行此文件前请确保已备份数据

-- 1. 给 directory_applications 添加手机号索引（用于用户查询）
ALTER TABLE directory_applications ADD INDEX idx_phone (phone);

-- 2. 创建活动报名表
CREATE TABLE IF NOT EXISTS activity_registrations (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  activity_id VARCHAR(64) NOT NULL COMMENT '活动唯一标识',
  activity_title VARCHAR(255) NOT NULL DEFAULT '' COMMENT '活动标题',
  applicant_name VARCHAR(128) NOT NULL DEFAULT '' COMMENT '报名人姓名',
  applicant_org VARCHAR(255) NOT NULL DEFAULT '' COMMENT '学校/单位',
  phone VARCHAR(64) NOT NULL DEFAULT '' COMMENT '手机号（查询凭证）',
  wechat VARCHAR(128) NOT NULL DEFAULT '' COMMENT '微信号',
  email VARCHAR(255) NOT NULL DEFAULT '' COMMENT '邮箱',
  remark TEXT NULL COMMENT '备注/自我介绍',
  status VARCHAR(32) NOT NULL DEFAULT 'pending' COMMENT '状态: pending/confirmed/cancelled/rejected',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_phone_created (phone, created_at),
  KEY idx_activity_id (activity_id),
  KEY idx_status_created (status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='活动报名表';

-- 3. 创建投递记录表（实习/实践申请）
CREATE TABLE IF NOT EXISTS delivery_records (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  opportunity_id VARCHAR(64) NOT NULL COMMENT '机会ID',
  opportunity_title VARCHAR(255) NOT NULL DEFAULT '' COMMENT '职位/机会标题',
  opportunity_type VARCHAR(32) NOT NULL DEFAULT 'internship' COMMENT '类型: internship/practice/project',
  applicant_name VARCHAR(128) NOT NULL DEFAULT '' COMMENT '申请人姓名',
  applicant_org VARCHAR(255) NOT NULL DEFAULT '' COMMENT '学校/单位',
  phone VARCHAR(64) NOT NULL DEFAULT '' COMMENT '手机号（查询凭证）',
  wechat VARCHAR(128) NOT NULL DEFAULT '' COMMENT '微信号',
  email VARCHAR(255) NOT NULL DEFAULT '' COMMENT '邮箱',
  resume_url VARCHAR(1024) NOT NULL DEFAULT '' COMMENT '简历链接',
  cover_letter TEXT NULL COMMENT '求职信/申请说明',
  status VARCHAR(32) NOT NULL DEFAULT 'pending' COMMENT '状态: pending/reviewing/accepted/rejected',
  status_note VARCHAR(500) NOT NULL DEFAULT '' COMMENT '状态说明（如拒绝原因）',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_phone_created (phone, created_at),
  KEY idx_opportunity_id (opportunity_id),
  KEY idx_status_created (status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='投递记录表';
