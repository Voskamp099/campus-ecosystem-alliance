const CONFIG = {
  heroVisual: {
    label: "首屏轮播图",
    desc: "管理首页标题右侧的 16:9 横版轮播图，适合上传活动照片、标题和跳转链接。",
    sectionKey: "hero_carousel",
    groupKey: null,
    fields: { meta: true, desc: false, link: true, items: false },
    placeholder: { title: "例如：联盟活动现场", meta: "例如：活动照片", link: "例如：https://example.com" }
  },
  categories: {
    label: "资源分类",
    desc: "上传图片、标题和描述，用于首页资源分类卡片展示。",
    sectionKey: "categories",
    groupKey: null,
    fields: { meta: false, desc: true, link: false, items: true },
    placeholder: { title: "例如：学习提升", desc: "例如：课程、工具、论文与学业支持", items: "一行一个，例如\nAI 学习工具\n论文辅助资源" }
  },
  hubContent: {
    label: "联盟权益中心内容",
    desc: "统一管理吃喝玩乐、衣食住行、学习提升、就业创业、实习实践、近期活动六类内容。",
    sectionKey: null,
    groupKey: null,
    fields: { meta: true, desc: true, link: true, items: false },
    placeholder: { title: "例如：线下聚会与城市活动", meta: "例如：2026.04.10 · 北京 · 线下活动", desc: "例如：活动详情、亮点说明、参与方式", link: "例如：https://example.com" }
  },
  directory: {
    label: "生态对接名录",
    desc: "按校园方、政府方、企业方三类统一管理生态对接名录卡片。",
    sectionKey: "directory",
    groupKey: null,
    fields: { meta: true, desc: true, link: true, items: true },
    placeholder: { title: "例如：北京大学学生创新中心", meta: "例如：校园方 · 创新实践", desc: "例如：适合联合开展实践活动、训练营与校内传播合作", link: "例如：https://example.com", items: "一行一个，例如\n活动共建\n校内传播\n实践项目对接" }
  },
  applications: {
    label: "对接申请",
    desc: "查看站内提交的生态对接申请内容，便于统一审核、跟进与分发。",
    sectionKey: null,
    groupKey: null,
    fields: { meta: false, desc: false, link: false, items: false },
    placeholder: {}
  },
  partners: {
    label: "合作伙伴",
    desc: "上传合作伙伴 logo、名称和类型，支持高校成员、企业伙伴、政府伙伴三类。",
    sectionKey: "partners",
    groupKey: null,
    fields: { meta: true, desc: false, link: false, items: false },
    placeholder: { title: "例如：北京大学", meta: "例如：综合院校" }
  },
  users: {
    label: "用户列表",
    desc: "查看所有注册用户信息，支持搜索过滤。",
    sectionKey: null,
    groupKey: null,
    fields: { meta: false, desc: false, link: false, items: false },
    placeholder: {}
  },
  userStats: {
    label: "用户统计",
    desc: "查看用户注册和登录的统计数据概览。",
    sectionKey: null,
    groupKey: null,
    fields: { meta: false, desc: false, link: false, items: false },
    placeholder: {}
  },
  activityRegs: {
    label: "活动报名",
    desc: "查看用户提交的活动报名记录。",
    sectionKey: null,
    groupKey: null,
    fields: { meta: false, desc: false, link: false, items: false },
    placeholder: {}
  },
  deliveryRecords: {
    label: "投递记录",
    desc: "查看用户提交的实习实践投递记录。",
    sectionKey: null,
    groupKey: null,
    fields: { meta: false, desc: false, link: false, items: false },
    placeholder: {}
  },
  userEvents: {
    label: "用户活动",
    desc: "审核用户发布的活动内容。",
    sectionKey: null,
    groupKey: null,
    fields: { meta: false, desc: false, link: false, items: false },
    placeholder: {}
  },
  userRecruits: {
    label: "用户实习",
    desc: "审核用户发布的实习实践内容。",
    sectionKey: null,
    groupKey: null,
    fields: { meta: false, desc: false, link: false, items: false },
    placeholder: {}
  }
};

const PARTNER_SUBTABS = {
  university: { label: "高校成员", groupKey: "university" },
  company: { label: "企业伙伴", groupKey: "company" },
  government: { label: "政府伙伴", groupKey: "government" }
};

const DIRECTORY_SUBTABS = {
  campus: {
    label: "校园方",
    groupKey: "campus",
    placeholder: { title: "例如：北京大学学生创新中心", meta: "例如：校园方 · 创新实践", desc: "例如：适合联合开展实践活动、训练营与校内传播合作", link: "例如：https://example.com", items: "一行一个，例如\n活动共建\n校内传播\n实践项目对接" }
  },
  government: {
    label: "政府方",
    groupKey: "government",
    placeholder: { title: "例如：中关村青年创新服务平台", meta: "例如：政府方 · 科创服务", desc: "例如：适合科创活动协办、政策宣讲和青年项目资源对接", link: "例如：https://example.com", items: "一行一个，例如\n政策宣讲\n活动协办\n人才合作" }
  },
  company: {
    label: "企业方",
    groupKey: "company",
    placeholder: { title: "例如：百度 AI 生态合作组", meta: "例如：企业方 · AI 生态", desc: "例如：适合 AI 生态宣讲、实践机会对接和校园资源合作", link: "例如：https://example.com", items: "一行一个，例如\n校园宣讲\n实践机会\n生态合作" }
  }
};

const CATEGORY_DETAIL_SUBTABS = {
  "food-fun": { label: "吃喝玩乐", groupKey: "food-fun" },
  lifestyle: { label: "衣食住行", groupKey: "lifestyle" },
  "study-life": { label: "学习提升", groupKey: "study-life" },
  "career-startup": { label: "就业创业", groupKey: "career-startup" }
};

const HUB_CONTENT_SUBTABS = {
  "food-fun": {
    label: "吃喝玩乐",
    sectionKey: "category_details",
    groupKey: "food-fun",
    placeholder: { title: "例如：线下聚会与城市活动", meta: "例如：2026.04.10 · 北京 · 线下活动", desc: "例如：活动详情、亮点说明、参与方式", link: "例如：https://example.com" }
  },
  lifestyle: {
    label: "衣食住行",
    sectionKey: "category_details",
    groupKey: "lifestyle",
    placeholder: { title: "例如：出行与生活服务", meta: "例如：长期开放 · 城市生活", desc: "例如：活动详情、亮点说明、参与方式", link: "例如：https://example.com" }
  },
  "study-life": {
    label: "学习提升",
    sectionKey: "category_details",
    groupKey: "study-life",
    placeholder: { title: "例如：学习工具与资料", meta: "例如：学习提升 · 工具资料", desc: "例如：资源亮点、适用对象、参与方式", link: "例如：https://example.com" }
  },
  "career-startup": {
    label: "就业创业",
    sectionKey: "category_details",
    groupKey: "career-startup",
    placeholder: { title: "例如：实习实践与创业支持", meta: "例如：就业创业 · 资源对接", desc: "例如：活动详情、亮点说明、参与方式", link: "例如：https://example.com" }
  },
  recruit: {
    label: "实习实践",
    sectionKey: "recruit",
    groupKey: null,
    placeholder: { title: "例如：AI 产品经理实习生", meta: "例如：北京 · 京东总部 · 实习 3 个月+", desc: "例如：适合对 AI 产品感兴趣的同学", link: "例如：mailto:hr@example.com" }
  },
  events: {
    label: "近期活动",
    sectionKey: "events",
    groupKey: null,
    placeholder: { title: "例如：OpenClaw 从安装到落地", meta: "例如：AI 活动 · 北京", desc: "例如：围绕 AI 工具落地的交流活动", link: "例如：https://example.com" }
  }
};

const IS_FILE_MODE = window.location.protocol === "file:";
// 离线（file://）模式下的演示管理员账号：用户名与线上 .env 的 ADMIN_USERNAME 保持一致（admin），
// 密码为本地演示默认值。线上 server 模式以 .env 中的 ADMIN_PASSWORD 为准，切勿依赖此处硬编码值。
const LOCAL_ADMIN_USERNAME = "admin";
const LOCAL_ADMIN_PASSWORD = "123456";
const LOCAL_TOKEN_KEY = "alliance_admin_token";

