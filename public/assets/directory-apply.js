const DIRECTORY_TYPE_MAP = {
  campus: "校园方",
  government: "政府方",
  company: "企业方"
};

const APPLICATION_STORAGE_KEY = "alliance_directory_applications";

const state = {
  directoryType: new URLSearchParams(window.location.search).get("category") || "campus",
  targetTitle: new URLSearchParams(window.location.search).get("title") || "",
  targetMeta: new URLSearchParams(window.location.search).get("meta") || ""
};

function getStatusPageUrl(trackingCode = "") {
  const base = window.location.protocol === "file:" ? "directory-status.html" : "/directory-status";
  if (!trackingCode) return base;
  return `${base}?trackingCode=${encodeURIComponent(trackingCode)}`;
}

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getApplyPageUrl(pathname) {
  if (window.location.protocol === "file:") return pathname;
  return pathname.replace(/\.html$/, "");
}

function showNotice(message, type = "") {
  const notice = document.getElementById("formNotice");
  notice.className = `notice${type ? ` ${type}` : ""}`;
  notice.textContent = message;
}

function renderTarget() {
  const typeLabel = DIRECTORY_TYPE_MAP[state.directoryType] || "生态对接";
  document.getElementById("targetTitle").textContent = state.targetTitle || "未指定对接对象";
  document.getElementById("targetTags").innerHTML = [
    `<span class="tag">${escapeHTML(typeLabel)}</span>`,
    state.targetMeta ? `<span class="tag">${escapeHTML(state.targetMeta)}</span>` : ""
  ].join("");
  document.getElementById("targetDesc").textContent = state.targetTitle
    ? "请围绕当前对象填写合作目标、可合作方向和联系方式，我们会统一跟进。"
    : "当前没有读取到具体对接对象，建议返回名录页重新发起。";
}

function readLocalApplications() {
  try {
    return JSON.parse(localStorage.getItem(APPLICATION_STORAGE_KEY) || "[]");
  } catch (error) {
    return [];
  }
}

function writeLocalApplications(items) {
  localStorage.setItem(APPLICATION_STORAGE_KEY, JSON.stringify(items));
}

function generateTrackingCode() {
  const stamp = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `DX${stamp}${random}`;
}

function buildPayload(formData) {
  return {
    directoryType: state.directoryType,
    targetTitle: state.targetTitle,
    targetMeta: state.targetMeta,
    applicantName: String(formData.get("applicantName") || "").trim(),
    applicantOrg: String(formData.get("applicantOrg") || "").trim(),
    applicantRole: String(formData.get("applicantRole") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    wechat: String(formData.get("wechat") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    cooperationIntent: String(formData.get("cooperationIntent") || "").trim(),
    message: String(formData.get("message") || "").trim()
  };
}

function validatePayload(payload) {
  const errors = {};
  if (!payload.targetTitle) {
    errors.targetTitle = "缺少对接对象信息，请返回名录页重新发起。";
  }
  if (!payload.applicantName) {
    errors.applicantName = "请填写联系人姓名。";
  }
  if (!payload.cooperationIntent) {
    errors.cooperationIntent = "请填写合作意向。";
  }
  if (!payload.message) {
    errors.message = "请填写对接说明。";
  }
  if (!payload.phone && !payload.wechat && !payload.email) {
    errors.contact = "请至少填写一种联系方式。";
  }
  return Object.keys(errors).length ? errors : null;
}

function showFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  field.classList.toggle("field-error", !!message);
  let hint = field.parentElement.querySelector(".field-hint");
  if (message) {
    if (!hint) {
      hint = document.createElement("span");
      hint.className = "field-hint";
      field.parentElement.appendChild(hint);
    }
    hint.textContent = message;
  } else if (hint) {
    hint.textContent = "";
  }
}

function validateField(fieldId) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  const value = (field.value || "").trim();
  let error = "";

  switch (fieldId) {
    case "applicantName":
      if (!value) error = "请填写联系人姓名";
      break;
    case "cooperationIntent":
      if (!value) error = "请填写合作意向";
      break;
    case "phone":
      if (value && !/^1[3-9]\d{9}$/.test(value)) error = "手机号格式不正确";
      break;
    case "email":
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = "邮箱格式不正确";
      break;
    default:
      break;
  }

  showFieldError(fieldId, error);
  return !error;
}

