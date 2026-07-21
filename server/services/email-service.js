/**
 * 邮件服务
 * 支持 SMTP 发送邮件
 */
import nodemailer from "nodemailer";
import { config } from "../config.js";
import { logger } from "../utils/logger.js";

// 邮件传输器
let transporter = null;

/**
 * 初始化邮件传输器
 */
function getTransporter() {
  if (transporter) return transporter;

  // 检查邮件配置
  if (!config.email?.smtpHost || !config.email?.smtpPort || !config.email?.smtpUser) {
    logger.warn("邮件服务未配置，邮件功能将不可用");
    return null;
  }

  transporter = nodemailer.createTransport({
    host: config.email.smtpHost,
    port: config.email.smtpPort,
    secure: config.email.smtpPort === 465, // 465 端口使用 SSL
    auth: {
      user: config.email.smtpUser,
      pass: config.email.smtpPass
    },
    tls: {
      rejectUnauthorized: false // 允许自签名证书
    }
  });

  return transporter;
}

/**
 * 检查邮件服务是否可用
 */
export function isEmailEnabled() {
  return !!config.email?.smtpHost && !!config.email?.smtpUser;
}

/**
 * 发送邮件
 * @param {Object} options - 邮件选项
 * @param {string} options.to - 收件人邮箱
 * @param {string} options.subject - 邮件主题
 * @param {string} options.html - HTML 内容
 * @param {string} [options.text] - 纯文本内容
 */
export async function sendEmail(options) {
  const transport = getTransporter();
  if (!transport) {
    throw new Error("邮件服务未配置");
  }

  const from = config.email?.from || `"北京校园生态合作联盟" <${config.email.smtpUser}>`;

  const result = await transport.sendMail({
    from,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text
  });

  logger.info({ to: options.to, messageId: result.messageId }, "邮件发送成功");
  return result;
}

/**
 * 发送邮箱验证邮件
 * @param {string} email - 用户邮箱
 * @param {string} token - 验证令牌
 */
export async function sendVerificationEmail(email, token) {
  const verifyUrl = `${config.siteUrl || "http://localhost:3000"}/verify-email.html?token=${token}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>邮箱验证</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #4f46e5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #4f46e5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { margin-top: 30px; font-size: 12px; color: #6b7280; }
    .link { word-break: break-all; color: #4f46e5; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>北京校园生态合作联盟</h1>
    </div>
    <div class="content">
      <h2>欢迎加入我们！</h2>
      <p>请点击下方按钮验证您的邮箱地址：</p>
      <center><a href="${verifyUrl}" class="button">验证邮箱</a></center>
      <p>或者复制以下链接到浏览器：</p>
      <p class="link">${verifyUrl}</p>
      <p>此链接将在 24 小时后过期。</p>
      <div class="footer">
        <p>如果这不是您的操作，请忽略此邮件。</p>
        <p>北京校园生态合作联盟</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
欢迎加入北京校园生态合作联盟！

请点击以下链接验证您的邮箱地址：
${verifyUrl}

此链接将在 24 小时后过期。

如果这不是您的操作，请忽略此邮件。
  `;

  return sendEmail({
    to: email,
    subject: "【北京校园生态合作联盟】邮箱验证",
    html,
    text
  });
}

/**
 * 发送密码重置邮件
 * @param {string} email - 用户邮箱
 * @param {string} token - 重置令牌
 */
export async function sendPasswordResetEmail(email, token) {
  const resetUrl = `${config.siteUrl || "http://localhost:3000"}/forgot-password.html?token=${token}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>密码重置</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #4f46e5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #4f46e5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { margin-top: 30px; font-size: 12px; color: #6b7280; }
    .link { word-break: break-all; color: #4f46e5; }
    .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>北京校园生态合作联盟</h1>
    </div>
    <div class="content">
      <h2>密码重置请求</h2>
      <p>我们收到了您的密码重置请求。请点击下方按钮重置密码：</p>
      <center><a href="${resetUrl}" class="button">重置密码</a></center>
      <div class="warning">
        <strong>注意：</strong>此链接将在 24 小时后过期，请尽快操作。
      </div>
      <p>或者复制以下链接到浏览器：</p>
      <p class="link">${resetUrl}</p>
      <div class="footer">
        <p>如果这不是您的操作，请忽略此邮件，您的账户仍然安全。</p>
        <p>北京校园生态合作联盟</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
北京校园生态合作联盟 - 密码重置

我们收到了您的密码重置请求。请点击以下链接重置密码：
${resetUrl}

注意：此链接将在 24 小时后过期，请尽快操作。

如果这不是您的操作，请忽略此邮件，您的账户仍然安全。
  `;

  return sendEmail({
    to: email,
    subject: "【北京校园生态合作联盟】密码重置",
    html,
    text
  });
}
