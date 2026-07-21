const defaultCategories = [
  { slug: "food-fun", title: "吃喝玩乐", desc: "餐饮折扣、青年社交与线下聚会资源。", image: "", items: ["联盟餐饮折扣", "线下聚会优先报名"] },
  { slug: "lifestyle", title: "衣食住行", desc: "酒店优惠、购物折扣、出行补贴等。", image: "", items: ["酒店会员优惠", "出行补贴"] },
  { slug: "study-life", title: "学习提升", desc: "课程、工具、论文与学业支持。", image: "", items: ["AI 学习工具", "论文辅助资源"] },
  { slug: "career-startup", title: "就业创业", desc: "实习实践、创业者社群和导师支持。", image: "", items: ["实习实践", "创业者社群"] }
];

const defaultCategoryDetails = {
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
};

const defaultRecruitItems = [
  { title: "AI 产品经理实习生", meta: "北京 · 京东总部 · 实习 3 个月+", desc: "适合对 AI 产品和需求分析有兴趣的同学。", image: "", link: "mailto:hr@example.com" },
  { title: "百度 AI 生态志愿者计划", image: "", desc: "适合企业合作伙伴、技术团队和校园组织，围绕百度 AI 生态展开交流。", meta: "百度生态 · 线上社群", link: "#join" },
  { title: "Wteam 创业者长期招募", image: "", desc: "面向有项目、有想法或正在寻找方向的大学生创业者，提供长期陪伴与资源对接。", meta: "创业社群 · 全国高校", link: "#join" }
];

const defaultEventItems = [
  { title: "OpenClaw 从安装到落地", meta: "AI 活动 · 北京", desc: "围绕 AI 工具接入、协作方式和实际落地案例的交流小聚。", image: "", link: "#join" },
  { title: "校园生态合作闭门交流", meta: "联盟活动 · 北京", desc: "聚焦校园生态合作、资源协同与活动共建的深度交流。", image: "", link: "#events" },
  { title: "青年成长与实践分享会", meta: "成长活动 · 线下", desc: "围绕实践机会、成长路径和跨校交流展开分享与答疑。", image: "", link: "#events" }
];

const defaultHeroCarousel = [
  { title: "联盟活动现场", meta: "活动照片", image: "", link: "#events" },
  { title: "校园交流与分享", meta: "活动照片", image: "", link: "#events" },
  { title: "生态合作与共建", meta: "活动照片", image: "", link: "#events" }
];

const defaultPartners = {
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
};

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

const IS_FILE_MODE = window.location.protocol === "file:";

const state = {
  content: {
    heroCarousel: defaultHeroCarousel,
    categories: defaultCategories,
    categoryDetails: defaultCategoryDetails,
    recruit: defaultRecruitItems,
    events: defaultEventItems,
    partners: defaultPartners,
    directory: defaultDirectory
  },
  currentPartnerType: "university",
  currentDirectoryType: "campus",
  currentSearch: "",
  lastFocusedElement: null
};

const LOCAL_PAGE_MAP = {
  "/": "index.html",
  "/index.html": "index.html",
  "/categories": "categories.html",
  "/categories.html": "categories.html",
  "/directory": "directory.html",
  "/directory.html": "directory.html",
  "/directory-apply": "directory-apply.html",
  "/directory-apply.html": "directory-apply.html",
  "/directory-status": "directory-status.html",
  "/directory-status.html": "directory-status.html",
  "/login": "login.html",
  "/login.html": "login.html",
  "/register": "register.html",
  "/register.html": "register.html",
  "/my": "my.html",
  "/my.html": "my.html",
  "/publish": "publish.html",
  "/publish.html": "publish.html",
  "/admin": "admin.html",
  "/admin.html": "admin.html"
};

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getLogoData(type) {
  return state.content.partners[type] || [];
}

