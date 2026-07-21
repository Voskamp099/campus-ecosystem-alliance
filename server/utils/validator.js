import { body, param, query, validationResult } from "express-validator";
import xss from "xss";
import { ValidationError } from "./errors.js";

/**
 * XSS 过滤配置
 */
const xssOptions = {
  whiteList: {
    // 允许的 HTML 标签和属性
    a: ["href", "title", "target"],
    img: ["src", "alt", "title"],
    b: [],
    i: [],
    u: [],
    strong: [],
    em: [],
    br: [],
    p: [],
  },
  stripIgnoreTag: true, // 过滤所有非白名单标签
  stripIgnoreTagBody: ["script", "style"], // 过滤 script 和 style 标签内容
};

/**
 * XSS 过滤函数
 * @param {string} input - 输入字符串
 * @returns {string} 过滤后的字符串
 */
export function sanitizeInput(input) {
  if (typeof input !== "string") return input;
  return xss(input, xssOptions);
}

/**
 * 递归过滤对象中的所有字符串
 * @param {any} obj - 输入对象
 * @returns {any} 过滤后的对象
 */
export function sanitizeObject(obj) {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === "string") {
    return sanitizeInput(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item));
  }

  if (typeof obj === "object") {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[sanitizeInput(key)] = sanitizeObject(value);
    }
    return sanitized;
  }

  return obj;
}

/**
 * 输入验证中间件
 * 检查验证结果，如果有错误则抛出 ValidationError
 */
export function validate(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => ({
      field: error.path,
      message: error.msg,
      value: error.value,
    }));

    const message = errorMessages.map((e) => `${e.field}: ${e.message}`).join("; ");
    return next(new ValidationError(message));
  }

  // XSS 过滤
  req.body = sanitizeObject(req.body);
  req.query = sanitizeObject(req.query);
  req.params = sanitizeObject(req.params);

  next();
}

/**
 * 常用验证规则
 */
