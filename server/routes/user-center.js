
import { Router } from "express";
import { verifyToken } from "../services/auth-service.js";
import {
  getUserAllRecords,
  getUserDirectoryApplications,
  getUserActivityRegistrations,
  getUserDeliveryRecords,
  createActivityRegistration,
  createDeliveryRecord
} from "../services/user-center-service.js";
import { uploadAvatar, deleteOldAvatar } from "../services/avatar-service.js";
import { pool, isDatabaseAvailable } from "../db.js";
import { logger } from "../utils/logger.js";

const router = Router();

// ── 头像上传 ───────────────────────────────────────────────────
router.post("/user/avatar", verifyToken, async (req, res, next) => {
  try {
    if (!req.files || !req.files.avatar) {
      return res.status(400).json({ success: false, message: "请选择头像文件" });
    }

    const avatar = req.files.avatar;
    const userId = req.user.userId;

    // 验证文件类型
    if (!avatar.mimetype.startsWith("image/")) {
      return res.status(400).json({ success: false, message: "请选择图片文件" });
    }

    // 验证文件大小（最大 5MB）
    if (avatar.size > 5 * 1024 * 1024) {
      return res.status(400).json({ success: false, message: "图片大小不能超过 5MB" });
    }

    if (!(await isDatabaseAvailable())) {
      return res.status(503).json({ success: false, message: "数据库暂不可用，请稍后再试" });
    }

    // 获取旧头像
    const [rows] = await pool.query("SELECT avatar_url FROM users WHERE id = ?", [userId]);
    const oldAvatar = rows[0]?.avatar_url;

    // 上传新头像
    const avatarUrl = await uploadAvatar({
      buffer: avatar.data,
      userId,
      originalname: avatar.name
    });

    // 更新数据库
    await pool.query("UPDATE users SET avatar_url = ? WHERE id = ?", [avatarUrl, userId]);

    // 删除旧头像
    if (oldAvatar && oldAvatar !== avatarUrl) {
      await deleteOldAvatar(oldAvatar);
    }

    logger.info({ userId, avatarUrl }, "头像上传成功");

    res.json({ success: true, avatar_url: avatarUrl, message: "头像更新成功" });
  } catch (error) {
    logger.error({ err: error }, "头像上传失败");
    next(error);
  }
});

// ── 更新个人资料 ───────────────────────────────────────────────
router.put("/user/profile", verifyToken, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { nickname, bio, phone, org_name, org_role } = req.body;

    // 验证昵称
    if (nickname !== undefined) {
      if (nickname.length < 2 || nickname.length > 30) {
        return res.status(400).json({ success: false, message: "昵称长度应在 2-30 个字符之间" });
      }
    }

    // 验证手机号
    if (phone !== undefined && phone) {
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({ success: false, message: "请输入有效的手机号" });
      }
    }

    // 更新数据库
    const updates = [];
    const values = [];

    if (nickname !== undefined) {
      updates.push("nickname = ?");
      values.push(nickname);
    }
    if (bio !== undefined) {
      updates.push("bio = ?");
      values.push(bio);
    }
    if (phone !== undefined) {
      updates.push("phone = ?");
      values.push(phone);
    }
    if (org_name !== undefined) {
      updates.push("org_name = ?");
      values.push(org_name);
    }
    if (org_role !== undefined) {
      updates.push("org_role = ?");
      values.push(org_role);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: "没有要更新的字段" });
    }

    if (!(await isDatabaseAvailable())) {
      return res.status(503).json({ success: false, message: "数据库暂不可用，请稍后再试" });
    }

    values.push(userId);
    await pool.query(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, values);

    logger.info({ userId, updates }, "个人资料更新成功");

    res.json({ success: true, message: "资料更新成功" });
  } catch (error) {
    logger.error({ err: error }, "个人资料更新失败");
    next(error);
  }
});

// ── 获取用户信息 ───────────────────────────────────────────────
router.get("/user/profile", verifyToken, async (req, res, next) => {
  try {
    const userId = req.user.userId;

    if (!(await isDatabaseAvailable())) {
      return res.status(503).json({ success: false, message: "数据库暂不可用，请稍后再试" });
    }

    const [rows] = await pool.query(
      "SELECT id, email, nickname, bio, phone, org_name, org_role, avatar_url, created_at FROM users WHERE id = ?",
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "用户不存在" });
    }

    res.json({ success: true, user: rows[0] });
  } catch (error) {
    logger.error({ err: error }, "获取用户信息失败");
    next(error);
  }
});


// 旧路由（手机号查询，兼容旧版，标记 deprecated）
router.get("/user/records", verifyToken, async (req, res, next) => {
  try {
    // 记录只按令牌里的 userId 查, 不接受调用方指定手机号,
    // 否则知道别人手机号就能查到别人的对接申请和报名记录。
    const data = await getUserAllRecords(null, req.user.userId);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// 新路由：生态对接申请（JWT，userId 查询）
router.get("/user-center/applications", verifyToken, async (req, res, next) => {
  try {
    const records = await getUserDirectoryApplications(null, req.user.userId);
    res.json({ applications: records });
  } catch (error) {
    next(error);
  }
});

// 新路由：活动报名（JWT，userId 查询）
router.get("/user-center/registrations", verifyToken, async (req, res, next) => {
  try {
    const records = await getUserActivityRegistrations(null, req.user.userId);
    res.json({ registrations: records });
  } catch (error) {
    next(error);
  }
});

// 新路由：投递记录（JWT，userId 查询）
router.get("/user-center/deliveries", verifyToken, async (req, res, next) => {
  try {
    const records = await getUserDeliveryRecords(null, req.user.userId);
    res.json({ deliveries: records });
  } catch (error) {
    next(error);
  }
});

// 旧路由（手机号查询，标记 deprecated）
router.get("/user/directory-applications", verifyToken, async (req, res, next) => {
  try {
    const records = await getUserDirectoryApplications(null, req.user.userId);
    res.json({ records });
  } catch (error) {
    next(error);
  }
});

// 旧路由
router.get("/user/activity-registrations", verifyToken, async (req, res, next) => {
  try {
    const records = await getUserActivityRegistrations(null, req.user.userId);
    res.json({ records });
  } catch (error) {
    next(error);
  }
});

// 旧路由
router.get("/user/delivery-records", verifyToken, async (req, res, next) => {
  try {
    const records = await getUserDeliveryRecords(null, req.user.userId);
    res.json({ records });
  } catch (error) {
    next(error);
  }
});

// 创建活动报名（JWT，需登录）
router.post("/activity-registrations", verifyToken, async (req, res, next) => {
  try {
    const item = await createActivityRegistration({
      ...(req.body || {}),
      userId: req.user.userId
    });
    res.status(201).json({ message: "活动报名成功，请在我的查看审核状态。", item });
  } catch (error) {
    if (error.code === "ECONNREFUSED" || error.code === "ER_ACCESS_DENIED_ERROR") {
      return res.status(503).json({ message: "服务器暂时无法接收报名，请稍后再试。" });
    }
    next(error);
  }
});

// 创建投递记录（JWT，需登录）
router.post("/delivery-records", verifyToken, async (req, res, next) => {
  try {
    const item = await createDeliveryRecord({
      ...(req.body || {}),
      userId: req.user.userId
    });
    res.status(201).json({ message: "投递成功，请在我的查看审核状态。", item });
  } catch (error) {
    if (error.code === "ECONNREFUSED" || error.code === "ER_ACCESS_DENIED_ERROR") {
      return res.status(503).json({ message: "服务器暂时无法接收投递，请稍后再试。" });
    }
    next(error);
  }
});

export default router;
