import { Router } from "express";
import { getSiteContent } from "../services/content-service.js";
import { createDirectoryApplication, queryDirectoryApplicationProgress } from "../services/directory-application-service.js";
import { getApprovedEvents, getApprovedRecruits } from "../services/user-submission-service.js";

const router = Router();

router.get("/site-content", async (req, res, next) => {
  try {
    const data = await getSiteContent();
    // 合并用户发布的已审核内容
    const [userEvents, userRecruits] = await Promise.all([
      getApprovedEvents().catch(() => []),
      getApprovedRecruits().catch(() => [])
    ]);
    data.userEvents = userEvents;
    data.userRecruits = userRecruits;
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.post("/directory-applications", async (req, res, next) => {
  try {
    const item = await createDirectoryApplication(req.body || {});
    res.status(201).json({
      message: "对接申请已提交，我们会尽快与你联系。",
      item
    });
  } catch (error) {
    // 数据库不可用时返回明确的 503，避免前端收到难以理解的 500
    if (error.code === "ECONNREFUSED" || error.code === "ER_ACCESS_DENIED_ERROR") {
      return res.status(503).json({
        message: "服务器暂时无法接收申请，请稍后再试，或通过页面底部企业微信联系我们。"
      });
    }
    next(error);
  }
});

router.post("/directory-applications/query", async (req, res, next) => {
  try {
    const item = await queryDirectoryApplicationProgress(req.body || {});
    res.json({ item });
  } catch (error) {
    next(error);
  }
});

export default router;