const LOCAL_DEFAULTS = {
  alliance_content_hero_carousel: [
    { id: 1, title: "联盟活动现场", meta: "活动照片", image: "", link: "#events" }
  ],
  alliance_content_categories: [
    { id: 1, slug: "food-fun", title: "吃喝玩乐", desc: "餐饮折扣、青年社交与线下聚会资源。", image: "", items: ["联盟餐饮折扣", "线下聚会优先报名"] },
    { id: 2, slug: "lifestyle", title: "衣食住行", desc: "酒店优惠、购物折扣、出行补贴等。", image: "", items: ["酒店会员优惠", "出行补贴"] },
    { id: 3, slug: "study-life", title: "学习提升", desc: "课程、工具、论文与学业支持。", image: "", items: ["AI 学习工具", "论文辅助资源"] },
    { id: 4, slug: "career-startup", title: "就业创业", desc: "实习实践、创业者社群和导师支持。", image: "", items: ["实习实践", "创业者社群"] }
  ],
  "alliance_content_category_details_food-fun": [
    { id: 1, title: "线下聚会与城市活动", desc: "适合周末聚会、社交联谊和城市探索活动。", image: "", link: "#join" }
  ],
  alliance_content_category_details_lifestyle: [
    { id: 1, title: "出行与生活服务", desc: "覆盖住宿、出行、消费折扣和生活服务权益。", image: "", link: "#join" }
  ],
  "alliance_content_category_details_study-life": [
    { id: 1, title: "学习工具与资料", desc: "围绕课程、工具、论文和学习社群整理的内容。", image: "", link: "#join" }
  ],
  "alliance_content_category_details_career-startup": [
    { id: 1, title: "实习实践与创业支持", desc: "适合找机会、找伙伴、找资源的同学。", image: "", link: "#join" }
  ],
  alliance_content_recruit: [
    { id: 1, title: "AI 产品经理实习生", meta: "北京 · 京东总部 · 实习 3 个月+", desc: "适合对 AI 产品和需求分析有兴趣的同学。", image: "", link: "mailto:hr@example.com" }
  ],
  alliance_content_events: [
    { id: 1, title: "OpenClaw 从安装到落地", meta: "AI 活动 · 北京", desc: "围绕 AI 工具落地的交流活动。", image: "", link: "#events" },
    { id: 2, title: "校园生态合作闭门交流", meta: "联盟活动 · 北京", desc: "聚焦校园生态合作、资源协同与活动共建的深度交流。", image: "", link: "#events" },
    { id: 3, title: "青年成长与实践分享会", meta: "成长活动 · 线下", desc: "围绕实践机会、成长路径和跨校交流展开分享与答疑。", image: "", link: "#events" }
  ],
  alliance_logos_university: [],
  alliance_logos_company: [],
  alliance_logos_government: [],
  alliance_directory_campus: [
    { id: 1, title: "北京大学学生创新中心", meta: "校园方 · 创新实践", desc: "适合联合开展实践活动、训练营与校内传播合作。", image: "", link: "#join", items: ["活动共建", "校内传播", "实践项目对接"] },
    { id: 2, title: "清华大学学生职业发展协会", meta: "校园方 · 就业成长", desc: "适合对接职业发展分享、企业参访与联合招募活动。", image: "", link: "#join", items: ["职业分享", "企业参访", "联合招募"] }
  ],
  alliance_directory_government: [
    { id: 1, title: "中关村青年创新服务平台", meta: "政府方 · 科创服务", desc: "适合科创活动协办、政策宣讲和青年项目资源对接。", image: "", link: "#join", items: ["政策宣讲", "活动协办", "项目对接"] },
    { id: 2, title: "北京经开区人才服务窗口", meta: "政府方 · 人才支持", desc: "适合人才政策传播、实习实践合作与区域活动共建。", image: "", link: "#join", items: ["人才合作", "实践合作", "区域联动"] }
  ],
  alliance_directory_company: [
    { id: 1, title: "百度 AI 生态合作组", meta: "企业方 · AI 生态", desc: "适合 AI 生态宣讲、实践机会对接和校园资源合作。", image: "", link: "#join", items: ["校园宣讲", "实践机会", "生态合作"] },
    { id: 2, title: "京东校园合作团队", meta: "企业方 · 校园合作", desc: "适合企业开放日、校企活动与实践岗位合作。", image: "", link: "#join", items: ["开放日", "校企活动", "岗位合作"] }
  ],
  alliance_directory_applications: []
};

const STATE = {
  token: localStorage.getItem(LOCAL_TOKEN_KEY) || "",
  mainTab: "categories",
  subTab: "university",
  hubTab: "food-fun",
  directoryTab: "campus",
  editingIndex: -1,
  imageData: "",
  items: [],
  users: [],
  userStats: null,
  userSearchKeyword: ""
};
let csrfTokenCache = "";

function applyModeUI() {
  const modeBadge = document.getElementById("modeBadge");
  const modeNotice = document.getElementById("modeNotice");
  const loginUsername = document.getElementById("loginUsername");
  const loginPassword = document.getElementById("loginPassword");

  if (IS_FILE_MODE) {
    modeBadge.textContent = "本地模式 · 浏览器存储";
    modeBadge.classList.add("local");
    modeBadge.classList.remove("live");
    modeNotice.innerHTML = "<strong>当前是本地模式。</strong> 你的修改会保存在当前浏览器 localStorage，不会同步到服务器。默认超级管理员账号为 <code>admin</code>，默认测试密码为 <code>123456</code>。";
    loginUsername.placeholder = "本地模式默认账号：admin";
    loginPassword.placeholder = "本地模式默认密码：123456";
    return;
  }

  modeBadge.textContent = "正式模式 · 服务器接口";
  modeBadge.classList.add("live");
  modeBadge.classList.remove("local");
  modeNotice.innerHTML = "<strong>当前是正式模式。</strong> 登录后会直接操作服务器内容、数据库和对象存储，导入导出前建议先备份。";
  loginUsername.placeholder = "请输入后台账号";
  loginPassword.placeholder = "请输入后台密码";
}

function currentConfig() {
  return CONFIG[STATE.mainTab];
}

function getActiveKeys() {
  const config = currentConfig();
  if (STATE.mainTab === "partners") {
    return { sectionKey: config.sectionKey, groupKey: PARTNER_SUBTABS[STATE.subTab].groupKey };
  }
  if (STATE.mainTab === "directory") {
    return { sectionKey: config.sectionKey, groupKey: DIRECTORY_SUBTABS[STATE.directoryTab].groupKey };
  }
  if (STATE.mainTab === "hubContent") {
    return {
      sectionKey: HUB_CONTENT_SUBTABS[STATE.hubTab].sectionKey,
      groupKey: HUB_CONTENT_SUBTABS[STATE.hubTab].groupKey
    };
  }
  return { sectionKey: config.sectionKey, groupKey: config.groupKey };
}

function escapeHTML(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function showToast(message, isError = false) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.style.background = isError ? "rgba(244,63,94,0.94)" : "rgba(16,185,129,0.94)";
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2400);
}

function getLocalStorageKey(sectionKey, groupKey = null) {
  if (sectionKey === "hero_carousel") return "alliance_content_hero_carousel";
  if (sectionKey === "categories") return "alliance_content_categories";
  if (sectionKey === "category_details") return `alliance_content_category_details_${groupKey}`;
  if (sectionKey === "recruit") return "alliance_content_recruit";
  if (sectionKey === "events") return "alliance_content_events";
  if (sectionKey === "partners") return `alliance_logos_${groupKey}`;
  if (sectionKey === "directory") return `alliance_directory_${groupKey}`;
  throw new Error("无效的栏目类型");
}

function getDirectoryTypeLabel(type) {
  return DIRECTORY_SUBTABS[type]?.label || type || "未分类";
}

