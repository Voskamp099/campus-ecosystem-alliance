/**
 * 测试邮件服务配置
 */
import nodemailer from "nodemailer";

const config = {
  host: "smtp.exmail.qq.com",
  port: 465,
  secure: true, // 465 端口使用 SSL
  auth: {
    user: "noreply@alliance.local",
    pass: "otFXjoLrrPLszt5C"
  }
};

async function testEmail() {
  console.log("开始测试邮件服务配置...");
  console.log("SMTP 服务器:", config.host);
  console.log("端口:", config.port);
  console.log("发件人:", config.auth.user);
  
  try {
    // 创建传输器
    const transporter = nodemailer.createTransport(config);
    
    // 验证连接
    console.log("\n正在验证 SMTP 连接...");
    await transporter.verify();
    console.log("✓ SMTP 连接成功！");
    
    // 发送测试邮件
    console.log("\n正在发送测试邮件...");
    const info = await transporter.sendMail({
      from: `"北京校园生态合作联盟" <${config.auth.user}>`,
      to: config.auth.user, // 发送给自己
      subject: "邮件服务配置测试 - 北京校园生态合作联盟",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #2563eb;">邮件服务配置成功！</h2>
          <p>这是一封测试邮件，用于验证 SMTP 配置是否正确。</p>
          <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 14px;">
            北京校园生态合作联盟<br>
            发送时间: ${new Date().toLocaleString("zh-CN")}
          </p>
        </div>
      `
    });
    
    console.log("✓ 测试邮件发送成功！");
    console.log("Message ID:", info.messageId);
    console.log("\n请检查邮箱:", config.auth.user);
    
  } catch (error) {
    console.error("✗ 测试失败:", error.message);
    if (error.code === 'EAUTH') {
      console.error("\n可能的原因：");
      console.error("1. 邮箱地址或密码错误");
      console.error("2. 需要使用授权码而不是登录密码");
      console.error("3. SMTP 服务未开启");
    } else if (error.code === 'ECONNECTION') {
      console.error("\n可能的原因：");
      console.error("1. SMTP 服务器地址错误");
      console.error("2. 端口号错误");
      console.error("3. 网络连接问题");
    }
    process.exit(1);
  }
}

testEmail();
