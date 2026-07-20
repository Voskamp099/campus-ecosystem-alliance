const DIRECTORY_TABS = [
  { slug: "campus", title: "校园方" },
  { slug: "government", title: "政府方" },
  { slug: "company", title: "企业方" }
];

const defaultDirectory = {
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
};

const state = {
  activeCategory: new URLSearchParams(window.location.search).get("category") || "campus",
  keyword: "",
  content: {
    directory: defaultDirectory
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
    state.content.directory = {
      campus: readLocalContent("alliance_directory_campus", defaultDirectory.campus),
      government: readLocalContent("alliance_directory_government", defaultDirectory.government),
      company: readLocalContent("alliance_directory_company", defaultDirectory.company)
    };
    return;
  }

  try {
    const response = await fetch("/api/public/site-content", { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error("加载生态对接名录失败");
    const data = await response.json();
    state.content.directory = data.directory && typeof data.directory === "object"
      ? { ...defaultDirectory, ...data.directory }
      : defaultDirectory;
  } catch (error) {
    console.warn(error.message);
  }
}

function getActiveItems() {
  const items = state.content.directory[state.activeCategory] || [];
  const keyword = state.keyword.trim().toLowerCase();
  if (!keyword) return items;
  return items.filter(item => {
    const haystack = [item.title, item.desc, item.meta, item.link]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(keyword);
  });
}

function getApplyLink(item) {
  const target = window.location.protocol === "file:" ? "directory-apply.html" : "/directory-apply";
  const params = new URLSearchParams({
    category: state.activeCategory,
    title: item.title || "",
    meta: item.meta || ""
  });
  return `${target}?${params.toString()}`;
}

function renderDirectionTags(items) {
  if (!Array.isArray(items) || !items.length) return "";
  return '<div class="item-meta">' + items.map(item => (
    '<span class="item-tag">' + escapeHTML(item) + '</span>'
  )).join("") + '</div>';
}

function renderTabs() {
  const wrap = document.getElementById("directoryTabs");
  wrap.innerHTML = DIRECTORY_TABS.map(tab => (
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
  const list = document.getElementById("directoryList");
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
        : '<div class="item-thumb-placeholder">录</div>') +
      '<div>' +
        '<h3 class="item-title">' + escapeHTML(item.title) + '</h3>' +
        '<div class="item-meta">' +
          (item.meta ? '<span class="item-tag">' + escapeHTML(item.meta) + '</span>' : "") +
          '<span class="item-tag">' + escapeHTML(DIRECTORY_TABS.find(tab => tab.slug === state.activeCategory)?.title || "") + '</span>' +
        '</div>' +
        '<p class="item-desc">' + escapeHTML(item.desc || "点击右侧查看详情") + '</p>' +
        renderDirectionTags(item.items) +
      '</div>' +
      '<div class="item-side">' +
        '<a class="btn btn-primary" href="' + escapeHTML(getApplyLink(item)) + '">发起对接</a>' +
      '</div>' +
    '</article>'
  )).join("");
}

function bindEvents() {
  const search = document.getElementById("directorySearch");
  search.addEventListener("input", event => {
    state.keyword = event.target.value;
    renderList();
  });
}

function render() {
  renderTabs();
  renderList();
}

async function init() {
  if (!DIRECTORY_TABS.some(tab => tab.slug === state.activeCategory)) {
    state.activeCategory = "campus";
  }
  await loadContent();
  bindEvents();
  render();
}

init();