function getApplicationStatusLabel(status) {
  return ({
    pending: "联盟初审中",
    reviewing: "对接评估中",
    matched: "已转交对接",
    contacted: "对接沟通中",
    completed: "对接已完成",
    rejected: "当前暂不匹配"
  })[status] || status || "联盟初审中";
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getLocalData(key) {
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch (error) {}
  return clone(LOCAL_DEFAULTS[key] || []);
}

function setLocalData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function nextLocalId(items) {
  return items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
}

async function localApi(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const parseBody = () => {
    if (!options.body) return {};
    if (typeof options.body === "string") return JSON.parse(options.body);
    return options.body;
  };

  if (path === "/api/admin/auth/me" && method === "GET") {
    const token = STATE.token || localStorage.getItem(LOCAL_TOKEN_KEY);
    if (token !== "local-admin-token") {
      throw new Error("登录态已失效，请重新登录");
    }
    return { admin: { username: LOCAL_ADMIN_USERNAME } };
  }

  if (path === "/api/admin/auth/login" && method === "POST") {
    const body = parseBody();
    if (body.username === LOCAL_ADMIN_USERNAME && body.password === LOCAL_ADMIN_PASSWORD) {
      return {
        token: "local-admin-token",
        admin: { username: LOCAL_ADMIN_USERNAME }
      };
    }
    throw new Error("账号或密码错误");
  }

  if (path.startsWith("/api/admin/content?") && method === "GET") {
    const query = new URLSearchParams(path.split("?")[1] || "");
    const key = getLocalStorageKey(query.get("sectionKey"), query.get("groupKey"));
    return { items: getLocalData(key) };
  }

  if (path === "/api/admin/content" && method === "POST") {
    const body = parseBody();
    const key = getLocalStorageKey(body.sectionKey, body.groupKey || null);
    const items = getLocalData(key);
    const item = { ...body.item, id: nextLocalId(items) };
    items.push(item);
    setLocalData(key, items);
    return { item };
  }

  if (path.startsWith("/api/admin/content/") && method === "PUT") {
    const id = Number(path.split("/").pop());
    const body = parseBody();
    const { sectionKey, groupKey } = getActiveKeys();
    const key = getLocalStorageKey(sectionKey, groupKey);
    const items = getLocalData(key);
    const index = items.findIndex(item => Number(item.id) === id);
    if (index < 0) throw new Error("内容不存在");
    items[index] = { ...items[index], ...body.item, id };
    setLocalData(key, items);
    return { item: items[index] };
  }

  if (path.startsWith("/api/admin/content/") && method === "DELETE") {
    const id = Number(path.split("/").pop());
    const { sectionKey, groupKey } = getActiveKeys();
    const key = getLocalStorageKey(sectionKey, groupKey);
    const items = getLocalData(key).filter(item => Number(item.id) !== id);
    setLocalData(key, items);
    return { ok: true };
  }

  if (path === "/api/admin/content/reorder" && method === "POST") {
    const body = parseBody();
    const key = getLocalStorageKey(body.sectionKey, body.groupKey || null);
    const items = getLocalData(key);
    const itemMap = new Map(items.map(item => [Number(item.id), item]));
    const reordered = body.ids.map(id => itemMap.get(Number(id))).filter(Boolean);
    setLocalData(key, reordered);
    return { ok: true };
  }

  if (path === "/api/admin/users" && method === "GET") {
    return { success: true, data: getLocalData("alliance_users_list") };
  }

  if (path === "/api/admin/users/stats" && method === "GET") {
    const users = getLocalData("alliance_users_list");
    const now = new Date();
    const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    return {
      success: true,
      data: {
        total: users.length,
        admin: users.filter(u => u.isAdmin).length,
        active: users.filter(u => u.status === "active").length,
        newToday: users.filter(u => u.createdAt && new Date(u.createdAt) > oneDayAgo).length,
        newThisWeek: users.filter(u => u.createdAt && new Date(u.createdAt) > sevenDaysAgo).length,
        newThisMonth: users.filter(u => u.createdAt && new Date(u.createdAt) > thirtyDaysAgo).length,
        recentLogin: users.filter(u => u.lastLoginAt && new Date(u.lastLoginAt) > sevenDaysAgo).length
      }
    };
  }

  if (path === "/api/admin/export" && method === "GET") {
    const payload = {};
    Object.values(CONFIG).forEach(config => {
      if (config.sectionKey && !["partners", "directory"].includes(config.sectionKey)) {
        payload[getLocalStorageKey(config.sectionKey)] = getLocalData(getLocalStorageKey(config.sectionKey));
      }
    });
    Object.keys(PARTNER_SUBTABS).forEach(key => {
      payload[getLocalStorageKey("partners", key)] = getLocalData(getLocalStorageKey("partners", key));
    });
    Object.keys(DIRECTORY_SUBTABS).forEach(key => {
      payload[getLocalStorageKey("directory", key)] = getLocalData(getLocalStorageKey("directory", key));
    });
    payload.alliance_directory_applications = getLocalData("alliance_directory_applications");
    Object.values(HUB_CONTENT_SUBTABS).forEach(config => {
      payload[getLocalStorageKey(config.sectionKey, config.groupKey)] = getLocalData(getLocalStorageKey(config.sectionKey, config.groupKey));
    });
    return payload;
  }

  if (path === "/api/admin/directory-applications" && method === "GET") {
    return { items: getLocalData("alliance_directory_applications") };
  }

  if (path.startsWith("/api/admin/directory-applications/") && method === "PATCH") {
    const id = Number(path.split("/").pop());
    const body = parseBody();
    const items = getLocalData("alliance_directory_applications");
    const index = items.findIndex(item => Number(item.id) === id);
    if (index < 0) throw new Error("对接申请不存在");
    items[index] = {
      ...items[index],
      status: body.status || items[index].status || "pending",
      statusNote: body.statusNote || "",
      updatedAt: new Date().toISOString()
    };
    setLocalData("alliance_directory_applications", items);
    return { item: items[index] };
  }

  if (path === "/api/admin/activity-registrations" && method === "GET") {
    return { items: getLocalData("alliance_activity_registrations") };
  }

  if (path === "/api/admin/delivery-records" && method === "GET") {
    return { items: getLocalData("alliance_delivery_records") };
  }

  if (path === "/api/admin/user-events" && method === "GET") {
    return { items: getLocalData("alliance_user_events") };
  }

  if (path === "/api/admin/user-recruits" && method === "GET") {
    return { items: getLocalData("alliance_user_recruits") };
  }

  if (path.startsWith("/api/admin/user-events/") && method === "POST") {
    const id = Number(path.split("/")[4]);
    const action = path.split("/")[5];
    const items = getLocalData("alliance_user_events");
    const index = items.findIndex(item => Number(item.id) === id);
    if (index >= 0) {
      items[index].status = action === "approve" ? "approved" : "rejected";
      setLocalData("alliance_user_events", items);
    }
    return { ok: true, item: items[index] || {} };
  }

  if (path.startsWith("/api/admin/user-recruits/") && method === "POST") {
    const id = Number(path.split("/")[4]);
    const action = path.split("/")[5];
    const items = getLocalData("alliance_user_recruits");
    const index = items.findIndex(item => Number(item.id) === id);
    if (index >= 0) {
      items[index].status = action === "approve" ? "approved" : "rejected";
      setLocalData("alliance_user_recruits", items);
    }
    return { ok: true, item: items[index] || {} };
  }

  if (path.startsWith("/api/admin/user-events/") && method === "DELETE") {
    const id = Number(path.split("/")[4]);
    setLocalData("alliance_user_events", getLocalData("alliance_user_events").filter(item => Number(item.id) !== id));
    return { ok: true };
  }

  if (path.startsWith("/api/admin/user-recruits/") && method === "DELETE") {
    const id = Number(path.split("/")[4]);
    setLocalData("alliance_user_recruits", getLocalData("alliance_user_recruits").filter(item => Number(item.id) !== id));
    return { ok: true };
  }

  if (path === "/api/admin/import" && method === "POST") {
    const body = parseBody();
    Object.keys(body).forEach(key => setLocalData(key, Array.isArray(body[key]) ? body[key] : []));
    return { ok: true };
  }

  throw new Error("本地模式暂不支持这个请求");
}

async function api(path, options = {}) {
  if (IS_FILE_MODE) {
    return localApi(path, options);
  }
  const method = String(options.method || "GET").toUpperCase();
  const headers = new Headers(options.headers || {});
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (STATE.token) {
    headers.set("Authorization", `Bearer ${STATE.token}`);
  }
  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    if (!csrfTokenCache) {
      const csrfRes = await fetch("/api/csrf-token", { method: "GET" });
      const csrfData = await csrfRes.json().catch(() => null);
      csrfTokenCache = csrfData?.csrfToken || "";
    }
    if (csrfTokenCache) {
      headers.set("X-CSRF-Token", csrfTokenCache);
    }
  }
  let response = await fetch(path, { ...options, headers });
  // CSRF 403 时自动刷新 token 重试一次
  if (response.status === 403) {
    csrfTokenCache = "";
    const csrfRes = await fetch("/api/csrf-token", { method: "GET" });
    const csrfData = await csrfRes.json().catch(() => null);
    csrfTokenCache = csrfData?.csrfToken || "";
    if (csrfTokenCache) {
      headers.set("X-CSRF-Token", csrfTokenCache);
    }
    response = await fetch(path, { ...options, headers });
  }
  if (response.status === 401) {
    handleLogout();
    throw new Error("登录态已失效，请重新登录");
  }
  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json() : null;
  if (!response.ok) {
    throw new Error(payload?.message || "请求失败");
  }
  return payload;
}