function validateContactFields() {
  const phone = (document.getElementById("phone").value || "").trim();
  const wechat = (document.getElementById("wechat").value || "").trim();
  const email = (document.getElementById("email").value || "").trim();
  const hasContact = phone || wechat || email;
  // 只在至少填了一个联系方式时才报格式错误，否则不报
  if (phone && !/^1[3-9]\d{9}$/.test(phone)) {
    showFieldError("phone", "手机号格式不正确");
    return false;
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showFieldError("email", "邮箱格式不正确");
    return false;
  }
  if (!hasContact) {
    // 不在实时校验时报这个，留到 submit 时
    showFieldError("phone", "");
    showFieldError("email", "");
    showFieldError("wechat", "");
    return true;
  }
  showFieldError("phone", "");
  showFieldError("email", "");
  return true;
}

async function submitApplication(payload) {
  if (window.location.protocol === "file:") {
    const items = readLocalApplications();
    const item = {
      id: Date.now(),
      ...payload,
      trackingCode: generateTrackingCode(),
      status: "pending",
      statusNote: "",
      createdAt: new Date().toISOString()
    };
    items.unshift(item);
    writeLocalApplications(items);
    return {
      message: "对接申请已保存到本地浏览器，可在本地后台“对接申请”里查看。",
      item
    };
  }

  const response = await fetch("/api/public/directory-applications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify(payload)
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result?.message || "提交失败，请稍后再试");
  }
  return result;
}

function bindEvents() {
  const form = document.getElementById("applyForm");
  const submitBtn = document.getElementById("submitBtn");
  const successBox = document.getElementById("successBox");
  const successCode = document.getElementById("successCode");
  const statusLink = document.getElementById("statusLink");

  // 实时校验：blur 时检查
  ["applicantName", "cooperationIntent", "phone", "email"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("blur", () => validateField(id));
  });

  // 输入时清除错误状态
  ["applicantName", "cooperationIntent", "phone", "email", "wechat", "message"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", () => showFieldError(id, ""));
  });

  form.addEventListener("submit", async event => {
    event.preventDefault();

    // 先做全量实时校验
    let valid = true;
    ["applicantName", "cooperationIntent", "phone", "email"].forEach(id => {
      if (!validateField(id)) valid = false;
    });
    if (!validateContactFields()) valid = false;
    if (!valid) return;

    submitBtn.disabled = true;
    submitBtn.style.opacity = "0.7";

    try {
      const payload = buildPayload(new FormData(form));
      const errors = validatePayload(payload);
      if (errors) {
        // 逐字段显示错误
        Object.entries(errors).forEach(([key, msg]) => {
          if (key === "contact") {
            showFieldError("phone", msg);
          } else {
            showFieldError(key, msg);
          }
        });
        return;
      }
      const result = await submitApplication(payload);
      const trackingCode = result?.item?.trackingCode || "";
      if (trackingCode) {
        localStorage.setItem("latestDirectoryTrackingCode", trackingCode);
        successCode.textContent = trackingCode;
        statusLink.href = getStatusPageUrl(trackingCode);
        successBox.classList.add("open");
      }
      showNotice(result.message + (trackingCode ? " 你也可以用查询编号在站内查询处理进度。" : ""), "success");
      form.reset();
      // 清除所有字段错误
      document.querySelectorAll(".field-hint").forEach(el => el.textContent = "");
      document.querySelectorAll(".field-error").forEach(el => el.classList.remove("field-error"));
      // 保存手机号到 localStorage 方便用户查看记录
      if (payload.phone) {
        localStorage.setItem('userCenterPhone', payload.phone);
      }
    } catch (error) {
      showNotice(error.message || "提交失败，请稍后再试。", "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.style.opacity = "1";
    }
  });
}

function init() {
  if (!Object.prototype.hasOwnProperty.call(DIRECTORY_TYPE_MAP, state.directoryType)) {
    state.directoryType = "campus";
  }
  renderTarget();
  bindEvents();
  document.getElementById("statusLink").href = getStatusPageUrl();
}

init();
