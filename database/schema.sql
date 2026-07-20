-- 北京校园生态合作联盟 网站 —— 规范 Schema（单一真相源）
-- 本文件由 docker-entrypoint (docker-compose.yml) 在首次建库时加载，
-- 同时由 server/scripts/init-db.js 在每次服务启动时执行（CREATE TABLE IF NOT EXISTS，幂等）。
-- 注意：历史 migrations/*.sql 中的变更已合并进本文件，无需再单独执行。

-- ========== 用户表 ==========
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
  bio TEXT NULL COMMENT '个人简介',
  email_verified BOOLEAN NOT NULL DEFAULT FALSE COMMENT '邮箱是否验证（注册默认未验证）',
  email_verified_at TIMESTAMP NULL COMMENT '邮箱验证时间',
  verification_token VARCHAR(255) NOT NULL DEFAULT '' COMMENT '邮箱验证令牌',
  reset_token VARCHAR(255) NOT NULL DEFAULT '' COMMENT '密码重置令牌',
  reset_token_expires TIMESTAMP NULL COMMENT '重置令牌过期时间',
  last_login_at TIMESTAMP NULL COMMENT '最后登录时间',
  login_count INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '登录次数',
  is_admin BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否管理员',
  status ENUM('active', 'inactive', 'banned') NOT NULL DEFAULT 'active' COMMENT '账号状态',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_email (email),
  KEY idx_status_created (status, created_at),
  KEY idx_verification_token (verification_token),
  KEY idx_reset_token (reset_token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- ========== 登录日志表（安全审计） ==========
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

-- ========== 活动报名表 ==========
CREATE TABLE IF NOT EXISTS activity_registrations (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NULL COMMENT '关联用户ID',
  activity_id VARCHAR(64) NOT NULL COMMENT '活动唯一标识',
  activity_title VARCHAR(255) NOT NULL DEFAULT '' COMMENT '活动标题',
  applicant_name VARCHAR(128) NOT NULL DEFAULT '' COMMENT '报名人姓名',
  applicant_org VARCHAR(255) NOT NULL DEFAULT '' COMMENT '学校/单位',
  phone VARCHAR(64) NOT NULL DEFAULT '' COMMENT '手机号',
  wechat VARCHAR(128) NOT NULL DEFAULT '' COMMENT '微信号',
  email VARCHAR(255) NOT NULL DEFAULT '' COMMENT '邮箱',
  remark TEXT NULL COMMENT '备注/自我介绍',
  status VARCHAR(32) NOT NULL DEFAULT 'pending' COMMENT '状态: pending/confirmed/cancelled/rejected',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_user_id (user_id),
  KEY idx_activity_id (activity_id),
  KEY idx_status_created (status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='活动报名表';

-- ========== 投递记录表（实习/实践申请） ==========
CREATE TABLE IF NOT EXISTS delivery_records (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NULL COMMENT '关联用户ID',
  opportunity_id VARCHAR(64) NOT NULL COMMENT '机会ID',
  opportunity_title VARCHAR(255) NOT NULL DEFAULT '' COMMENT '职位/机会标题',
  opportunity_type VARCHAR(32) NOT NULL DEFAULT 'internship' COMMENT '类型: internship/practice/project',
  applicant_name VARCHAR(128) NOT NULL DEFAULT '' COMMENT '申请人姓名',
  applicant_org VARCHAR(255) NOT NULL DEFAULT '' COMMENT '学校/单位',
  phone VARCHAR(64) NOT NULL DEFAULT '' COMMENT '手机号',
  wechat VARCHAR(128) NOT NULL DEFAULT '' COMMENT '微信号',
  email VARCHAR(255) NOT NULL DEFAULT '' COMMENT '邮箱',
  resume_url VARCHAR(1024) NOT NULL DEFAULT '' COMMENT '简历链接',
  cover_letter TEXT NULL COMMENT '求职信/申请说明',
  status VARCHAR(32) NOT NULL DEFAULT 'pending' COMMENT '状态: pending/reviewing/accepted/rejected',
  status_note VARCHAR(500) NOT NULL DEFAULT '' COMMENT '状态说明（如拒绝原因）',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_user_id (user_id),
  KEY idx_opportunity_id (opportunity_id),
  KEY idx_status_created (status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='投递记录表';

-- ========== 用户发布的活动表 ==========
CREATE TABLE IF NOT EXISTS user_events (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NULL COMMENT '发布者用户ID',
  user_name VARCHAR(128) NOT NULL DEFAULT '' COMMENT '发布者昵称（冗余快照）',
  user_org VARCHAR(255) NOT NULL DEFAULT '' COMMENT '发布者单位（冗余快照）',
  title VARCHAR(255) NOT NULL COMMENT '活动标题',
  meta VARCHAR(255) NOT NULL DEFAULT '' COMMENT '标签/来源',
  description TEXT NULL COMMENT '活动描述',
  image_url VARCHAR(1024) NOT NULL DEFAULT '' COMMENT '封面图',
  link_url VARCHAR(1024) NOT NULL DEFAULT '' COMMENT '报名/详情链接',
  event_date VARCHAR(64) NOT NULL DEFAULT '' COMMENT '活动时间（文本）',
  event_location VARCHAR(255) NOT NULL DEFAULT '' COMMENT '活动地点',
  max_participants INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '人数上限（0=不限）',
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending' COMMENT '审核状态',
  reject_reason VARCHAR(500) NOT NULL DEFAULT '' COMMENT '拒绝原因（同 review_note）',
  reviewed_at TIMESTAMP NULL COMMENT '审核时间',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_status_created (status, created_at),
  KEY idx_user_created (user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户发布的活动表';

-- ========== 用户发布的实习实践表 ==========
CREATE TABLE IF NOT EXISTS user_recruits (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NULL COMMENT '发布者用户ID',
  user_name VARCHAR(128) NOT NULL DEFAULT '' COMMENT '发布者昵称（冗余快照）',
  user_org VARCHAR(255) NOT NULL DEFAULT '' COMMENT '发布者单位（冗余快照）',
  title VARCHAR(255) NOT NULL COMMENT '职位标题',
  meta VARCHAR(255) NOT NULL DEFAULT '' COMMENT '标签/来源',
  description TEXT NULL COMMENT '职位描述',
  image_url VARCHAR(1024) NOT NULL DEFAULT '' COMMENT '封面图',
  link_url VARCHAR(1024) NOT NULL DEFAULT '' COMMENT '投递/详情链接',
  opportunity_type VARCHAR(32) NOT NULL DEFAULT 'internship' COMMENT '类型: internship/practice/project',
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending' COMMENT '审核状态',
  reject_reason VARCHAR(500) NOT NULL DEFAULT '' COMMENT '拒绝原因（同 review_note）',
  reviewed_at TIMESTAMP NULL COMMENT '审核时间',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_status_created (status, created_at),
  KEY idx_user_created (user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户发布的实习实践表';

-- ========== 管理员操作日志表 ==========
CREATE TABLE IF NOT EXISTS admin_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  admin_id BIGINT UNSIGNED NULL COMMENT '管理员用户ID',
  admin_name VARCHAR(128) NOT NULL DEFAULT '' COMMENT '管理员名称',
  action VARCHAR(64) NOT NULL DEFAULT '' COMMENT '操作类型: create/update/delete/approve/reject/login/export/import',
  target_type VARCHAR(64) NOT NULL DEFAULT '' COMMENT '操作对象类型',
  target_id BIGINT UNSIGNED NULL COMMENT '操作对象ID',
  detail TEXT NULL COMMENT '操作详情',
  ip VARCHAR(64) NOT NULL DEFAULT '' COMMENT 'IP地址',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_admin_id_created (admin_id, created_at),
  KEY idx_action_created (action, created_at),
  KEY idx_target (target_type, target_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员操作日志表';

-- ========== 内容管理表 ==========
CREATE TABLE IF NOT EXISTS content_items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  section_key VARCHAR(64) NOT NULL,
  group_key VARCHAR(64) NULL,
  title VARCHAR(255) NOT NULL DEFAULT '',
  meta VARCHAR(255) NOT NULL DEFAULT '',
  description TEXT NULL,
  image_url VARCHAR(1024) NOT NULL DEFAULT '',
  link_url VARCHAR(1024) NOT NULL DEFAULT '',
  items_json JSON NULL,
  slug VARCHAR(128) NOT NULL DEFAULT '',
  partner_name VARCHAR(255) NOT NULL DEFAULT '',
  partner_type VARCHAR(255) NOT NULL DEFAULT '',
  logo_url VARCHAR(1024) NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_section_group_sort (section_key, group_key, sort_order, id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='内容管理表';

-- ========== 生态对接申请表 ==========
CREATE TABLE IF NOT EXISTS directory_applications (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NULL COMMENT '关联用户ID',
  directory_type VARCHAR(32) NOT NULL,
  tracking_code VARCHAR(32) NOT NULL DEFAULT '' COMMENT '查询编号',
  target_title VARCHAR(255) NOT NULL DEFAULT '',
  target_meta VARCHAR(255) NOT NULL DEFAULT '',
  applicant_name VARCHAR(128) NOT NULL DEFAULT '',
  applicant_org VARCHAR(255) NOT NULL DEFAULT '',
  applicant_role VARCHAR(255) NOT NULL DEFAULT '',
  phone VARCHAR(64) NOT NULL DEFAULT '',
  wechat VARCHAR(128) NOT NULL DEFAULT '',
  email VARCHAR(255) NOT NULL DEFAULT '',
  cooperation_intent VARCHAR(255) NOT NULL DEFAULT '',
  message TEXT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  status_note VARCHAR(500) NOT NULL DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_tracking_code (tracking_code),
  KEY idx_user_id (user_id),
  KEY idx_directory_type_created (directory_type, created_at),
  KEY idx_status_created (status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='生态对接申请表';