function updateAuthUI(authed, username = "") {
  const authGate = document.getElementById("authGate");
  const appShell = document.getElementById("appShell");
  const logoutBtn = document.getElementById("logoutBtn");
  const adminIdentity = document.getElementById("adminIdentity");

  if (authGate) authGate.classList.toggle("hidden", authed);
  if (appShell) appShell.classList.toggle("hidden", !authed);
  if (logoutBtn) logoutBtn.classList.toggle("hidden", !authed);
  if (adminIdentity) adminIdentity.textContent = authed ? `当前账号：${username}` : "";
}

// 解析 JWT token（用于检查 alliance_token）
function parseJwt(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log('[Admin] parseJwt: invalid format, parts=', parts.length, token.substring(0, 50));
      return null;
    }
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length + (4 - base64.length % 4) % 4;
    const jsonPayload = decodeURIComponent(atob(base64 + '='.repeat(pad)).split('').map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.log('[Admin] parseJwt error:', e.message, 'token start:', token.substring(0, 30));
    return null;
  }
}

// 检查是否是管理员（从 alliance_token）
function checkAllianceAdminToken() {
  const token = localStorage.getItem('alliance_token');
  console.log('[Admin] Checking alliance_token:', token ? 'exists' : 'not found');
  console.log('[Admin] Raw token:', token); // 打印原始token
  if (!token) return null;
  if (IS_FILE_MODE && token === "local-admin-token") {
    try {
      const localUser = JSON.parse(localStorage.getItem("alliance_user") || "null");
      if (localUser && localUser.isAdmin) {
        console.log('[Admin] Local admin session verified');
        return {
          token,
          payload: {
            email: localUser.email || "",
            nickname: localUser.nickname || LOCAL_ADMIN_USERNAME,
            role: "admin"
          }
        };
      }
    } catch (error) {
      console.log('[Admin] Local admin session parse error:', error.message);
    }
  }
  const payload = parseJwt(token);
  console.log('[Admin] JWT payload:', payload);
  if (payload && payload.role === 'admin') {
    console.log('[Admin] Admin token verified');
    return { token, payload };
  }
  console.log('[Admin] Not admin role:', payload ? payload.role : 'null');
  return null;
}

// 确保本地存在一条管理员用户记录，方便“我的”页面识别管理员身份
function ensureAdminUser(payload) {
  try {
    if (localStorage.getItem("alliance_user")) return;
    localStorage.setItem("alliance_user", JSON.stringify({
      isAdmin: true,
      nickname: (payload && (payload.nickname || payload.email)) || "管理员",
      email: (payload && payload.email) || "admin@alliance.local"
    }));
  } catch (error) {}
}

async function checkAuth() {
  if (IS_FILE_MODE) {
    // 先检查 alliance_token（用户中心登录的）
    const allianceAdmin = checkAllianceAdminToken();
    if (allianceAdmin) {
      STATE.token = allianceAdmin.token;
      ensureAdminUser(allianceAdmin.payload);
      updateAuthUI(true, allianceAdmin.payload.nickname || allianceAdmin.payload.email || '管理员');
      return true;
    }
    // 再检查本地 token
    const token = STATE.token || localStorage.getItem(LOCAL_TOKEN_KEY);
    const authed = token === "local-admin-token";
    updateAuthUI(authed, authed ? LOCAL_ADMIN_USERNAME : "");
    return authed;
  }
  
  // 先检查 alliance_token（用户中心登录的）
  const allianceAdmin = checkAllianceAdminToken();
  if (allianceAdmin) {
    STATE.token = allianceAdmin.token;
    ensureAdminUser(allianceAdmin.payload);
    updateAuthUI(true, allianceAdmin.payload.nickname || allianceAdmin.payload.email || '管理员');
    return true;
  }
  
  if (!STATE.token) {
    updateAuthUI(false);
    return false;
  }
  try {
    const data = await api("/api/admin/auth/me", { method: "GET" });
    updateAuthUI(true, data.admin.username);
    return true;
  } catch (error) {
    updateAuthUI(false);
    return false;
  }
}

async function handleLogin(event) {
  event.preventDefault();
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value;
  const errorEl = document.getElementById("loginError");
  errorEl.textContent = "";
  try {
    const data = await api("/api/admin/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password })
    });
    STATE.token = data.token;
    localStorage.setItem(LOCAL_TOKEN_KEY, STATE.token);
    // 让前台其余页面（如“我的”）也能识别管理员身份
    try {
      localStorage.setItem("alliance_user", JSON.stringify({
        isAdmin: true,
        nickname: (data.admin && data.admin.username) || "管理员",
        email: "admin@alliance.local"
      }));
    } catch (error) {}
    updateAuthUI(true, data.admin.username);
    await renderUI();
    showToast("登录成功");
  } catch (error) {
    errorEl.textContent = error.message;
  }
}

function handleLogout() {
  // 服务端退出：清除 CSRF cookie（best-effort，不阻塞跳转）
  if (!IS_FILE_MODE && STATE.token) {
    const headers = { "Content-Type": "application/json" };
    if (csrfTokenCache) headers["X-CSRF-Token"] = csrfTokenCache;
    headers["Authorization"] = `Bearer ${STATE.token}`;
    fetch("/api/admin/auth/logout", { method: "POST", headers, keepalive: true }).catch(() => {});
  }
  STATE.token = "";
  try { localStorage.removeItem(LOCAL_TOKEN_KEY); } catch (error) {}
  try { localStorage.removeItem("alliance_token"); } catch (error) {}
  try { localStorage.removeItem("alliance_user"); } catch (error) {}
  try { document.documentElement.classList.remove("admin-preauthed"); } catch (error) {}
  updateAuthUI(false);
  // 明确退出：回到首页（或文件模式的 index.html）
  if (IS_FILE_MODE) {
    window.location.href = "index.html";
  } else {
    window.location.href = "/";
  }
}

async function loadItems() {
  if (STATE.mainTab === "applications") {
    const data = await api("/api/admin/directory-applications", { method: "GET" });
    STATE.items = data.items || [];
    return;
  }
  if (STATE.mainTab === "activityRegs") {
    const data = await api("/api/admin/activity-registrations", { method: "GET" });
    STATE.items = data.items || [];
    return;
  }
  if (STATE.mainTab === "deliveryRecords") {
    const data = await api("/api/admin/delivery-records", { method: "GET" });
    STATE.items = data.items || [];
    return;
  }
  if (STATE.mainTab === "userEvents") {
    const data = await api("/api/admin/user-events", { method: "GET" });
    STATE.items = data.items || [];
    return;
  }
  if (STATE.mainTab === "userRecruits") {
    const data = await api("/api/admin/user-recruits", { method: "GET" });
    STATE.items = data.items || [];
    return;
  }
  if (STATE.mainTab === "users") {
    const data = await api("/api/admin/users", { method: "GET" });
    STATE.users = data.data || data.items || [];
    return;
  }
  if (STATE.mainTab === "userStats") {
    const data = await api("/api/admin/users/stats", { method: "GET" });
    STATE.userStats = data.data || data;
    return;
  }
  const { sectionKey, groupKey } = getActiveKeys();
  const query = new URLSearchParams({ sectionKey });
  if (groupKey) query.set("groupKey", groupKey);
  const data = await api(`/api/admin/content?${query.toString()}`, { method: "GET" });
  STATE.items = data.items || [];
}

