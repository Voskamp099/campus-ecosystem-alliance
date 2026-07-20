import { Router } from "express";
import jwt from "jsonwebtoken";
import { 
  createUser, 
  validateLogin, 
  verifyEmail,
  createPasswordResetToken,
  resetPassword,
  changePassword,
  updateUserProfile,
  findUserById,
  logLoginAttempt,
  formatUserResponse
} from "../services/auth-service.js";
import { getConfig } from "../config.js";
import { loginLimiter, registerLimiter } from "../utils/rate-limiter.js";
import { logger } from "../utils/logger.js";
import { validators } from "../utils/validator.js";
import { sendVerificationEmail, sendPasswordResetEmail, isEmailEnabled } from "../services/email-service.js";

const router = Router();

// 获取客户端IP
function getClientIp(req) {
  return req.headers["x-forwarded-for"]?.split(",")[0]?.trim() 
    || req.headers["x-real-ip"] 
    || req.connection.remoteAddress 
    || "";
}

// 生成JWT
function generateToken(user) {
  const config = getConfig();
  return jwt.sign(
    { 
      userId: user.id,
      email: user.email,
      nickname: user.nickname,
      role: (user.isAdmin || user.is_admin) ? "admin" : "user"
    },
    config.jwtSecret,
    { expiresIn: "7d" }
  );
}

// 注册
router.post("/register", registerLimiter, validators.register, async (req, res) => {
  try {
    const { email, password, nickname, phone, realName, orgName, orgRole } = req.body;
    const isAdmin = email === (getConfig().adminEmail);
    
    const result = await createUser({
      email,
      password,
      nickname,
      phone,
      realName,
      orgName,
      orgRole
    });

    const token = generateToken(result.user);

    // 发送验证邮件（异步，不阻塞响应）
    if (isEmailEnabled() && result.verificationToken) {
      sendVerificationEmail(result.user.email, result.verificationToken)
        .then(() => {
          logger.info({ email: result.user.email }, "验证邮件发送成功");
        })
        .catch((err) => {
          logger.error({ err, email: result.user.email }, "验证邮件发送失败");
        });
    }

    logger.info({ email: result.user.email }, "用户注册成功");

    res.json({
      success: true,
      message: isEmailEnabled() 
        ? "注册成功，验证邮件已发送到您的邮箱" 
        : "注册成功",
      token,
      user: formatUserResponse(result.user),
      emailVerificationRequired: isEmailEnabled() && !result.user.email_verified
    });
  } catch (error) {
    logger.error({ err: error }, "注册失败");
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// 登录
router.post("/login", loginLimiter, validators.login, async (req, res) => {
  const ipAddress = getClientIp(req);
  const userAgent = req.headers["user-agent"] || "";

  try {
    const { email, identifier, password } = req.body;
    const loginIdentifier = identifier || email;
    const user = await validateLogin(loginIdentifier, password);

    // 记录登录日志（不影响主流程）
    logLoginAttempt({
      userId: user.id, ipAddress, userAgent, loginType: "password", success: true
    }).catch(() => {});

    const token = generateToken(user);
    const role = (user.isAdmin || user.is_admin) ? "admin" : "user";
    
    logger.info({ email: user.email, ip: ipAddress }, "用户登录成功");

    res.json({
      success: true,
      message: "登录成功",
      token,
      user: formatUserResponse(user)
    });
  } catch (error) {
    // 记录失败日志（不影响主流程）
    logLoginAttempt({
      ipAddress, userAgent, loginType: "password", success: false, failReason: error.message
    }).catch(() => {});
    
    logger.warn({ ip: ipAddress, error: error.message }, "登录失败");

    res.status(401).json({
      success: false,
      message: error.message
    });
  }
});

// 验证邮箱
router.get("/verify-email", async (req, res) => {
  try {
    const { token } = req.query;
    const result = await verifyEmail(token);

    if (result.alreadyVerified) {
      res.json({
        success: true,
        message: "邮箱已验证",
        alreadyVerified: true
      });
    } else {
      res.json({
        success: true,
        message: "邮箱验证成功",
        alreadyVerified: false
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// 发送密码重置邮件
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const result = await createPasswordResetToken(email);

    if (result.user && result.token) {
      if (isEmailEnabled()) {
        // 发送密码重置邮件（异步，不阻塞响应）
        sendPasswordResetEmail(result.user.email, result.token)
          .then(() => {
            logger.info({ email: result.user.email }, "密码重置邮件发送成功");
          })
          .catch((err) => {
            logger.error({ err, email: result.user.email }, "密码重置邮件发送失败");
          });
      } else {
        // 邮件服务未配置，返回 token 供测试使用
        logger.info({ email: result.user.email, token: result.token }, "密码重置 token 已生成（邮件服务未配置）");
      }
    }

    // 无论邮箱是否存在，返回相同提示（安全考虑）
    // 如果邮件服务未配置，返回 token 供测试
    const response = {
      success: true,
      message: "如果该邮箱已注册，我们将发送密码重置链接"
    };
    
    // 开发环境下返回 token（仅用于测试）
    if (result.user && result.token && !isEmailEnabled()) {
      response.token = result.token;
      response.message = "密码重置链接已生成（邮件服务未配置，请使用返回的 token）";
    }
    
    res.json(response);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// 重置密码
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    await resetPassword(token, newPassword);

    res.json({
      success: true,
      message: "密码重置成功，请使用新密码登录"
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// 获取当前用户信息（需要认证）
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "请先登录"
      });
    }

    const token = authHeader.slice(7);
    const config = getConfig();
    const decoded = jwt.verify(token, config.jwtSecret);

    const user = await findUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "用户不存在或已被禁用"
      });
    }

    res.json({
      success: true,
      user: formatUserResponse(user)
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "登录已过期，请重新登录"
      });
    }
    res.status(401).json({
      success: false,
      message: "登录状态无效"
    });
  }
});

// 更新用户信息（需要认证）
router.put("/profile", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "请先登录"
      });
    }

    const token = authHeader.slice(7);
    const config = getConfig();
    const decoded = jwt.verify(token, config.jwtSecret);

    const user = await updateUserProfile(decoded.userId, req.body);

    res.json({
      success: true,
      message: "更新成功",
      user: formatUserResponse(user)
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "登录已过期"
      });
    }
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// 修改密码（需要认证）
router.put("/change-password", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "请先登录"
      });
    }

    const token = authHeader.slice(7);
    const config = getConfig();
    const decoded = jwt.verify(token, config.jwtSecret);

    const { oldPassword, newPassword } = req.body;
    await changePassword(decoded.userId, oldPassword, newPassword);

    res.json({
      success: true,
      message: "密码修改成功"
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "登录已过期"
      });
    }
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
