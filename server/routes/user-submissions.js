import { Router } from "express";
import { verifyToken } from "../services/auth-service.js";
import {
  createEvent,
  createRecruit,
  getUserEvents,
  getUserRecruits,
  approveEvent,
  approveRecruit,
  rejectEvent,
  rejectRecruit,
  deleteUserEvent,
  deleteUserRecruit,
  listAllUserEvents,
  listAllUserRecruits,
  getApprovedEvents,
  getApprovedRecruits
} from "../services/user-submission-service.js";

const router = Router();

// ── 用户接口（需登录）────────────────────────

// 发布活动
router.post("/submit/event", verifyToken, async (req, res, next) => {
  try {
    const item = await createEvent({ ...req.body, userId: req.user.userId });
    res.status(201).json({ success: true, message: "活动发布成功，等待管理员审核。", item });
  } catch (error) {
    next(error);
  }
});

// 发布实习/实践
router.post("/submit/recruit", verifyToken, async (req, res, next) => {
  try {
    const item = await createRecruit({ ...req.body, userId: req.user.userId });
    res.status(201).json({ success: true, message: "实习实践发布成功，等待管理员审核。", item });
  } catch (error) {
    next(error);
  }
});

// 查看我的发布（活动）
router.get("/my/events", verifyToken, async (req, res, next) => {
  try {
    const items = await getUserEvents(req.user.userId);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

// 查看我的发布（实习）
router.get("/my/recruits", verifyToken, async (req, res, next) => {
  try {
    const items = await getUserRecruits(req.user.userId);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

// ── 公共接口（无需登录，返回已审核内容）────────────

router.get("/public/user-events", async (req, res, next) => {
  try {
    const items = await getApprovedEvents();
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.get("/public/user-recruits", async (req, res, next) => {
  try {
    const items = await getApprovedRecruits();
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

export default router;