function renderTabs() {
  const mainTabs = document.getElementById("mainTabs");
  mainTabs.innerHTML = Object.keys(CONFIG).map(key => (
    `<button class="tab-btn ${STATE.mainTab === key ? "active" : ""}" data-tab="${key}">${CONFIG[key].label}</button>`
  )).join("");
  mainTabs.querySelectorAll("[data-tab]").forEach(button => {
    button.addEventListener("click", async () => {
      STATE.mainTab = button.dataset.tab;
      await renderUI();
    });
  });
}

function renderSubTabs() {
  const wrap = document.getElementById("subTabs");
  if (STATE.mainTab === "partners") {
    wrap.innerHTML = Object.keys(PARTNER_SUBTABS).map(key => (
      `<button class="subtab-btn ${STATE.subTab === key ? "active" : ""}" data-subtab="${key}">${PARTNER_SUBTABS[key].label}</button>`
    )).join("");
    wrap.querySelectorAll("[data-subtab]").forEach(button => {
      button.addEventListener("click", async () => {
        STATE.subTab = button.dataset.subtab;
        await renderUI();
      });
    });
    return;
  }
  if (STATE.mainTab === "directory") {
    wrap.innerHTML = Object.keys(DIRECTORY_SUBTABS).map(key => (
      `<button class="subtab-btn ${STATE.directoryTab === key ? "active" : ""}" data-directory-tab="${key}">${DIRECTORY_SUBTABS[key].label}</button>`
    )).join("");
    wrap.querySelectorAll("[data-directory-tab]").forEach(button => {
      button.addEventListener("click", async () => {
        STATE.directoryTab = button.dataset.directoryTab;
        await renderUI();
      });
    });
    return;
  }
  if (STATE.mainTab === "hubContent") {
    wrap.innerHTML = Object.keys(HUB_CONTENT_SUBTABS).map(key => (
      `<button class="subtab-btn ${STATE.hubTab === key ? "active" : ""}" data-hub-tab="${key}">${HUB_CONTENT_SUBTABS[key].label}</button>`
    )).join("");
    wrap.querySelectorAll("[data-hub-tab]").forEach(button => {
      button.addEventListener("click", async () => {
        STATE.hubTab = button.dataset.hubTab;
        await renderUI();
      });
    });
    return;
  }
  wrap.innerHTML = "";
}

function renderPanelHead() {
  const info = currentConfig();
  document.getElementById("panelTitle").textContent =
    STATE.mainTab === "partners"
      ? `${info.label} · ${PARTNER_SUBTABS[STATE.subTab].label}`
      : STATE.mainTab === "directory"
        ? `${info.label} · ${DIRECTORY_SUBTABS[STATE.directoryTab].label}`
        : STATE.mainTab === "hubContent"
          ? `${info.label} · ${HUB_CONTENT_SUBTABS[STATE.hubTab].label}`
          : info.label;
  document.getElementById("panelDesc").textContent = info.desc;
}

function renderUserStats() {
  const grid = document.getElementById("grid");
  const stats = STATE.userStats || {};
  const cards = [
    { label: "总用户数", value: stats.total || 0, icon: "\u{1F465}", color: "#60a5fa" },
    { label: "管理员数", value: stats.admin || 0, icon: "\u{1F511}", color: "#fbbf24" },
    { label: "活跃用户", value: stats.active || 0, icon: "\u{2705}", color: "#34d399" },
    { label: "今日新增", value: stats.newToday || 0, icon: "\u{1F195}", color: "#f472b6" },
    { label: "本周新增", value: stats.newThisWeek || 0, icon: "\u{1F4C5}", color: "#a78bfa" },
    { label: "本月新增", value: stats.newThisMonth || 0, icon: "\u{1F4C6}", color: "#22d3ee" },
    { label: "近期登录", value: stats.recentLogin || 0, icon: "\u{1F50D}", color: "#fb923c" }
  ];
  grid.innerHTML = '<div class="stats-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:14px;padding:8px 0;">' +
    cards.map(c => (
      '<div class="card" style="padding:18px 12px;text-align:center;border:1px solid var(--line);border-radius:18px;background:rgba(255,255,255,0.04);">' +
        '<div style="font-size:36px;margin-bottom:12px;">' + c.icon + '</div>' +
        '<div style="font-size:32px;font-weight:800;color:' + c.color + ';">' + escapeHTML(String(c.value)) + '</div>' +
        '<div style="color:var(--text-muted);font-size:14px;margin-top:8px;">' + escapeHTML(c.label) + '</div>' +
      '</div>'
    )).join("") +
    '</div>' +
    '<div style="padding:16px 0;color:var(--text-muted);font-size:13px;text-align:center;">' +
      '近期登录 = 最近 7 天内有登录记录的用户数；今日/本周/本月新增按注册时间统计。' +
    '</div>';
}

function renderUsers() {
  const grid = document.getElementById("grid");
  const keyword = (STATE.userSearchKeyword || "").trim().toLowerCase();

  let users = STATE.users || [];
  if (keyword) {
    users = users.filter(u =>
      (u.email || "").toLowerCase().includes(keyword) ||
      (u.nickname || "").toLowerCase().includes(keyword) ||
      (u.phone || "").toLowerCase().includes(keyword) ||
      (u.realName || "").toLowerCase().includes(keyword) ||
      (u.orgName || "").toLowerCase().includes(keyword)
    );
  }

  const searchBox =
    '<div style="margin-bottom:16px;display:flex;gap:12px;align-items:center;flex-wrap:wrap;">' +
      '<input type="text" id="userSearchInput" class="input" placeholder="搜索邮箱、昵称、手机号、姓名或单位..." value="' + escapeHTML(STATE.userSearchKeyword || "") + '" ' +
        'style="flex:1;min-width:200px;padding:10px 14px;border:1px solid var(--line);border-radius:12px;background:rgba(255,255,255,0.05);color:var(--text);font-size:14px;">' +
      '<span style="color:var(--text-muted);font-size:13px;">共 ' + users.length + ' 位用户' + (keyword ? '（已过滤）' : '') + '</span>' +
    '</div>';

  if (!users.length) {
    grid.innerHTML = searchBox +
      '<div class="card empty"><div>' + (keyword ? '没有匹配的用户' : '暂时还没有注册用户') + '<br><span style="font-size:12px;">' + (keyword ? '试试其他关键词' : '用户通过 /register.html 注册后会出现在这里') + '</span></div></div>';
    bindUserSearch();
    return;
  }

  const rows = users.map(u => {
    const verified = u.emailVerified ? '<span style="color:#34d399;">\u2713 已验证</span>' : '<span style="color:var(--text-muted);">\u2717 未验证</span>';
    const status = u.status === "active"
      ? '<span style="color:#34d399;">正常</span>'
      : u.status === "banned"
        ? '<span style="color:#fb7185;">封禁</span>'
        : '<span style="color:#fbbf24;">停用</span>';
    const adminBadge = u.isAdmin ? ' <span style="color:#fbbf24;font-weight:700;">\u{1F511} 管理员</span>' : '';
    return '<tr>' +
      '<td style="padding:8px 12px;color:var(--text-muted);font-size:12px;word-break:break-word;">' + escapeHTML(String(u.id)) + '</td>' +
      '<td style="padding:8px 12px;word-break:break-word;">' + escapeHTML(u.email || "-") + adminBadge + '</td>' +
      '<td style="padding:8px 12px;word-break:break-word;">' + escapeHTML(u.nickname || "-") + '</td>' +
      '<td style="padding:8px 12px;color:var(--text-soft);font-size:13px;word-break:break-word;">' + escapeHTML(u.phone || "-") + '</td>' +
      '<td style="padding:8px 12px;color:var(--text-soft);font-size:13px;word-break:break-word;">' + escapeHTML(u.orgName || "-") + '</td>' +
      '<td style="padding:8px 12px;color:var(--text-soft);font-size:13px;word-break:break-word;">' + escapeHTML(u.orgRole || "-") + '</td>' +
      '<td style="padding:8px 12px;font-size:12px;word-break:break-word;">' + verified + '</td>' +
      '<td style="padding:8px 12px;font-size:12px;word-break:break-word;">' + status + '</td>' +
      '<td style="padding:8px 12px;color:var(--text-muted);font-size:12px;word-break:break-word;">' + (u.createdAt ? new Date(u.createdAt).toLocaleString("zh-CN") : "-") + '</td>' +
      '<td style="padding:8px 12px;color:var(--text-muted);font-size:12px;word-break:break-word;">' + (u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString("zh-CN") : "从未登录") + '</td>' +
    '</tr>';
  }).join("");

  grid.innerHTML = searchBox +
    '<div style="border:1px solid var(--line);border-radius:14px;background:rgba(255,255,255,0.02);overflow:auto;">' +
      '<table style="width:100%;border-collapse:collapse;font-size:13px;">' +
        '<thead>' +
          '<tr style="border-bottom:1px solid var(--line);text-align:left;">' +
            '<th style="padding:10px 12px;color:var(--text-muted);font-size:12px;white-space:nowrap;">ID</th>' +
            '<th style="padding:10px 12px;color:var(--text-muted);font-size:12px;white-space:nowrap;">邮箱</th>' +
            '<th style="padding:10px 12px;color:var(--text-muted);font-size:12px;white-space:nowrap;">昵称</th>' +
            '<th style="padding:10px 12px;color:var(--text-muted);font-size:12px;white-space:nowrap;">手机号</th>' +
            '<th style="padding:10px 12px;color:var(--text-muted);font-size:12px;white-space:nowrap;">单位</th>' +
            '<th style="padding:10px 12px;color:var(--text-muted);font-size:12px;white-space:nowrap;">角色</th>' +
            '<th style="padding:10px 12px;color:var(--text-muted);font-size:12px;white-space:nowrap;">邮箱验证</th>' +
            '<th style="padding:10px 12px;color:var(--text-muted);font-size:12px;white-space:nowrap;">状态</th>' +
            '<th style="padding:10px 12px;color:var(--text-muted);font-size:12px;white-space:nowrap;">注册时间</th>' +
            '<th style="padding:10px 12px;color:var(--text-muted);font-size:12px;white-space:nowrap;">最后登录</th>' +
          '</tr>' +
        '</thead>' +
        '<tbody>' + rows + '</tbody>' +
      '</table>' +
    '</div>';

  bindUserSearch();
}

