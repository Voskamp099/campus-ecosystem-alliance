-- 添加头像和个人简介字段到用户表
-- 执行方式：mysql -u root -p alliance_website < database/migrations/add_avatar_field.sql

ALTER TABLE users 
ADD COLUMN avatar_url VARCHAR(1024) NOT NULL DEFAULT '' AFTER nickname,
ADD COLUMN bio TEXT NULL AFTER org_role;

-- 更新现有用户，设置默认头像
UPDATE users SET avatar_url = '' WHERE avatar_url IS NULL OR avatar_url = '';
