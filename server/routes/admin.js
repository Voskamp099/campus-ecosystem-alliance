import { Router } from "express";
import multer from "multer";
import { createAdminToken, requireAdmin, verifyAdminCredentials } from "../auth.js";
import { config } from "../config.js";
import { csrfCookieNameValue } from "../utils/csrf.js";
import {
  createContent,
  deleteContent,
  exportAllContent,
  importAllContent,
  listContent,
  reorderContent,
  updateContent
} from "../services/content-service.js";
import { listDirectoryApplications, updateDirectoryApplication } from "../services/directory-application-service.js";
import { listActivityRegistrations, listDeliveryRecords } from "../services/user-center-service.js";
import {
  listAllUserEvents,
  listAllUserRecruits,
  approveEvent,
  approveRecruit,
  rejectEvent,
  rejectRecruit,
  deleteUserEvent,
  deleteUserRecruit
} from "../services/user-submission-service.js";
import { uploadImage } from "../services/upload-service.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.tos.maxUploadSizeMb * 1024 * 1024
  }
});

router.post("/auth/login", async (req, res, next) => {
  try {
    const { username = "", password = "" } = req.body || {};
    const valid = await verifyAdminCredentials(username, password);
    if (!valid) {
      return res.status(401).json({ message: "账号或密码错误" });
    }
    res.json({
      token: createAdminToken(),
      admin: { username: config.adminUsername }
    });
  } catch (error) {
    next(error);
  }
});

// 退出登录：JWT 无状态，这里主要清除服务端 CSRF cookie，返回 200
router.post("/auth/logout", (req, res) => {
  try {
    res.clearCookie(csrfCookieNameValue, { path: "/" });
  } catch (error) {}
  res.json({ success: true, message: "已退出登录" });
});

router.get("/auth/me", requireAdmin, (req, res) => {
  res.json({ admin: { username: req.admin.username } });
});

router.use(requireAdmin);

// 生态对接申请
router.get("/directory-applications", async (req, res, next) => {
  try {
    const items = await listDirectoryApplications();
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

// 活动报名
router.get("/activity-registrations", async (req, res, next) => {
  try {
    const items = await listActivityRegistrations();
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

// 投递记录
router.get("/delivery-records", async (req, res, next) => {
  try {
    const items = await listDeliveryRecords();
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

// ── 用户发布审核 ─────────────────────────

// 用户发布的活动（全部，含审核状态）
router.get("/user-events", async (req, res, next) => {
  try {
    const items = await listAllUserEvents();
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

// 用户发布的实习实践（全部）
router.get("/user-recruits", async (req, res, next) => {
  try {
    const items = await listAllUserRecruits();
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

// 审核通过活动
router.post("/user-events/:id/approve", async (req, res, next) => {
  try {
    const item = await approveEvent(Number(req.params.id));
    res.json({ success: true, message: "活动已通过审核", item });
  } catch (error) {
    next(error);
  }
});

// 拒绝活动
router.post("/user-events/:id/reject", async (req, res, next) => {
  try {
    const { note = "" } = req.body || {};
    const item = await rejectEvent(Number(req.params.id), note);
    res.json({ success: true, message: "活动已拒绝", item });
  } catch (error) {
    next(error);
  }
});

// 删除用户活动
router.delete("/user-events/:id", async (req, res, next) => {
  try {
    await deleteUserEvent(Number(req.params.id));
    res.json({ success: true, message: "已删除" });
  } catch (error) {
    next(error);
  }
});

// 审核通过实习实践
router.post("/user-recruits/:id/approve", async (req, res, next) => {
  try {
    const item = await approveRecruit(Number(req.params.id));
    res.json({ success: true, message: "实习实践已通过审核", item });
  } catch (error) {
    next(error);
  }
});

// 拒绝实习实践
router.post("/user-recruits/:id/reject", async (req, res, next) => {
  try {
    const { note = "" } = req.body || {};
    const item = await rejectRecruit(Number(req.params.id), note);
    res.json({ success: true, message: "实习实践已拒绝", item });
  } catch (error) {
    next(error);
  }
});

// 删除用户实习实践
router.delete("/user-recruits/:id", async (req, res, next) => {
  try {
    await deleteUserRecruit(Number(req.params.id));
    res.json({ success: true, message: "已删除" });
  } catch (error) {
    next(error);
  }
});

router.patch("/directory-applications/:id", async (req, res, next) => {
  try {
    const item = await updateDirectoryApplication(Number(req.params.id), req.body || {});
    res.json({ item });
  } catch (error) {
    next(error);
  }
});

router.get("/content", async (req, res, next) => {
  try {
    const { sectionKey, groupKey = null } = req.query;
    const items = await listContent(sectionKey, groupKey || null);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.post("/content", async (req, res, next) => {
  try {
    const { sectionKey, groupKey = null, item } = req.body || {};
    const created = await createContent(sectionKey, groupKey || null, item || {});
    res.status(201).json({ item: created });
  } catch (error) {
    next(error);
  }
});

router.put("/content/:id", async (req, res, next) => {
  try {
    const item = await updateContent(Number(req.params.id), req.body?.item || {});
    res.json({ item });
  } catch (error) {
    next(error);
  }
});

router.delete("/content/:id", async (req, res, next) => {
  try {
    await deleteContent(Number(req.params.id));
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

router.post("/content/reorder", async (req, res, next) => {
  try {
    const { sectionKey, groupKey = null, ids = [] } = req.body || {};
    await reorderContent(sectionKey, groupKey || null, ids);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

router.get("/export", async (req, res, next) => {
  try {
    const payload = await exportAllContent();
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

router.post("/import", async (req, res, next) => {
  try {
    await importAllContent(req.body || {});
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

router.post("/upload", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "请先选择图片" });
    }
    const result = await uploadImage(req.file);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});


// 用户统计
router.get("/users/stats", async (req, res, next) => {
  try {
    const { getUserStats } = await import("../services/auth-service.js");
    const stats = await getUserStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
});

// 用户列表
router.get("/users", async (req, res, next) => {
  try {
    const { getAllUsers } = await import("../services/auth-service.js");
    const users = await getAllUsers();
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
});

export default router;
