export const DEFAULT_SITE_CONTENT = {
  heroCarousel: [
    { title: "联盟活动现场", meta: "活动照片", image: "", link: "#events" },
    { title: "校园交流与分享", meta: "活动照片", image: "", link: "#events" },
    { title: "生态合作与共建", meta: "活动照片", image: "", link: "#events" }
  ],
  categories: [
    { slug: "food-fun", title: "吃喝玩乐", desc: "餐饮折扣、青年社交与线下聚会资源。", image: "", items: ["联盟餐饮折扣", "线下聚会优先报名"] },
    { slug: "lifestyle", title: "衣食住行", desc: "酒店优惠、购物折扣、出行补贴等。", image: "", items: ["酒店会员优惠", "出行补贴"] },
    { slug: "study-life", title: "学习提升", desc: "课程、工具、论文与学业支持。", image: "", items: ["AI 学习工具", "论文辅助资源"] },
    { slug: "career-startup", title: "就业创业", desc: "实习实践、创业者社群和导师支持。", image: "", items: ["实习实践", "创业者社群"] }
  ],
  categoryDetails: {
    "food-fun": [
      { title: "线下聚会与城市活动", desc: "适合周末聚会、社交联谊和城市探索活动。", image: "", link: "#join" }
    ],
    lifestyle: [
      { title: "出行与生活服务", desc: "覆盖住宿、出行、消费折扣和生活服务权益。", image: "", link: "#join" }
    ],
    "study-life": [
      { title: "学习工具与资料", desc: "围绕课程、工具、论文和学习社群整理的内容。", image: "", link: "#join" }
    ],
    "career-startup": [
      { title: "实习实践与创业支持", desc: "适合找机会、找伙伴、找资源的同学。", image: "", link: "#join" }
    ]
  },
  recruit: [
    { title: "AI 产品经理实习生", meta: "北京 · 京东总部 · 实习 3 个月+", desc: "适合对 AI 产品和需求分析有兴趣的同学。", image: "", link: "mailto:hr@example.com" },
    { title: "百度 AI 生态志愿者计划", meta: "百度生态 · 线上社群", desc: "适合企业合作伙伴、技术团队和校园组织，围绕百度 AI 生态展开交流。", image: "", link: "#join" },
    { title: "Wteam 创业者长期招募", meta: "创业社群 · 全国高校", desc: "面向有项目、有想法或正在寻找方向的大学生创业者，提供长期陪伴与资源对接。", image: "", link: "#join" }
  ],
  events: [
    { title: "OpenClaw 从安装到落地", meta: "AI 活动 · 北京", desc: "围绕 AI 工具接入、协作方式和实际落地案例的交流小聚。", image: "", link: "#join" }
  ],
  partners: {
    university: [
      { name: "北京大学", type: "综合院校", logo: "" },
      { name: "清华大学", type: "综合院校", logo: "" },
      { name: "北京工业大学", type: "理工院校", logo: "" },
      { name: "北京理工大学", type: "理工院校", logo: "" },
      { name: "北京航空航天大学", type: "航空航天", logo: "" },
      { name: "对外经济贸易大学", type: "财经院校", logo: "" }
    ],
    company: [
      { name: "腾讯", type: "互联网 / 科技", logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='46' height='46' viewBox='0 0 46 46'%3E%3Crect width='46' height='46' rx='12' fill='%231274D4'/%3E%3Ctext x='23' y='31' text-anchor='middle' font-family='Noto Sans SC,sans-serif' font-size='18' font-weight='700' fill='white'%3E%E8%85%BE%3C/text%3E%3C/svg%3E" },
      { name: "字节跳动", type: "互联网", logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='46' height='46' viewBox='0 0 46 46'%3E%3Crect width='46' height='46' rx='12' fill='%23FE2C55'/%3E%3Ctext x='23' y='31' text-anchor='middle' font-family='Noto Sans SC,sans-serif' font-size='13' font-weight='700' fill='white'%3E%E5%AD%97%E7%AC%A6%3C/text%3E%3C/svg%3E" },
      { name: "京东", type: "电商 / 科技", logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='46' height='46' viewBox='0 0 46 46'%3E%3Crect width='46' height='46' rx='12' fill='%23E2231A'/%3E%3Ctext x='23' y='31' text-anchor='middle' font-family='Noto Sans SC,sans-serif' font-size='18' font-weight='700' fill='white'%3E%E4%BA%AC%3C/text%3E%3C/svg%3E" },
      { name: "百度", type: "AI / 搜索", logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='46' height='46' viewBox='0 0 46 46'%3E%3Crect width='46' height='46' rx='12' fill='%231931D1'/%3E%3Ctext x='23' y='31' text-anchor='middle' font-family='Noto Sans SC,sans-serif' font-size='18' font-weight='700' fill='white'%3E%E7%99%BE%3C/text%3E%3C/svg%3E" },
      { name: "智联招聘", type: "人力资源", logo: "" },
      { name: "华住会", type: "酒店集团", logo: "" },
      { name: "Wteam", type: "创业社群", logo: "" },
      { name: "Sensation", type: "娱乐 / 餐饮", logo: "" }
    ],
    government: [
      { name: "北京市科协", type: "科创支持", logo: "" },
      { name: "中关村相关机构", type: "园区 / 创新生态", logo: "" },
      { name: "北京经开区相关平台", type: "产业服务", logo: "" }
    ]
  },
  directory: {
    campus: [
      { title: "北京大学学生创新中心", meta: "校园方 · 创新实践", desc: "适合联合开展实践活动、训练营与校内传播合作。", image: "", link: "#join", items: ["活动共建", "校内传播", "实践项目对接"] },
      { title: "清华大学学生职业发展协会", meta: "校园方 · 就业成长", desc: "适合对接职业发展分享、企业参访与联合招募活动。", image: "", link: "#join", items: ["职业分享", "企业参访", "联合招募"] },
      { title: "北京航空航天大学创业社群", meta: "校园方 · 创业生态", desc: "适合创业项目展示、导师链接与路演活动协作。", image: "", link: "#join", items: ["创业路演", "导师链接", "项目展示"] }
    ],
    government: [
      { title: "中关村青年创新服务平台", meta: "政府方 · 科创服务", desc: "适合科创活动协办、政策宣讲和青年项目资源对接。", image: "", link: "#join", items: ["政策宣讲", "活动协办", "项目对接"] },
      { title: "北京经开区人才服务窗口", meta: "政府方 · 人才支持", desc: "适合人才政策传播、实习实践合作与区域活动共建。", image: "", link: "#join", items: ["人才合作", "实践合作", "区域联动"] },
      { title: "海淀区青年发展相关平台", meta: "政府方 · 区域协同", desc: "适合青年发展项目、活动联动和城市资源协作。", image: "", link: "#join", items: ["青年项目", "活动联动", "城市资源协作"] }
    ],
    company: [
      { title: "百度 AI 生态合作组", meta: "企业方 · AI 生态", desc: "适合 AI 生态宣讲、实践机会对接和校园资源合作。", image: "", link: "#join", items: ["校园宣讲", "实践机会", "生态合作"] },
      { title: "京东校园合作团队", meta: "企业方 · 校园合作", desc: "适合企业开放日、校企活动与实践岗位合作。", image: "", link: "#join", items: ["开放日", "校企活动", "岗位合作"] },
      { title: "Wteam 青年创业网络", meta: "企业方 · 创业社群", desc: "适合创业项目招募、社群共建和资源链接。", image: "", link: "#join", items: ["项目招募", "社群共建", "资源链接"] }
    ]
  }
};

export function getDefaultItems(sectionKey, groupKey = null) {
  if (sectionKey === "hero_carousel") return DEFAULT_SITE_CONTENT.heroCarousel;
  if (sectionKey === "categories") return DEFAULT_SITE_CONTENT.categories;
  if (sectionKey === "category_details") return DEFAULT_SITE_CONTENT.categoryDetails[groupKey] || [];
  if (sectionKey === "recruit") return DEFAULT_SITE_CONTENT.recruit;
  if (sectionKey === "events") return DEFAULT_SITE_CONTENT.events;
  if (sectionKey === "partners") return DEFAULT_SITE_CONTENT.partners[groupKey] || [];
  if (sectionKey === "directory") return DEFAULT_SITE_CONTENT.directory[groupKey] || [];
  return [];
}
