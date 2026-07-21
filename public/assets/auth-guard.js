/**
 * auth-guard.js — 全局登录守卫中间件
 * 所有需要登录才能访问的页面都引用此脚本
 */
(function () {
  'use strict';

  const REDIRECT_DELAY_MS = 50;

  /* 跳转到登录（带上当前页面路径） */
  function redirectToLogin() {
    var isFileMode = window.location.protocol === 'file:';
    var dest = isFileMode
      ? window.location.pathname.split('/').pop() + window.location.search
      : window.location.pathname + window.location.search;
    var loginPage = isFileMode ? 'login.html' : '/login.html';
    window.location.href = loginPage + '?redirect=' + encodeURIComponent(dest);
  }

  /* ====== 初始化：检查登录状态，未登录立即跳转 ====== */
  // 兼容动态注入场景（DOMContentLoaded 可能已触发）
  function checkAuth() {
    if (typeof window.AuthState !== 'undefined') {
      if (!window.AuthState.isLoggedIn()) {
        redirectToLogin();
        return;
      }
    } else {
      // AuthState 还没加载，100ms 后重试
      setTimeout(checkAuth, 100);
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAuth);
  } else {
    checkAuth();
  }
})();