function bindUserSearch() {
  const input = document.getElementById("userSearchInput");
  if (!input) return;
  let timer = null;
  input.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      STATE.userSearchKeyword = input.value;
      renderUsers();
      const newInput = document.getElementById("userSearchInput");
      if (newInput) {
        newInput.focus();
        newInput.setSelectionRange(newInput.value.length, newInput.value.length);
      }
    }, 200);
  });
}

function renderApplications() {
  const grid = document.getElementById("grid");

  if (!STATE.items.length) {
    grid.innerHTML = '<div class="card empty"><div>暂时还没有新的对接申请<br><span style="font-size:12px;">用户提交后会自动出现在这里</span></div></div>';
    return;
  }

  grid.innerHTML = STATE.items.map(item => (
    '<div class="card">' +
      '<div class="thumb">申请</div>' +
      '<h3 class="title">' + escapeHTML(item.applicantName || "未命名申请") + "</h3>" +
      '<p class="meta">' + escapeHTML(getDirectoryTypeLabel(item.directoryType)) + " · " + escapeHTML(item.targetTitle || "未指定对象") + "</p>" +
      (item.trackingCode ? '<p class="meta">查询编号：' + escapeHTML(item.trackingCode) + "</p>" : "") +
      (item.targetMeta ? '<p class="meta">' + escapeHTML(item.targetMeta) + "</p>" : "") +
      (item.applicantOrg ? '<p class="desc">单位 / 组织：' + escapeHTML(item.applicantOrg) + "</p>" : "") +
      (item.applicantRole ? '<p class="desc">身份 / 职务：' + escapeHTML(item.applicantRole) + "</p>" : "") +
      (item.cooperationIntent ? '<p class="desc">合作意向：' + escapeHTML(item.cooperationIntent) + "</p>" : "") +
      (item.message ? '<p class="desc">对接说明：' + escapeHTML(item.message) + "</p>" : "") +
      '<p class="desc">联系方式：' +
        [item.phone, item.wechat, item.email].filter(Boolean).map(escapeHTML).join(" / ") +
      "</p>" +
      '<p class="meta">提交时间：' + escapeHTML(item.createdAt ? new Date(item.createdAt).toLocaleString("zh-CN") : "未记录") + "</p>" +
      '<p class="meta">当前状态：' + escapeHTML(getApplicationStatusLabel(item.status)) + "</p>" +
      '<div class="card-actions">' +
        '<select class="mini-btn" data-status="' + item.id + '">' +
          ["pending","reviewing","matched","contacted","completed","rejected"].map(status => (
            '<option value="' + status + '"' + (item.status === status ? ' selected' : '') + '>' + getApplicationStatusLabel(status) + '</option>'
          )).join("") +
        '</select>' +
      "</div>" +
      '<textarea class="desc" data-status-note="' + item.id + '" style="width:100%;min-height:84px;background:rgba(255,255,255,0.04);border:1px solid rgba(96,165,250,0.12);border-radius:12px;padding:10px 12px;color:inherit;font:inherit;">' + escapeHTML(item.statusNote || "") + '</textarea>' +
      '<div class="card-actions">' +
        '<button class="mini-btn" type="button" data-save-status="' + item.id + '">保存状态</button>' +
      "</div>" +
    "</div>"
  )).join("");

  grid.querySelectorAll("[data-save-status]").forEach(button => {
    button.addEventListener("click", async () => {
      const id = Number(button.dataset.saveStatus);
      const status = grid.querySelector('[data-status="' + id + '"]')?.value || "pending";
      const statusNote = grid.querySelector('[data-status-note="' + id + '"]')?.value?.trim() || "";
      try {
        const response = await api(`/api/admin/directory-applications/${id}`, {
          method: "PATCH",
          body: JSON.stringify({ status, statusNote })
        });
        const index = STATE.items.findIndex(item => Number(item.id) === id);
        if (index >= 0) STATE.items[index] = response.item;
        renderApplications();
        showToast("申请状态已更新");
      } catch (error) {
        showToast(error.message, true);
      }
    });
  });
}

function renderActivityRegs() {
  const grid = document.getElementById("grid");
  if (!STATE.items.length) {
    grid.innerHTML = '<div class="card empty"><div>暂无活动报名记录</div></div>';
    return;
  }
  const statusLabels = { pending: "待确认", confirmed: "已确认", cancelled: "已取消", rejected: "未通过" };
  grid.innerHTML = STATE.items.map(item => (
    '<div class="card">' +
      '<h3 class="title">' + escapeHTML(item.applicantName || "未命名") + "</h3>" +
      (item.activityTitle ? '<p class="meta">活动：' + escapeHTML(item.activityTitle) + "</p>" : "") +
      (item.applicantOrg ? '<p class="desc">单位：' + escapeHTML(item.applicantOrg) + "</p>" : "") +
      (item.phone ? '<p class="desc">电话：' + escapeHTML(item.phone) + "</p>" : "") +
      '<p class="meta">状态：' + escapeHTML(statusLabels[item.status] || item.status) + "</p>" +
      '<p class="meta">报名时间：' + escapeHTML(item.createdAt ? new Date(item.createdAt).toLocaleString("zh-CN") : "未记录") + "</p>" +
    "</div>"
  )).join("");
}

