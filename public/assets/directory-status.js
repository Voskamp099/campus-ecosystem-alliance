const STATUS_LABELS = {
  pending: { label: "联盟初审中", note: "我们已经收到你的申请，正在做基础信息核验与方向初筛。" },
  reviewing: { label: "对接评估中", note: "联盟正在结合你的需求和目标对象，评估最合适的推进方式。" },
  matched: { label: "已转交对接", note: "你的申请已经转交到对应合作方向，正在等待进一步反馈。" },
  contacted: { label: "对接沟通中", note: "联盟或对应合作方已经开始与你沟通，请留意手机、微信或邮箱。" },
  completed: { label: "对接已完成", note: "这次对接流程已经基本完成，后续如有新需求可以继续发起申请。" },
  rejected: { label: "当前暂不匹配", note: "当前申请与现阶段资源匹配度有限，建议调整方向后再次提交。" }
};

const DIRECTORY_TYPE_MAP = {
  campus: "校园方",
  government: "政府方",
  company: "企业方"
};

const APPLICATION_STORAGE_KEY = "alliance_directory_applications";

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function showNotice(message, isError = false) {
  const notice = document.getElementById("queryNotice");
  notice.className = `notice${isError ? " error" : ""}`;
  notice.textContent = message;
}

function readLocalItems() {
  try {
    return JSON.parse(localStorage.getItem(APPLICATION_STORAGE_KEY) || "[]");
  } catch (error) {
    return [];
  }
}

function queryLocal(payload) {
  const trackingCode = String(payload.trackingCode || "").trim().toUpperCase();
  const phone = String(payload.phone || "").trim().replace(/\s+/g, "");
  const wechat = String(payload.wechat || "").trim();
  const email = String(payload.email || "").trim();
  const item = readLocalItems().find(record =>
    String(record.trackingCode || "").toUpperCase() === trackingCode &&
    ((phone && String(record.phone || "").replace(/\s+/g, "") === phone) ||
      (wechat && String(record.wechat || "") === wechat) ||
      (email && String(record.email || "") === email))
  );
  if (!item) {
    throw new Error("没有找到匹配的对接申请，请检查查询编号和联系方式。");
  }
  return { item };
}

function renderResult(item) {
  const statusInfo = STATUS_LABELS[item.status] || { label: item.status || "处理中", note: "申请状态正在更新中。" };
  const wrap = document.getElementById("statusWrap");
  wrap.innerHTML =
    '<div class="status-card">' +
      '<div class="status-top">' +
        '<div>' +
          '<div class="status-title">' + escapeHTML(item.targetTitle || "未指定对象") + '</div>' +
          '<p>' + escapeHTML(item.targetMeta || "生态对接申请") + '</p>' +
        '</div>' +
        '<span class="status-badge">' + escapeHTML(statusInfo.label) + '</span>' +
      '</div>' +
      '<div class="status-grid">' +
        '<div class="meta-box"><strong>查询编号</strong>' + escapeHTML(item.trackingCode || "-") + '</div>' +
        '<div class="meta-box"><strong>对接类别</strong>' + escapeHTML(DIRECTORY_TYPE_MAP[item.directoryType] || "生态对接") + '</div>' +
        '<div class="meta-box"><strong>联系人</strong>' + escapeHTML(item.applicantName || "-") + '</div>' +
        '<div class="meta-box"><strong>提交时间</strong>' + escapeHTML(item.createdAt ? new Date(item.createdAt).toLocaleString("zh-CN") : "-") + '</div>' +
      '</div>' +
      '<div class="timeline">' +
        '<div class="timeline-item"><strong>当前进度</strong><br>' + escapeHTML(statusInfo.note) + '</div>' +
        (item.statusNote ? '<div class="timeline-item"><strong>联盟备注</strong><br>' + escapeHTML(item.statusNote) + '</div>' : '') +
        '<div class="timeline-item"><strong>合作意向</strong><br>' + escapeHTML(item.cooperationIntent || "未填写") + '</div>' +
      '</div>' +
    '</div>';
}

async function queryProgress(payload) {
  if (window.location.protocol === "file:") {
    return queryLocal(payload);
  }

  const response = await fetch("/api/public/directory-applications/query", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify(payload)
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result?.message || "查询失败，请稍后再试");
  }
  return result;
}

function bindEvents() {
  const form = document.getElementById("queryForm");
  const queryBtn = document.getElementById("queryBtn");

  form.addEventListener("submit", async event => {
    event.preventDefault();
    const payload = {
      trackingCode: document.getElementById("trackingCode").value.trim().toUpperCase(),
      phone: document.getElementById("phone").value.trim(),
      wechat: document.getElementById("wechat").value.trim(),
      email: document.getElementById("email").value.trim()
    };

    if (!payload.trackingCode) {
      showNotice("请输入查询编号。", true);
      return;
    }
    if (!payload.phone && !payload.wechat && !payload.email) {
      showNotice("请至少填写一种联系方式用于核验。", true);
      return;
    }

    queryBtn.disabled = true;
    queryBtn.style.opacity = "0.7";
    try {
      const result = await queryProgress(payload);
      renderResult(result.item);
      showNotice("已为你查询到最新进度。");
    } catch (error) {
      showNotice(error.message || "查询失败，请稍后再试。", true);
    } finally {
      queryBtn.disabled = false;
      queryBtn.style.opacity = "1";
    }
  });
}

function init() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("trackingCode") || localStorage.getItem("latestDirectoryTrackingCode") || "";
  if (code) {
    document.getElementById("trackingCode").value = code;
  }
  const phone = localStorage.getItem("userCenterPhone") || "";
  if (phone) {
    document.getElementById("phone").value = phone;
  }
  bindEvents();
}

init();
