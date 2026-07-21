const CATEGORY_TABS = [
  { slug: "food-fun", title: "吃喝玩乐" },
  { slug: "lifestyle", title: "衣食住行" },
  { slug: "study-life", title: "学习提升" },
  { slug: "career-startup", title: "就业创业" },
  { slug: "recruit", title: "实习实践" },
  { slug: "events", title: "近期活动" }
];

// 每个 tab 对应的图标，避免所有占位都一样
const TAB_ICON_MAP = {
  "food-fun": "🍜",
  "lifestyle": "🛍️",
  "study-life": "📚",
  "career-startup": "🚀",
  "recruit": "💼",
  "events": "📅"
};

const defaultCategoryDetails = {
  "food-fun": [
    { title: "线下聚会与城市活动", desc: "适合周末聚会、社交联谊和城市探索活动。", image: "", link: "#join", meta: "周末 · 北京" }
  ],
  lifestyle: [
    { title: "出行与生活服务", desc: "覆盖住宿、出行、消费折扣和生活服务权益。", image: "", link: "#join", meta: "长期开放 · 城市生活" }
  ],
  "study-life": [
    { title: "学习工具与资料", desc: "围绕课程、工具、论文和学习社群整理的内容。", image: "", link: "#join", meta: "学习提升 · 工具资料" }
  ],
  "career-startup": [
    { title: "实习实践与创业支持", desc: "适合找机会、找伙伴、找资源的同学。", image: "", link: "#join", meta: "就业创业 · 资源对接" }
  ],
  recruit: [
    { title: "AI 产品经理实习生", desc: "适合对 AI 产品和需求分析有兴趣的同学。", image: "", link: "mailto:hr@example.com", meta: "北京 · 京东总部 · 实习 3 个月+" }
  ],
  events: [
    { title: "OpenClaw 从安装到落地", desc: "围绕 AI 工具接入、协作方式和实际落地案例的交流小聚。", image: "", link: "#events", meta: "AI 活动 · 北京" }
  ]
};

const state = {
  activeCategory: new URLSearchParams(window.location.search).get("category") || "food-fun",
  keyword: "",
  typeFilter: "all",
  timeFilter: "all",
  content: {
    categoryDetails: defaultCategoryDetails
  }
};

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function readLocalContent(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch (error) {}
  return fallback;
}