function getContentData(sectionKey) {
  if (sectionKey === "alliance_content_categories") return state.content.categories;
  if (sectionKey === "alliance_content_recruit") return state.content.recruit;
  if (sectionKey === "alliance_content_events") return state.content.events;
  if (sectionKey === "alliance_content_hero_carousel") return state.content.heroCarousel;
  return [];
}

function getCategoryDetailData(slug) {
  return state.content.categoryDetails[slug] || [];
}

function getCategoryPageUrl(slug) {
  const base = window.location.protocol === "file:" ? "categories.html" : "/categories.html";
  return `${base}?category=${encodeURIComponent(slug)}`;
}

function getDirectoryPageUrl(slug) {
  const base = window.location.protocol === "file:" ? "directory.html" : "/directory.html";
  return `${base}?category=${encodeURIComponent(slug)}`;
}

function getPageUrl(path) {
  if (!IS_FILE_MODE) return path;
  const [pathname, query = ""] = String(path || "").split("?");
  const localPath = LOCAL_PAGE_MAP[pathname] || pathname.replace(/^\//, "");
  return query ? `${localPath}?${query}` : localPath;
}

function fixSectionMoreLinks() {
  if (!IS_FILE_MODE) return;
  document.querySelectorAll(".section-more[data-category]").forEach(link => {
    link.href = getCategoryPageUrl(link.dataset.category);
  });
  document.querySelectorAll(".section-more[data-directory-page]").forEach(link => {
    link.href = getDirectoryPageUrl(link.dataset.directoryPage);
  });
}

function fixLocalPageLinks() {
  if (!IS_FILE_MODE) return;
  document.querySelectorAll('a[href^="/"]').forEach(link => {
    const href = link.getAttribute("href");
    if (!href || href.startsWith("//")) return;
    link.setAttribute("href", getPageUrl(href));
  });
}

function readLocalContent(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch (error) {}
  return fallback;
}

async function loadSiteContent() {
  if (IS_FILE_MODE) {
    state.content = {
      heroCarousel: readLocalContent("alliance_content_hero_carousel", defaultHeroCarousel),
      categories: readLocalContent("alliance_content_categories", defaultCategories),
      categoryDetails: {
        "food-fun": readLocalContent("alliance_content_category_details_food-fun", defaultCategoryDetails["food-fun"]),
        lifestyle: readLocalContent("alliance_content_category_details_lifestyle", defaultCategoryDetails.lifestyle),
        "study-life": readLocalContent("alliance_content_category_details_study-life", defaultCategoryDetails["study-life"]),
        "career-startup": readLocalContent("alliance_content_category_details_career-startup", defaultCategoryDetails["career-startup"])
      },
      recruit: readLocalContent("alliance_content_recruit", defaultRecruitItems),
      events: readLocalContent("alliance_content_events", defaultEventItems),
      partners: {
        university: readLocalContent("alliance_logos_university", defaultPartners.university),
        company: readLocalContent("alliance_logos_company", defaultPartners.company),
        government: readLocalContent("alliance_logos_government", defaultPartners.government)
      },
      directory: {
        campus: readLocalContent("alliance_directory_campus", defaultDirectory.campus),
        government: readLocalContent("alliance_directory_government", defaultDirectory.government),
        company: readLocalContent("alliance_directory_company", defaultDirectory.company)
      }
    };
    return;
  }
  try {
    const response = await fetch("/api/public/site-content", { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error("加载站点内容失败");
    const data = await response.json();
    state.content = {
      heroCarousel: Array.isArray(data.heroCarousel) ? data.heroCarousel : defaultHeroCarousel,
      categories: Array.isArray(data.categories) ? data.categories : defaultCategories,
      categoryDetails: data.categoryDetails && typeof data.categoryDetails === "object" ? data.categoryDetails : defaultCategoryDetails,
      recruit: Array.isArray(data.recruit) ? data.recruit : defaultRecruitItems,
      events: Array.isArray(data.events) ? data.events : defaultEventItems,
      partners: data.partners && typeof data.partners === "object" ? data.partners : defaultPartners,
      directory: data.directory && typeof data.directory === "object" ? data.directory : defaultDirectory
    };
  } catch (error) {
    console.warn(error.message);
  }
}

function fixLocalAssetPaths() {
  document.querySelectorAll(".wecom-qr-image").forEach(image => {
    const placeholder = image.nextElementSibling;
    const src = window.location.protocol === "file:" ? image.dataset.localSrc : image.dataset.serverSrc;
    image.hidden = false;
    if (placeholder) placeholder.hidden = true;
    image.onerror = () => {
      image.hidden = true;
      if (placeholder) placeholder.hidden = false;
    };
    image.onload = () => {
      image.hidden = false;
      if (placeholder) placeholder.hidden = true;
    };
    image.src = src;
  });
}

function renderHeroVisual() {
  const data = getContentData("alliance_content_hero_carousel").filter(item => item && item.image);
  const placeholder = document.getElementById("heroMediaPlaceholder");
  const dots = document.getElementById("heroCarouselDots");
  if (!placeholder) return;

  if (!data.length) {
    placeholder.innerHTML = '<div class="hero-media-badge">16:9</div>';
    if (dots) dots.innerHTML = "";
    return;
  }

  placeholder.innerHTML = data.map((item, index) => (
    '<a class="hero-carousel-slide ' + (index === 0 ? "active" : "") + '" href="' + escapeHTML(item.link || "#events") + '" target="' + ((item.link || "").startsWith("http") ? "_blank" : "_self") + '">' +
      '<img class="hero-media-image" src="' + escapeHTML(item.image) + '" alt="' + escapeHTML(item.title || "活动照片") + '" loading="lazy" decoding="async">' +
      '<div class="hero-carousel-caption">' +
        '<strong>' + escapeHTML(item.title || "活动照片") + '</strong>' +
        (item.meta ? '<span>' + escapeHTML(item.meta) + '</span>' : "") +
      "</div>" +
    "</a>"
  )).join("");

  if (dots) {
    dots.innerHTML = data.map((_, index) => (
      '<button class="hero-carousel-dot ' + (index === 0 ? "active" : "") + '" type="button" data-dot="' + index + '" aria-label="切换到第' + (index + 1) + '张"></button>'
    )).join("");
  }

  const slides = placeholder.querySelectorAll(".hero-carousel-slide");
  const dotButtons = dots ? dots.querySelectorAll(".hero-carousel-dot") : [];
  let activeIndex = 0;

  function setActive(nextIndex) {
    slides.forEach((slide, index) => slide.classList.toggle("active", index === nextIndex));
    dotButtons.forEach((dot, index) => dot.classList.toggle("active", index === nextIndex));
    activeIndex = nextIndex;
  }

  dotButtons.forEach((dot, index) => dot.addEventListener("click", () => setActive(index)));
  if (data.length > 1 && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    clearInterval(window.__heroCarouselTimer);
    window.__heroCarouselTimer = setInterval(() => {
      setActive((activeIndex + 1) % slides.length);
    }, 3200);
  }
}

function renderPartnerGrid(type) {
  const rawData = getLogoData(type).filter(item => item && item.name);
  const filtered = state.currentSearch
    ? rawData.filter(item => {
        const haystack = (item.name + " " + (item.type || "")).toLowerCase();
        return haystack.includes(state.currentSearch.toLowerCase().trim());
      })
    : rawData;

  const grid = document.getElementById("logoGrid");
  const noResult = document.getElementById("noResult");
  const count = document.getElementById("partnerCountNum");

  if (!grid || !noResult || !count) return;
  count.textContent = String(filtered.length);
  grid.innerHTML = filtered.map(item => {
    const avatar = item.logo
      ? '<img src="' + escapeHTML(item.logo) + '" alt="' + escapeHTML(item.name) + ' logo" style="width:46px;height:46px;object-fit:contain;border-radius:14px;" loading="lazy" decoding="async">'
      : '<div class="logo-avatar">' + escapeHTML(item.name.slice(0, 2)) + "</div>";

    return (
      '<article class="logo-cell">' +
        '<div class="logo-top">' +
          avatar +
          '<span class="logo-kind">' + (
            type === "university" ? "高校" :
            type === "government" ? "政府" : "企业"
          ) + "</span>" +
        "</div>" +
        '<h3 class="logo-name">' + escapeHTML(item.name) + "</h3>" +
        '<p class="logo-type">' + escapeHTML(item.type || "合作伙伴") + "</p>" +
      "</article>"
    );
  }).join("");

  noResult.classList.toggle("show", filtered.length === 0);
}

function setPartnerType(type) {
  state.currentPartnerType = type;
  document.querySelectorAll(".partner-tab").forEach(button => {
    const active = button.dataset.type === type;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", active ? "true" : "false");
  });
  renderPartnerGrid(type);
}


function getDirectoryData(type) {
  return state.content.directory[type] || [];
}

function renderDirectoryItems(items) {
  if (!Array.isArray(items) || !items.length) return "";
  return items.map(item => (
    '<span class="directory-badge">' + escapeHTML(item) + '</span>'
  )).join('');
}

function renderDirectoryGrid(type) {
  const items = getDirectoryData(type).filter(item => item && item.title);
  const grid = document.getElementById("directoryGrid");
  const count = document.getElementById("directoryCountNum");
  if (!grid || !count) return;

  count.textContent = String(items.length);
  if (!items.length) {
    grid.innerHTML = '<div class="section-empty">后台还没有上传这类生态对接名录内容。</div>';
    return;
  }

  grid.innerHTML = items.map(item => (
    '<article class="directory-card card reveal">' +
      (item.image
        ? '<div class="directory-thumb"><img src="' + escapeHTML(item.image) + '" alt="' + escapeHTML(item.title) + '" loading="lazy" decoding="async"></div>'
        : '<div class="directory-thumb directory-thumb-placeholder">' + escapeHTML((item.title || '').slice(0, 2)) + '</div>') +
      '<div class="directory-card-body">' +
        '<div class="directory-meta-row">' +
          (item.meta ? '<span class="directory-badge">' + escapeHTML(item.meta) + '</span>' : '') +
        '</div>' +
        '<h3 class="directory-name">' + escapeHTML(item.title) + '</h3>' +
        '<p class="directory-desc">' + escapeHTML(item.desc || '点击查看详情') + '</p>' +
        renderDirectoryItems(item.items) +
      '</div>' +
      '<div class="directory-side">' +
        '<a class="btn btn-secondary" href="' + escapeHTML(item.link && !item.link.startsWith('#') ? item.link : 'directory.html?category=' + type) + '" target="' + ((item.link || '').startsWith('http') ? '_blank' : '_self') + '">查看合作方向</a>' +
      '</div>' +
    '</article>'
  )).join('');
}

function setDirectoryType(type) {
  state.currentDirectoryType = type;
  document.querySelectorAll('.directory-tab').forEach(button => {
    const active = button.dataset.directoryType === type;
    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', active ? 'true' : 'false');
  });
  renderDirectoryGrid(type);
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  state.lastFocusedElement = document.activeElement;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  const closeButton = modal.querySelector(".modal-close");
  if (closeButton) closeButton.focus();
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  if (state.lastFocusedElement && typeof state.lastFocusedElement.focus === "function") {
    state.lastFocusedElement.focus();
  }
}

function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach(item => item.classList.add("visible"));
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  items.forEach(item => observer.observe(item));
}

function initCountup() {
  const numbers = document.querySelectorAll(".countup");
  if (!numbers.length) return;
  if (!("IntersectionObserver" in window)) {
    numbers.forEach(number => {
      const target = Number(number.dataset.target || 0);
      number.textContent = String(target);
    });
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.dataset.target || 0);
      const start = performance.now();
      const duration = 1100;
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = String(Math.round(target * eased));
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      observer.unobserve(el);
    });
  }, { threshold: 0.6 });
  numbers.forEach(number => observer.observe(number));
}

