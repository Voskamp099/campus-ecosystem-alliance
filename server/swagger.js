import swaggerJsdoc from "swagger-jsdoc";
import { config } from "./config.js";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "北京校园生态合作联盟 API",
      version: "1.4.0",
      description: "北京校园生态合作联盟后端 API 文档\n\n## 认证方式\n\n大部分 API 需要 JWT 认证，请在请求头中添加：\n```\nAuthorization: Bearer <your_token>\n```\n\n## 环境变量\n\n请参考 `.env.example` 配置必要的环境变量。",
      contact: {
        name: "北京校园生态合作联盟",
        email: "support@alliance.local"
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT"
      }
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: "开发服务器"
      },
      {
        url: "https://alliance.example.com",
        description: "生产服务器"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT 认证令牌"
        }
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            email: { type: "string", format: "email", example: "user@example.com" },
            nickname: { type: "string", example: "张三" },
            avatar_url: { type: "string", format: "uri", example: "https://example.com/avatar.jpg" },
            phone: { type: "string", example: "13800138000" },
            real_name: { type: "string", example: "张三" },
            org_name: { type: "string", example: "北京大学" },
            org_role: { type: "string", example: "学生" },
            email_verified: { type: "boolean", example: true },
            created_at: { type: "string", format: "date-time" }
          }
        },
        DirectoryApplication: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            directory_type: { type: "string", enum: ["campus", "government", "company"] },
            tracking_code: { type: "string", example: "DA202401010001" },
            target_title: { type: "string", example: "某科技公司" },
            target_meta: { type: "string", example: "互联网企业" },
            applicant_name: { type: "string", example: "张三" },
            applicant_org: { type: "string", example: "北京大学" },
            applicant_role: { type: "string", example: "项目负责人" },
            phone: { type: "string", example: "13800138000" },
            wechat: { type: "string", example: "zhangsan123" },
            email: { type: "string", format: "email", example: "zhangsan@example.com" },
            cooperation_intent: { type: "string", example: "技术合作" },
            message: { type: "string", example: "希望开展校企合作" },
            status: { type: "string", enum: ["pending", "reviewing", "matched", "contacted", "completed", "rejected"] },
            status_note: { type: "string" },
            created_at: { type: "string", format: "date-time" }
          }
        },
        ActivityRegistration: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            activity_id: { type: "integer", example: 1 },
            activity_title: { type: "string", example: "OpenClaw 从安装到落地" },
            applicant_name: { type: "string", example: "张三" },
            applicant_org: { type: "string", example: "北京大学" },
            phone: { type: "string", example: "13800138000" },
            wechat: { type: "string", example: "zhangsan123" },
            email: { type: "string", format: "email", example: "zhangsan@example.com" },
            remark: { type: "string", example: "期待参加" },
            status: { type: "string", enum: ["pending", "confirmed", "cancelled", "rejected"] },
            created_at: { type: "string", format: "date-time" }
          }
        },
        DeliveryRecord: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            opportunity_id: { type: "integer", example: 1 },
            opportunity_title: { type: "string", example: "AI 产品经理实习生" },
            opportunity_type: { type: "string", enum: ["internship", "volunteer", "project"] },
            applicant_name: { type: "string", example: "张三" },
            applicant_org: { type: "string", example: "北京大学" },
            phone: { type: "string", example: "13800138000" },
            wechat: { type: "string", example: "zhangsan123" },
            email: { type: "string", format: "email", example: "zhangsan@example.com" },
            resume_url: { type: "string", format: "uri" },
            cover_letter: { type: "string" },
            status: { type: "string", enum: ["pending", "reviewing", "interviewed", "accepted", "rejected"] },
            status_note: { type: "string" },
            created_at: { type: "string", format: "date-time" }
          }
        },
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: {
              type: "object",
              properties: {
                code: { type: "string", example: "VALIDATION_ERROR" },
                message: { type: "string", example: "请求参数验证失败" },
                details: { type: "object" }
              }
            }
          }
        },
        Success: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "操作成功" },
            data: { type: "object" }
          }
        }
      }
    },
    tags: [
      { name: "Auth", description: "认证相关接口" },
      { name: "User", description: "用户信息接口" },
      { name: "Directory", description: "生态对接接口" },
      { name: "Activity", description: "活动相关接口" },
      { name: "Delivery", description: "投递记录接口" },
      { name: "Public", description: "公开数据接口" },
      { name: "Admin", description: "管理员接口" }
    ]
  },
  apis: [
    "./server/routes/*.js",
    "./server/docs/*.yaml"
  ]
};

export const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