export const validators = {
  // 用户注册
  register: [
    body("email")
      .trim()
      .isEmail()
      .withMessage("请输入有效的邮箱地址")
      .normalizeEmail()
      .isLength({ max: 255 })
      .withMessage("邮箱长度不能超过 255 个字符"),

    body("password")
      .isLength({ min: 8, max: 100 })
      .withMessage("密码长度必须在 8-100 个字符之间")
      .matches(/^(?=.*[a-zA-Z])(?=.*\d)/)
      .withMessage("密码必须包含字母和数字"),

    body("nickname")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("昵称长度不能超过 100 个字符"),

    body("phone")
      .optional({ checkFalsy: true })
      .trim()
      .matches(/^1[3-9]\d{9}$/)
      .withMessage("请输入有效的手机号码"),

    body("realName")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("真实姓名长度不能超过 100 个字符"),

    body("orgName")
      .optional()
      .trim()
      .isLength({ max: 255 })
      .withMessage("组织名称长度不能超过 255 个字符"),

    body("orgRole")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("职位长度不能超过 100 个字符"),

    validate,
  ],

  // 用户登录
  login: [
    body("email")
      .optional()
      .trim()
      .isEmail()
      .withMessage("请输入有效的邮箱地址")
      .normalizeEmail(),

    body("identifier")
      .optional()
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage("登录标识不能为空"),

    body("password")
      .notEmpty()
      .withMessage("密码不能为空")
      .isLength({ max: 100 })
      .withMessage("密码长度不能超过 100 个字符"),

    validate,
  ],

  // 活动报名
  activityRegistration: [
    body("eventId")
      .trim()
      .notEmpty()
      .withMessage("活动 ID 不能为空")
      .isLength({ max: 100 })
      .withMessage("活动 ID 长度不能超过 100 个字符"),

    body("eventTitle")
      .trim()
      .notEmpty()
      .withMessage("活动标题不能为空")
      .isLength({ max: 255 })
      .withMessage("活动标题长度不能超过 255 个字符"),

    body("name")
      .trim()
      .notEmpty()
      .withMessage("姓名不能为空")
      .isLength({ max: 100 })
      .withMessage("姓名长度不能超过 100 个字符"),

    body("phone")
      .trim()
      .notEmpty()
      .withMessage("手机号不能为空")
      .matches(/^1[3-9]\d{9}$/)
      .withMessage("请输入有效的手机号码"),

    body("email")
      .optional()
      .trim()
      .isEmail()
      .withMessage("请输入有效的邮箱地址")
      .normalizeEmail(),

    body("orgName")
      .optional()
      .trim()
      .isLength({ max: 255 })
      .withMessage("组织名称长度不能超过 255 个字符"),

    body("message")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("留言长度不能超过 1000 个字符"),

    validate,
  ],

  // 投递记录
  deliveryRecord: [
    body("recruitId")
      .trim()
      .notEmpty()
      .withMessage("实习实践 ID 不能为空")
      .isLength({ max: 100 })
      .withMessage("实习实践 ID 长度不能超过 100 个字符"),

    body("recruitTitle")
      .trim()
      .notEmpty()
      .withMessage("实习实践标题不能为空")
      .isLength({ max: 255 })
      .withMessage("实习实践标题长度不能超过 255 个字符"),

    body("name")
      .trim()
      .notEmpty()
      .withMessage("姓名不能为空")
      .isLength({ max: 100 })
      .withMessage("姓名长度不能超过 100 个字符"),

    body("phone")
      .trim()
      .notEmpty()
      .withMessage("手机号不能为空")
      .matches(/^1[3-9]\d{9}$/)
      .withMessage("请输入有效的手机号码"),

    body("email")
      .optional()
      .trim()
      .isEmail()
      .withMessage("请输入有效的邮箱地址")
      .normalizeEmail(),

    body("resumeUrl")
      .optional()
      .trim()
      .isURL()
      .withMessage("简历链接格式不正确")
      .isLength({ max: 1024 })
      .withMessage("简历链接长度不能超过 1024 个字符"),

    body("message")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("留言长度不能超过 1000 个字符"),

    validate,
  ],

  // 对接申请
  directoryApplication: [
    body("directory_type")
      .trim()
      .notEmpty()
      .withMessage("对接类型不能为空")
      .isIn(["campus", "government", "company"])
      .withMessage("对接类型必须是 campus、government 或 company"),

    body("target_title")
      .trim()
      .notEmpty()
      .withMessage("目标名称不能为空")
      .isLength({ max: 255 })
      .withMessage("目标名称长度不能超过 255 个字符"),

    body("applicant_name")
      .trim()
      .notEmpty()
      .withMessage("申请人姓名不能为空")
      .isLength({ max: 128 })
      .withMessage("申请人姓名长度不能超过 128 个字符"),

    body("applicant_org")
      .trim()
      .notEmpty()
      .withMessage("申请人组织不能为空")
      .isLength({ max: 255 })
      .withMessage("申请人组织长度不能超过 255 个字符"),

    body("applicant_role")
      .optional()
      .trim()
      .isLength({ max: 255 })
      .withMessage("申请人职位长度不能超过 255 个字符"),

    body("phone")
      .trim()
      .notEmpty()
      .withMessage("手机号不能为空")
      .matches(/^1[3-9]\d{9}$/)
      .withMessage("请输入有效的手机号码"),

    body("wechat")
      .optional()
      .trim()
      .isLength({ max: 128 })
      .withMessage("微信号长度不能超过 128 个字符"),

    body("email")
      .optional()
      .trim()
      .isEmail()
      .withMessage("请输入有效的邮箱地址")
      .normalizeEmail(),

    body("cooperation_intent")
      .optional()
      .trim()
      .isLength({ max: 255 })
      .withMessage("合作意向长度不能超过 255 个字符"),

    body("message")
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage("留言长度不能超过 2000 个字符"),

    validate,
  ],

  // 内容创建/更新
  content: [
    body("section_key")
      .trim()
      .notEmpty()
      .withMessage("栏目类型不能为空")
      .isIn(["hero_carousel", "categories", "category_details", "recruit", "events", "partners", "directory"])
      .withMessage("无效的栏目类型"),

    body("group_key")
      .optional()
      .trim()
      .isLength({ max: 64 })
      .withMessage("分组键长度不能超过 64 个字符"),

    body("title")
      .trim()
      .notEmpty()
      .withMessage("标题不能为空")
      .isLength({ max: 255 })
      .withMessage("标题长度不能超过 255 个字符"),

    body("meta")
      .optional()
      .trim()
      .isLength({ max: 255 })
      .withMessage("元信息长度不能超过 255 个字符"),

    body("description")
      .optional()
      .trim()
      .isLength({ max: 5000 })
      .withMessage("描述长度不能超过 5000 个字符"),

    body("image_url")
      .optional()
      .trim()
      .isURL()
      .withMessage("图片链接格式不正确")
      .isLength({ max: 1024 })
      .withMessage("图片链接长度不能超过 1024 个字符"),

    body("link_url")
      .optional()
      .trim()
      .isURL()
      .withMessage("链接格式不正确")
      .isLength({ max: 1024 })
      .withMessage("链接长度不能超过 1024 个字符"),

    validate,
  ],

  // ID 参数验证
  id: [
    param("id")
      .trim()
      .notEmpty()
      .withMessage("ID 不能为空")
      .isInt({ min: 1 })
      .withMessage("ID 必须是正整数"),

    validate,
  ],

  // 分页参数验证
  pagination: [
    query("page")
      .optional()
      .trim()
      .isInt({ min: 1 })
      .withMessage("页码必须是正整数"),

    query("pageSize")
      .optional()
      .trim()
      .isInt({ min: 1, max: 100 })
      .withMessage("每页条数必须在 1-100 之间"),

    validate,
  ],
};

export default {
  sanitizeInput,
  sanitizeObject,
  validate,
  validators,
};