function initHeroCanvas() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const canvas = document.getElementById("heroCanvas");
  if (!canvas) return;
  const context = canvas.getContext("2d");
  if (!context) return;
  let width = 0;
  let height = 0;
  let stars = [];
  function resize() {
    width = canvas.width = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
    stars = Array.from({ length: width < 800 ? 70 : 130 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.8 + 0.4,
      speed: Math.random() * 0.25 + 0.08,
      alpha: Math.random() * 0.5 + 0.2
    }));
  }
  function draw() {
    context.clearRect(0, 0, width, height);
    context.strokeStyle = "rgba(96,165,250,0.05)";
    context.lineWidth = 0.5;
    for (let x = 0; x < width; x += 68) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, height);
      context.stroke();
    }
    for (let y = 0; y < height; y += 68) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(width, y);
      context.stroke();
    }
    stars.forEach(star => {
      star.y -= star.speed;
      if (star.y < -8) {
        star.y = height + 8;
        star.x = Math.random() * width;
      }
      context.globalAlpha = star.alpha;
      context.beginPath();
      context.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      context.fillStyle = "#93c5fd";
      context.fill();
      context.globalAlpha = 1;
    });
    requestAnimationFrame(draw);
  }
  resize();
  window.addEventListener("resize", resize);
  draw();
}

