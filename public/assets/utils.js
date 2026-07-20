/**
 * 前端通用工具库
 * 包含：全局加载状态、错误提示、图片懒加载、API 请求封装
 */

// ============ 全局加载状态 ============

/**
 * 显示全局加载遮罩
 * @param {string} message - 加载提示信息
 */
function showLoading(message = "加载中...") {
  let overlay = document.getElementById("global-loading-overlay");
  
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "global-loading-overlay";
    overlay.innerHTML = `
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <div class="loading-message">${message}</div>
      </div>
    `;
    document.body.appendChild(overlay);
    
    // 添加样式
    const style = document.createElement("style");
    style.textContent = `
      #global-loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      #global-loading-overlay.show {
        opacity: 1;
      }
      .loading-content {
        text-align: center;
        color: #fff;
      }
      .loading-spinner {
        width: 50px;
        height: 50px;
        border: 4px solid rgba(255, 255, 255, 0.3);
        border-top-color: #60a5fa;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 16px;
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      .loading-message {
        font-size: 16px;
      }
    `;
    document.head.appendChild(style);
  } else {
    overlay.querySelector(".loading-message").textContent = message;
  }
  
  // 触发重排后添加 show 类（实现淡入效果）
  overlay.offsetHeight;
  overlay.classList.add("show");
}

/**
 * 隐藏全局加载遮罩
 */
function hideLoading() {
  const overlay = document.getElementById("global-loading-overlay");
  if (overlay) {
    overlay.classList.remove("show");
    setTimeout(() => overlay.remove(), 300);
  }
}

// ============ 错误提示 ============

/**
 * 显示错误提示
 * @param {string} message - 错误信息
 * @param {number} duration - 显示时长（毫秒）
 */
function showError(message, duration = 5000) {
  showToast(message, "error", duration);
}

/**
 * 显示成功提示
 * @param {string} message - 成功信息
 * @param {number} duration - 显示时长（毫秒）
 */
function showSuccess(message, duration = 3000) {
  showToast(message, "success", duration);
}

/**
 * 显示警告提示
 * @param {string} message - 警告信息
 * @param {number} duration - 显示时长（毫秒）
 */
function showWarning(message, duration = 4000) {
  showToast(message, "warning", duration);
}

/**
 * 显示提示信息
 * @param {string} message - 提示信息
 * @param {string} type - 类型：error / success / warning / info
 * @param {number} duration - 显示时长（毫秒）
 */
function showToast(message, type = "info", duration = 3000) {
  const container = getOrCreateToastContainer();
  
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  
  const icons = {
    error: "✕",
    success: "✓",
    warning: "⚠",
    info: "ℹ"
  };
  
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <span class="toast-message">${escapeHtml(message)}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
  `;
  
  container.appendChild(toast);
  
  // 触发动画
  toast.offsetHeight;
  toast.classList.add("show");
  
  // 自动移除
  if (duration > 0) {
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
}

/**
 * 获取或创建 Toast 容器
 */
function getOrCreateToastContainer() {
  let container = document.getElementById("toast-container");
  
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
    
    const style = document.createElement("style");
    style.textContent = `
      #toast-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .toast {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        background: rgba(15, 23, 42, 0.95);
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        color: #fff;
        font-size: 14px;
        min-width: 280px;
        max-width: 400px;
        transform: translateX(120%);
        transition: transform 0.3s ease;
      }
      .toast.show {
        transform: translateX(0);
      }
      .toast-error {
        border-left: 4px solid #ef4444;
      }
      .toast-success {
        border-left: 4px solid #10b981;
      }
      .toast-warning {
        border-left: 4px solid #f59e0b;
      }
      .toast-info {
        border-left: 4px solid #3b82f6;
      }
      .toast-icon {
        font-size: 18px;
        font-weight: bold;
      }
      .toast-error .toast-icon { color: #ef4444; }
      .toast-success .toast-icon { color: #10b981; }
      .toast-warning .toast-icon { color: #f59e0b; }
      .toast-info .toast-icon { color: #3b82f6; }
      .toast-message {
        flex: 1;
        line-height: 1.4;
      }
      .toast-close {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.5);
        cursor: pointer;
        padding: 4px;
        font-size: 16px;
        line-height: 1;
      }
      .toast-close:hover {
        color: #fff;
      }
    `;
    document.head.appendChild(style);
  }
  
  return container;
}

// ============ HTML 转义（XSS 防护） ============

/**
 * HTML 转义
 * @param {string} text - 原始文本
 * @returns {string} 转义后的文本
 */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ============ API 请求封装 ============

/**
 * 封装的 fetch 请求
 * @param {string} url - 请求 URL
 * @param {Object} options - fetch 选项
 * @returns {Promise} 响应数据
 */
async function api(url, options = {}) {
  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  
  // 添加认证 token
  const token = localStorage.getItem("token");
  if (token) {
    defaultOptions.headers["Authorization"] = `Bearer ${token}`;
  }
  
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };
  
  try {
    const response = await fetch(url, mergedOptions);
    
    // 处理响应
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "网络错误" }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

/**
 * GET 请求
 */
async function apiGet(url, params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const fullUrl = queryString ? `${url}?${queryString}` : url;
  return api(fullUrl, { method: "GET" });
}

/**
 * POST 请求
 */
async function apiPost(url, data = {}) {
  return api(url, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * PUT 请求
 */
async function apiPut(url, data = {}) {
  return api(url, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * DELETE 请求
 */
async function apiDelete(url) {
  return api(url, { method: "DELETE" });
}

// ============ 图片懒加载 ============

/**
 * 初始化图片懒加载
 */
function initLazyLoad() {
  if ("IntersectionObserver" in window) {
    const lazyImages = document.querySelectorAll("img[data-src]");
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute("data-src");
          img.classList.add("loaded");
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: "50px 0px",
      threshold: 0.01,
    });
    
    lazyImages.forEach((img) => imageObserver.observe(img));
  } else {
    // 降级方案：直接加载所有图片
    document.querySelectorAll("img[data-src]").forEach((img) => {
      img.src = img.dataset.src;
      img.removeAttribute("data-src");
    });
  }
}

// ============ 工具函数 ============

/**
 * 防抖函数
 * @param {Function} func - 要执行的函数
 * @param {number} wait - 等待时间（毫秒）
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * 节流函数
 * @param {Function} func - 要执行的函数
 * @param {number} limit - 时间限制（毫秒）
 */
function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * 格式化日期
 * @param {Date|string|number} date - 日期
 * @param {string} format - 格式
 */
function formatDate(date, format = "YYYY-MM-DD HH:mm") {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");
  
  return format
    .replace("YYYY", year)
    .replace("MM", month)
    .replace("DD", day)
    .replace("HH", hours)
    .replace("mm", minutes)
    .replace("ss", seconds);
}

/**
 * 复制文本到剪贴板
 * @param {string} text - 要复制的文本
 */
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showSuccess("已复制到剪贴板");
    return true;
  } catch (error) {
    console.error("复制失败:", error);
    showError("复制失败");
    return false;
  }
}

// ============ 导出到全局 ============

window.AllianceUtils = {
  // 加载状态
  showLoading,
  hideLoading,
  
  // 提示信息
  showError,
  showSuccess,
  showWarning,
  showToast,
  
  // API 请求
  api,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  
  // 图片懒加载
  initLazyLoad,
  
  // 工具函数
  escapeHtml,
  debounce,
  throttle,
  formatDate,
  copyToClipboard,
};

// 页面加载完成后自动初始化懒加载
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initLazyLoad);
} else {
  initLazyLoad();
}