function renderDeliveryRecords() {
  const grid = document.getElementById("grid");
  if (!STATE.items.length) {
    grid.innerHTML = '<div class="card empty"><div>暂无投递记录</div></div>';
    return;
  }
  const statusLabels = { pending: "待处理", reviewing: "审核中", accepted: "已通过", rejected: "未通过" };
  const typeLabels = { internship: "实习", practice: "实践", project: "项目" };
  grid.innerHTML = STATE.items.map(item => (
    '<div class="card">' +
      '<h3 class="title">' + escapeHTML(item.applicantName || "未命名") + "</h3>" +
      (item.opportunityTitle ? '<p class="meta">岗位：' + escapeHTML(item.opportunityTitle) + "</p>" : "") +
      (item.opportunityType ? '<p class="meta">类型：' + escapeHTML(typeLabels[item.opportunityType] || item.opportunityType) + "</p>" : "") +
      (item.applicantOrg ? '<p class="desc">单位：' + escapeHTML(item.applicantOrg) + "</p>" : "") +
      (item.phone ? '<p class="desc">电话：' + escapeHTML(item.phone) + "</p>" : "") +
      '<p class="meta">状态：' + escapeHTML(statusLabels[item.status] || item.status) + "</p>" +
      (item.statusNote ? '<p class="desc">备注：' + escapeHTML(item.statusNote) + "</p>" : "") +
      '<p class="meta">投递时间：' + escapeHTML(item.createdAt ? new Date(item.createdAt).toLocaleString("zh-CN") : "未记录") + "</p>" +
    "</div>"
  )).join("");
}

function renderUserSubmissions(type) {
  const grid = document.getElementById("grid");
  if (!STATE.items.length) {
    grid.innerHTML = '<div class="card empty"><div>暂无' + (type === "event" ? "活动" : "实习实践") + '发布记录</div></div>';
    return;
  }
  const statusLabels = { pending: "待审核", approved: "已通过", rejected: "已拒绝" };
  const approveUrl = type === "event" ? "/api/admin/user-events" : "/api/admin/user-recruits";
  grid.innerHTML = STATE.items.map(item => (
    '<div class="card">' +
      (item.image ? '<div class="thumb"><img src="' + escapeHTML(item.image) + '" alt="' + escapeHTML(item.title) + '"></div>' : "") +
      '<h3 class="title">' + escapeHTML(item.title || "未命名") + "</h3>" +
      (item.meta ? '<p class="meta">' + escapeHTML(item.meta) + "</p>" : "") +
      (item.desc ? '<p class="desc">' + escapeHTML(item.desc) + "</p>" : "") +
      (item.link ? '<p class="link">' + escapeHTML(item.link) + "</p>" : "") +
      (item.userName ? '<p class="desc">发布者：' + escapeHTML(item.userName) + "</p>" : "") +
      (item.userOrg ? '<p class="desc">单位：' + escapeHTML(item.userOrg) + "</p>" : "") +
      (item.eventDate ? '<p class="meta">活动日期：' + escapeHTML(item.eventDate) + "</p>" : "") +
      (item.eventLocation ? '<p class="meta">地点：' + escapeHTML(item.eventLocation) + "</p>" : "") +
      '<p class="meta">状态：' + escapeHTML(statusLabels[item.status] || item.status) + "</p>" +
      (item.reviewNote ? '<p class="desc">审核备注：' + escapeHTML(item.reviewNote) + "</p>" : "") +
      '<p class="meta">提交时间：' + escapeHTML(item.createdAt ? new Date(item.createdAt).toLocaleString("zh-CN") : "未记录") + "</p>" +
      '<div class="card-actions">' +
        (item.status === "pending" ?
          '<button class="mini-btn" type="button" data-approve="' + item.id + '">通过</button>' +
          '<button class="mini-btn" type="button" data-reject="' + item.id + '">拒绝</button>'
        : "") +
        '<button class="mini-btn" type="button" data-delete-sub="' + item.id + '">删除</button>' +
      "</div>" +
    "</div>"
  )).join("");

  grid.querySelectorAll("[data-approve]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = Number(btn.dataset.approve);
      try {
        await api(approveUrl + "/" + id + "/approve", { method: "POST" });
        showToast("已通过审核");
        await loadItems();
        renderUserSubmissions(type);
      } catch (e) { showToast(e.message, true); }
    });
  });
  grid.querySelectorAll("[data-reject]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = Number(btn.dataset.reject);
      try {
        await api(approveUrl + "/" + id + "/reject", { method: "POST", body: JSON.stringify({ note: "" }) });
        showToast("已拒绝");
        await loadItems();
        renderUserSubmissions(type);
      } catch (e) { showToast(e.message, true); }
    });
  });
  grid.querySelectorAll("[data-delete-sub]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = Number(btn.dataset.deleteSub);
      try {
        await api(approveUrl + "/" + id, { method: "DELETE" });
        showToast("已删除");
        await loadItems();
        renderUserSubmissions(type);
      } catch (e) { showToast(e.message, true); }
    });
  });
}

function renderGrid() {
  if (STATE.mainTab === "applications") {
    renderApplications();
    return;
  }
  if (STATE.mainTab === "activityRegs") {
    renderActivityRegs();
    return;
  }
  if (STATE.mainTab === "deliveryRecords") {
    renderDeliveryRecords();
    return;
  }
  if (STATE.mainTab === "userEvents") {
    renderUserSubmissions("event");
    return;
  }
  if (STATE.mainTab === "userRecruits") {
    renderUserSubmissions("recruit");
    return;
  }
  if (STATE.mainTab === "users") {
    renderUsers();
    return;
  }
  if (STATE.mainTab === "userStats") {
    renderUserStats();
    return;
  }
  const grid = document.getElementById("grid");
  const cards = STATE.items.map((item, index) => (
    '<div class="card" draggable="true" data-index="' + index + '">' +
      '<div class="thumb">' +
        ((item.image || item.logo)
          ? '<img src="' + escapeHTML(item.image || item.logo) + '" alt="' + escapeHTML(item.title || item.name) + '">'
          : "暂无图片") +
      "</div>" +
      '<h3 class="title">' + escapeHTML(item.title || item.name) + "</h3>" +
      ((item.meta || item.type) ? '<p class="meta">' + escapeHTML(item.meta || item.type) + "</p>" : "") +
      (item.desc ? '<p class="desc">' + escapeHTML(item.desc) + "</p>" : "") +
      (item.link ? '<p class="link">' + escapeHTML(item.link) + "</p>" : "") +
      '<div class="card-actions">' +
        '<button class="mini-btn" type="button" data-edit="' + index + '">编辑</button>' +
        '<button class="mini-btn" type="button" data-delete="' + index + '">删除</button>' +
      "</div>" +
    "</div>"
  ));

  cards.push(
    '<div class="card empty" id="addEmptyCard"><div>+ 新增一项<br><span style="font-size:12px;">支持图片、标题及相关字段</span></div></div>'
  );

  grid.innerHTML = cards.join("");
  document.getElementById("addEmptyCard").addEventListener("click", () => openEditor(-1));
  grid.querySelectorAll("[data-edit]").forEach(btn => btn.addEventListener("click", () => openEditor(Number(btn.dataset.edit))));
  grid.querySelectorAll("[data-delete]").forEach(btn => btn.addEventListener("click", () => removeItem(Number(btn.dataset.delete))));
  initDrag();
}

function applyFieldVisibility() {
  const config = currentConfig();
  const placeholder = STATE.mainTab === "hubContent"
    ? HUB_CONTENT_SUBTABS[STATE.hubTab].placeholder
    : STATE.mainTab === "directory"
      ? DIRECTORY_SUBTABS[STATE.directoryTab].placeholder
      : config.placeholder;
  document.getElementById("metaLabel").textContent = STATE.mainTab === "partners" ? "类型" : "补充信息";
  document.getElementById("metaInput").placeholder = placeholder.meta || "可选";
  document.getElementById("descInput").placeholder = placeholder.desc || "可选";
  document.getElementById("titleInput").placeholder = placeholder.title || "请输入标题";
  document.getElementById("linkInput").placeholder = placeholder.link || "可选";
  document.getElementById("itemsInput").placeholder = placeholder.items || "";
  document.getElementById("metaInput").parentElement.classList.toggle("hidden", !config.fields.meta);
  document.getElementById("descInput").parentElement.classList.toggle("hidden", !config.fields.desc);
  document.getElementById("linkField").classList.toggle("hidden", !config.fields.link);
  document.getElementById("itemsField").classList.toggle("hidden", !config.fields.items);
}