async function loadContent() {
  if (window.location.protocol === "file:") {
    state.content.categoryDetails = {
      "food-fun": readLocalContent("alliance_content_category_details_food-fun", defaultCategoryDetails["food-fun"]),
      lifestyle: readLocalContent("alliance_content_category_details_lifestyle", defaultCategoryDetails.lifestyle),
      "study-life": readLocalContent("alliance_content_category_details_study-life", defaultCategoryDetails["study-life"]),
      "career-startup": readLocalContent("alliance_content_category_details_career-startup", defaultCategoryDetails["career-startup"]),
      recruit: readLocalContent("alliance_content_recruit", defaultCategoryDetails.recruit),
      events: readLocalContent("alliance_content_events", defaultCategoryDetails.events)
    };
    return;
  }

  try {
    const response = await fetch("/api/public/site-content", { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error("加载分类内容失败");
    const data = await response.json();
    const categoryDetails = data.categoryDetails && typeof data.categoryDetails === "object"
      ? data.categoryDetails
      : {};
    state.content.categoryDetails = {
      ...defaultCategoryDetails,
      ...categoryDetails,
      recruit: Array.isArray(data.recruit) ? data.recruit : defaultCategoryDetails.recruit,
      events: Array.isArray(data.events) ? data.events : defaultCategoryDetails.events
    };
  } catch (error) {
    console.warn(error.message);
  }
}

function getActiveItems() {
  const items = state.content.categoryDetails[state.activeCategory] || [];
  const keyword = state.keyword.trim().toLowerCase();
  return items.filter(item => {
    const haystack = [item.title, item.desc, item.meta, item.link]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    const keywordMatched = !keyword || haystack.includes(keyword);
    const typeMatched = state.typeFilter === "all" || getItemType(state.activeCategory, item) === state.typeFilter;
    const timeMatched = state.timeFilter === "all" || getItemTimeState(item) === state.timeFilter;
    return keywordMatched && typeMatched && timeMatched;
  });
}

function getItemType(categorySlug, item) {
  if (categorySlug === "recruit") return "practice";
  if (categorySlug === "events") return "event";
  return "resource";
}

function getItemTimeState(item) {
  const text = [item.meta, item.title, item.desc].filter(Boolean).join(" ").toLowerCase();
  if (/长期|长期开放|长期招募|持续招募/.test(text)) return "ongoing";
  if (/活动|近期|周末|本周|本月|线下|分享会|交流|招募|实习|实践|202\d/.test(text)) return "recent";
  return "recent";
}

function renderTabs() {
  const wrap = document.getElementById("resourceTabs");
  wrap.innerHTML = CATEGORY_TABS.map(tab => (
    `<button class="tab-btn ${tab.slug === state.activeCategory ? "active" : ""}" type="button" data-tab="${tab.slug}">${tab.title}</button>`
  )).join("");
  wrap.querySelectorAll("[data-tab]").forEach(button => {
    button.addEventListener("click", () => {
      state.activeCategory = button.dataset.tab;
      const url = new URL(window.location.href);
      url.searchParams.set("category", state.activeCategory);
      history.replaceState({}, "", url);
      render();
    });
  });
}

function renderList() {
  const list = document.getElementById("resourceList");
  const count = document.getElementById("resultCount");
  const activeItems = getActiveItems();
  count.textContent = `当前展示 ${activeItems.length} 条内容`;

  if (!activeItems.length) {
    list.innerHTML = '<div class="empty">当前分类下还没有匹配的内容，试试切换分类或更换关键词。</div>';
    return;
  }

  list.innerHTML = activeItems.map(item => (
    '<article class="item-card">' +
      (item.image
        ? '<div class="item-thumb"><img src="' + escapeHTML(item.image) + '" alt="' + escapeHTML(item.title) + '" loading="lazy" decoding="async"></div>'
        : '<div class="item-thumb-placeholder">' + escapeHTML(TAB_ICON_MAP[state.activeCategory] || "活") + "</div>") +
      '<div>' +
        '<h3 class="item-title">' + escapeHTML(item.title) + '</h3>' +
        '<div class="item-meta">' +
          (item.meta ? '<span class="item-tag">' + escapeHTML(item.meta) + '</span>' : "") +
          '<span class="item-tag">' + escapeHTML(CATEGORY_TABS.find(tab => tab.slug === state.activeCategory)?.title || "") + '</span>' +
        '</div>' +
        '<p class="item-desc">' + escapeHTML(item.desc || "点击右侧查看详情") + '</p>' +
      '</div>' +
      '<div class="item-side">' +
        '<a class="btn btn-primary" href="' + escapeHTML(item.link || "https://docs.qq.com/form/page/DSkNRbkhIQXBaTFVN") + '" target="' + ((item.link || "").startsWith("http") ? "_blank" : "_self") + '">查看详情</a>' +
        '<div class="mini-note">' + escapeHTML(item.link || "后台可补充详情链接") + '</div>' +
      '</div>' +
    '</article>'
  )).join("");
}

function bindEvents() {
  const search = document.getElementById("resourceSearch");
  search.addEventListener("input", event => {
    state.keyword = event.target.value;
    renderList();
  });

  const typeFilter = document.getElementById("typeFilter");
  const timeFilter = document.getElementById("timeFilter");

  typeFilter.addEventListener("change", event => {
    state.typeFilter = event.target.value;
    renderList();
  });

  timeFilter.addEventListener("change", event => {
    state.timeFilter = event.target.value;
    renderList();
  });
}

function render() {
  renderTabs();
  renderList();
}

async function init() {
  if (!CATEGORY_TABS.some(tab => tab.slug === state.activeCategory)) {
    state.activeCategory = "food-fun";
  }
  await loadContent();
  bindEvents();
  render();
}

init();