function initNavState() {
  const nav = document.getElementById("nav");
  const backTop = document.getElementById("backTop");
  const progress = document.getElementById("scroll-progress");
  const sectionLinks = Array.from(document.querySelectorAll(".nav-links a"));
  const sections = Array.from(document.querySelectorAll("main section[id]"));
  function onScroll() {
    const y = window.scrollY;
    if (nav) nav.classList.toggle("scrolled", y > 10);
    if (backTop) backTop.classList.toggle("show", y > 500);
    const total = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = (total > 0 ? (y / total) * 100 : 0) + "%";
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        sectionLinks.forEach(link => {
          link.classList.toggle("nav-active", link.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { threshold: 0.45 });
    sections.forEach(section => observer.observe(section));
  }
  if (backTop) {
    backTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
}

function initNavToggle() {
  const toggle = document.getElementById("navToggle");
  const mobileNav = document.getElementById("mobileNav");
  if (!toggle || !mobileNav) return;
  toggle.addEventListener("click", () => {
    const open = mobileNav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  mobileNav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      mobileNav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

function renderCategories() {
  const grid = document.getElementById("categoriesGrid");
  if (!grid) return;
  const items = state.content.categories;
  grid.innerHTML = items.map((item, index) => (
    '<a class="cat-card card reveal" href="' + escapeHTML(getCategoryPageUrl(item.slug)) + '">' +
      (item.image
        ? '<img class="cat-thumb" src="' + escapeHTML(item.image) + '" alt="' + escapeHTML(item.title) + '" loading="lazy" decoding="async">'
        : '<span class="cat-icon" aria-hidden="true">📦</span>') +
      '<h3 class="cat-name">' + escapeHTML(item.title) + "</h3>" +
      '<p class="cat-desc">' + escapeHTML(item.desc || "点击查看详情") + "</p>" +
      '<span class="cat-foot">点击了解详情</span>' +
    "</a>"
  )).join("");
}

function renderRecruitItems() {
  const grid = document.getElementById("recruitGrid");
  if (!grid) return;
  // 合并后台管理 + 用户发布的实习实践
  const adminItems = (state.content.recruit || []).map(i => ({ ...i, _source: "admin" }));
  const userItems = (state.content.userRecruits || []).map(i => ({
    id: i.id,
    title: i.title,
    meta: (i.meta || "用户发布") + " · 来自社区",
    desc: i.desc,
    image: i.image,
    link: i.link || "#",
    _source: "user"
  }));
  const items = [...adminItems, ...userItems];
  if (!items.length) {
    grid.innerHTML = '<div class="section-empty">暂无实习实践内容，<a href="' + escapeHTML(getPageUrl("/publish.html")) + '" style="color:var(--brand);text-decoration:underline;">去发布</a>或等待管理员添加。</div>';
    return;
  }
  grid.innerHTML = items.map(item => (
    '<article class="recruit-card card reveal">' +
      (item.image
        ? '<img class="recruit-thumb" src="' + escapeHTML(item.image) + '" alt="' + escapeHTML(item.title) + '" loading="lazy" decoding="async">'
        : '<div class="recruit-company">' + escapeHTML((item.title || "实践").slice(0, 2)) + "</div>") +
      "<div>" +
        '<h3 class="recruit-title">' + escapeHTML(item.title) + "</h3>" +
        '<div class="recruit-tags">' +
          (item.meta ? '<span class="recruit-tag">' + escapeHTML(item.meta) + "</span>" : "") +
        "</div>" +
        (item.desc ? '<p class="event-desc" style="margin-top:12px;margin-bottom:0;">' + escapeHTML(item.desc) + "</p>" : "") +
      "</div>" +
      '<div class="recruit-side">' +
        '<a class="btn btn-primary" href="' + escapeHTML(item.link || "#join") + '" target="' + ((item.link || "").startsWith("http") ? "_blank" : "_self") + '">查看详情</a>' +
        '<span class="mini-note">' + escapeHTML(item.link || "请在后台补充链接") + "</span>" +
      "</div>" +
    "</article>"
  )).join("");
}

function renderEvents() {
  const grid = document.getElementById("eventsGrid");
  if (!grid) return;
  // 合并后台管理 + 用户发布的活动
  const adminItems = (state.content.events || []).slice(0, 6).map(i => ({ ...i, _source: "admin" }));
  const userItems = (state.content.userEvents || []).map(i => ({
    id: i.id,
    title: i.title,
    meta: (i.meta || "用户发布") + " · 来自社区",
    desc: i.desc,
    image: i.image,
    link: i.link || "#",
    _source: "user"
  }));
  const items = [...adminItems, ...userItems].slice(0, 12);
  if (!items.length) {
    grid.innerHTML = '<div class="section-empty">暂无近期活动，<a href="' + escapeHTML(getPageUrl("/publish.html")) + '" style="color:var(--brand);text-decoration:underline;">去发布</a>或等待管理员添加。</div>';
    return;
  }
  grid.innerHTML = items.map(item => (
    '<article class="event-card card reveal">' +
      '<div class="event-visual" aria-hidden="true">' +
        (item.image ? '<img src="' + escapeHTML(item.image) + '" alt="' + escapeHTML(item.title) + '" loading="lazy" decoding="async">' : "📅") +
      "</div>" +
      '<div class="event-tag">' + escapeHTML(item.meta || "近期活动") + "</div>" +
      '<h3 class="event-title">' + escapeHTML(item.title) + "</h3>" +
      '<p class="event-desc">' + escapeHTML(item.desc || "点击了解详情") + "</p>" +
      '<div class="event-footer">' +
        '<a class="btn btn-secondary" href="' + escapeHTML(item.link || "#join") + '" target="' + ((item.link || "").startsWith("http") ? "_blank" : "_self") + '">查看详情</a>' +
      "</div>" +
    "</article>"
  )).join("");
}

function initHeroPartners() {
  const allPartners = [
    ...(state.content.partners.university || []),
    ...(state.content.partners.company || []),
    ...(state.content.partners.government || [])
  ];
  const seen = new Set();
  const unique = allPartners.filter(item => {
    if (seen.has(item.name)) return false;
    seen.add(item.name);
    return true;
  });
  const track = document.getElementById("heroPartnersTrack");
  if (!track) return;
  track.innerHTML = [...unique, ...unique].map(item => (
    '<div class="partner-chip">' +
      '<span class="partner-chip-avatar">' + escapeHTML((item.name || "").slice(0, 2)) + "</span>" +
      '<span>' + escapeHTML(item.name) + "</span>" +
    "</div>"
  )).join("");
}

function bindStaticEvents() {
  document.querySelectorAll("[data-close-modal]").forEach(button => {
    button.addEventListener("click", () => closeModal(button.dataset.closeModal));
  });
  document.querySelectorAll(".modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", event => {
      if (event.target === overlay) closeModal(overlay.id);
    });
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      document.querySelectorAll(".modal-overlay.open").forEach(modal => closeModal(modal.id));
    }
  });
  const partnerSearch = document.getElementById("partnerSearch");
  const searchClear = document.getElementById("searchClear");
  if (partnerSearch && searchClear) {
    partnerSearch.addEventListener("input", event => {
      state.currentSearch = event.target.value;
      searchClear.classList.toggle("visible", state.currentSearch.trim().length > 0);
      renderPartnerGrid(state.currentPartnerType);
    });
    searchClear.addEventListener("click", () => {
      state.currentSearch = "";
      partnerSearch.value = "";
      searchClear.classList.remove("visible");
      renderPartnerGrid(state.currentPartnerType);
    });
  }
  document.querySelectorAll(".partner-tab").forEach(button => {
    button.addEventListener("click", () => setPartnerType(button.dataset.type));
  });
  document.querySelectorAll(".directory-tab").forEach(button => {
    button.addEventListener("click", () => setDirectoryType(button.dataset.directoryType));
  });
}

/* ====== 服务条款 / 隐私政策 弹窗 ====== */
function initLegalModal() {
  if (document.getElementById("legalModal")) return;
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.id = "legalModal";
  overlay.setAttribute("aria-hidden", "true");
  overlay.innerHTML =
    '<div class="modal-box" style="padding:0;overflow:hidden;display:flex;flex-direction:column;' +
      'background:linear-gradient(180deg, rgba(11,27,52,0.98), rgba(8,22,37,0.98));">' +
      '<div style="display:flex;justify-content:flex-end;padding:10px 14px;flex-shrink:0;">' +
        '<button id="legalModalClose" type="button" aria-label="关闭" ' +
          'style="width:36px;height:36px;border-radius:12px;border:1px solid rgba(147,197,253,0.18);' +
          'background:rgba(255,255,255,0.06);color:#fff;font-size:20px;cursor:pointer;line-height:1;">×</button>' +
      '</div>' +
      '<iframe id="legalFrame" title="法律条款" style="width:100%;height:74vh;border:0;background:#fff;"></iframe>' +
    '</div>';
  document.body.appendChild(overlay);

  const frame = overlay.querySelector("#legalFrame");
  overlay.querySelector("#legalModalClose").addEventListener("click", () => closeModal("legalModal"));

  document.querySelectorAll('a[href$="terms.html"], a[href$="privacy.html"]').forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
      const href = link.getAttribute("href") || "";
      const target = href.indexOf("privacy") !== -1
        ? (IS_FILE_MODE ? "privacy.html" : "/privacy.html")
        : (IS_FILE_MODE ? "terms.html" : "/terms.html");
      frame.src = target;
      openModal("legalModal");
    });
  });
}

async function init() {
  fixLocalAssetPaths();
  fixLocalPageLinks();
  fixSectionMoreLinks();
  initLegalModal();
  await loadSiteContent();
  renderHeroVisual();
  renderCategories();
  renderPartnerGrid(state.currentPartnerType);
  renderDirectoryGrid(state.currentDirectoryType);
  renderRecruitItems();
  renderEvents();
  initHeroPartners();
  bindStaticEvents();
  initReveal();
  initCountup();
  initHeroCanvas();
  initNavState();
  initNavToggle();
}

init();