function openEditor(index) {
  STATE.editingIndex = index;
  const item = index >= 0 ? STATE.items[index] : {};
  document.getElementById("imageFile").value = "";
  document.getElementById("modalTitle").textContent = index >= 0 ? "编辑内容" : "新增内容";
  document.getElementById("titleInput").value = item.title || item.name || "";
  document.getElementById("metaInput").value = item.meta || item.type || "";
  document.getElementById("descInput").value = item.desc || "";
  document.getElementById("linkInput").value = item.link || "";
  document.getElementById("itemsInput").value = (item.items || []).join("\n");
  STATE.imageData = item.image || item.logo || "";
  const preview = document.getElementById("previewImage");
  if (STATE.imageData) {
    preview.src = STATE.imageData;
    preview.style.display = "block";
  } else {
    preview.style.display = "none";
  }
  applyFieldVisibility();
  document.getElementById("editorModal").classList.add("open");
}

function closeEditor() {
  document.getElementById("editorModal").classList.remove("open");
}

function buildPayload() {
  const title = document.getElementById("titleInput").value.trim();
  if (!title) {
    throw new Error("请先填写标题");
  }
  const config = currentConfig();
  if (STATE.mainTab === "partners") {
    return {
      name: title,
      type: document.getElementById("metaInput").value.trim(),
      logo: STATE.imageData
    };
  }
  const existing = STATE.editingIndex >= 0 ? STATE.items[STATE.editingIndex] : null;
  const payload = { title, image: STATE.imageData };
  if (STATE.mainTab === "categories") {
    payload.slug = existing?.slug || title.trim().toLowerCase().replace(/\s+/g, "-");
  }
  if (config.fields.meta) payload.meta = document.getElementById("metaInput").value.trim();
  if (config.fields.desc) payload.desc = document.getElementById("descInput").value.trim();
  if (config.fields.link) payload.link = document.getElementById("linkInput").value.trim();
  if (config.fields.items) {
    payload.items = document.getElementById("itemsInput").value
      .split("\n")
      .map(line => line.trim())
      .filter(Boolean);
  }
  return payload;
}

async function saveItem() {
  try {
    const item = buildPayload();
    const { sectionKey, groupKey } = getActiveKeys();
    if (STATE.editingIndex >= 0) {
      const current = STATE.items[STATE.editingIndex];
      const response = await api(`/api/admin/content/${current.id}`, {
        method: "PUT",
        body: JSON.stringify({ item })
      });
      STATE.items[STATE.editingIndex] = response.item;
    } else {
      const response = await api("/api/admin/content", {
        method: "POST",
        body: JSON.stringify({ sectionKey, groupKey, item })
      });
      STATE.items.push(response.item);
    }
    closeEditor();
    renderGrid();
    showToast("内容已保存");
  } catch (error) {
    showToast(error.message, true);
  }
}

async function removeItem(index) {
  if (!window.confirm("确定删除这项内容吗？")) return;
  try {
    const current = STATE.items[index];
    await api(`/api/admin/content/${current.id}`, { method: "DELETE" });
    STATE.items.splice(index, 1);
    renderGrid();
    showToast("内容已删除");
  } catch (error) {
    showToast(error.message, true);
  }
}

async function exportData() {
  try {
    const payload = await api("/api/admin/export", { method: "GET" });
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `alliance_content_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    showToast("数据已导出");
  } catch (error) {
    showToast(error.message, true);
  }
}

async function importData(file) {
  try {
    const text = await file.text();
    const json = JSON.parse(text);
    await api("/api/admin/import", {
      method: "POST",
      body: JSON.stringify(json)
    });
    await renderUI();
    showToast("数据已导入");
  } catch (error) {
    showToast(error.message || "导入失败", true);
  }
}

function initDrag() {
  let sourceIndex = -1;
  const cards = document.querySelectorAll(".card[data-index]");
  cards.forEach(card => {
    card.addEventListener("dragstart", () => {
      sourceIndex = Number(card.dataset.index);
      card.classList.add("dragging");
    });
    card.addEventListener("dragend", () => {
      card.classList.remove("dragging");
    });
    card.addEventListener("dragover", event => event.preventDefault());
    card.addEventListener("drop", async () => {
      const targetIndex = Number(card.dataset.index);
      if (targetIndex === sourceIndex || sourceIndex < 0) return;
      const temp = STATE.items[sourceIndex];
      STATE.items[sourceIndex] = STATE.items[targetIndex];
      STATE.items[targetIndex] = temp;
      renderGrid();
      const { sectionKey, groupKey } = getActiveKeys();
      try {
        await api("/api/admin/content/reorder", {
          method: "POST",
          body: JSON.stringify({
            sectionKey,
            groupKey,
            ids: STATE.items.map(item => item.id)
          })
        });
        showToast("顺序已更新");
      } catch (error) {
        showToast(error.message, true);
      }
    });
  });
}

async function uploadFile(file) {
  if (IS_FILE_MODE) {
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("图片读取失败"));
      reader.readAsDataURL(file);
    });
    STATE.imageData = dataUrl;
    const preview = document.getElementById("previewImage");
    preview.src = STATE.imageData;
    preview.style.display = "block";
    showToast("图片已保存到本地");
    return;
  }
  const formData = new FormData();
  formData.append("file", file);
  const response = await api("/api/admin/upload", {
    method: "POST",
    body: formData
  });
  STATE.imageData = response.url;
  const preview = document.getElementById("previewImage");
  preview.src = STATE.imageData;
  preview.style.display = "block";
  showToast("图片已上传");
}

async function renderUI() {
  renderTabs();
  renderSubTabs();
  renderPanelHead();
  const hideAddBtn = STATE.mainTab === "applications" || STATE.mainTab === "users" || STATE.mainTab === "userStats" || STATE.mainTab === "activityRegs" || STATE.mainTab === "deliveryRecords" || STATE.mainTab === "userEvents" || STATE.mainTab === "userRecruits";
  document.getElementById("addBtn").classList.toggle("hidden", hideAddBtn);
  const grid = document.getElementById("grid");
  if (grid) grid.innerHTML = '<div style="padding:2rem;text-align:center;color:#94a3b8;">\u52a0\u8f7d\u4e2d\u2026</div>';
  try {
    await loadItems();
    renderGrid();
  } catch (error) {
    console.error("[Admin] renderUI error:", error);
    if (grid) {
      grid.innerHTML = `<div style="padding:2rem;text-align:center;color:#ef4444;">\u52a0\u8f7d\u5931\u8d25\uff1a${error.message || "\u672a\u77e5\u9519\u8bef"}<br><button onclick="renderUI()" style="margin-top:0.5rem;padding:0.3rem 1rem;border:1px solid #475569;border-radius:4px;background:transparent;color:#94a3b8;cursor:pointer;">\u91cd\u8bd5</button></div>`;
    }
  }
}

function bindEvents() {
  document.getElementById("authForm").addEventListener("submit", handleLogin);
  applyModeUI();
  if (IS_FILE_MODE) {
    document.getElementById("loginUsername").value = "";
  }
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }
  document.getElementById("exportBtn").addEventListener("click", exportData);
  document.getElementById("importBtn").addEventListener("click", () => document.getElementById("importFile").click());
  document.getElementById("importFile").addEventListener("change", event => {
    if (event.target.files[0]) importData(event.target.files[0]);
  });
  document.getElementById("addBtn").addEventListener("click", () => openEditor(-1));
  document.getElementById("closeModal").addEventListener("click", closeEditor);
  document.getElementById("cancelBtn").addEventListener("click", closeEditor);
  document.getElementById("saveBtn").addEventListener("click", saveItem);
  document.getElementById("editorModal").addEventListener("click", event => {
    if (event.target.id === "editorModal") closeEditor();
  });
  document.getElementById("uploadBox").addEventListener("click", () => {
    document.getElementById("imageFile").click();
  });
  document.getElementById("imageFile").addEventListener("change", async event => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      await uploadFile(file);
    } catch (error) {
      showToast(error.message, true);
    }
  });
}

async function init() {
  bindEvents();
  const authed = await checkAuth();
  if (authed) {
    await renderUI();
  }
}

init();
