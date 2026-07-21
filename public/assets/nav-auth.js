/**
 * nav-auth.js — 导航栏登录状态感知
 * 所有页面引用此脚本后，自动检查 JWT 并更新导航栏
 */
(function () {
  'use strict';

  const AUTH_KEY = 'alliance_token';
  const USER_KEY = 'alliance_user';
  const ADMIN_TOKEN_KEY = 'alliance_admin_token';
  const API_BASE = '';
  const IS_FILE_MODE = window.location.protocol === 'file:';
  const LOCAL_LOGIN_PAGE = 'login.html';
  const LOCAL_MY_PAGE = 'my.html';

  function getLoginPage() {
    return IS_FILE_MODE ? LOCAL_LOGIN_PAGE : '/login.html';
  }

  function getMyPage() {
    return IS_FILE_MODE ? LOCAL_MY_PAGE : '/my.html';
  }

  function getToken() {
    try { return localStorage.getItem(AUTH_KEY) || localStorage.getItem(ADMIN_TOKEN_KEY); } catch { return null; }
  }

  function getUser() {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  function saveAuth(token, user) {
    try {
      localStorage.setItem(AUTH_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {}
  }

  function clearAuth() {
    try {
      localStorage.removeItem(AUTH_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(ADMIN_TOKEN_KEY);
    } catch {}
  }

  /* ====== 导航栏更新 ====== */
  function updateNav() {
    const user = getUser();
    const token = getToken();
    const navCta = document.querySelector('.nav-cta');
    if (!navCta) return;

    if (token && user) {
      // 已登录
      const nickname = user.nickname || user.email || '用户';
      navCta.href = getMyPage();
      navCta.textContent = nickname;
      navCta.title = '进入我的中心';

      // 如果导航栏里有移动端登录链接也一并改
      document.querySelectorAll('a[href="/login.html"], a[href="login.html"]').forEach(a => {
        a.href = getMyPage();
        a.textContent = nickname;
      });
      
    } else {
      // 未登录
      navCta.href = getLoginPage();
      navCta.textContent = '登录 / 注册';
    }
  }


  /* ====== 服务端验证 token 有效性 ====== */
  async function verifyToken() {
    const token = getToken();
    if (!token) { clearAuth(); return null; }

    // 管理员专用 token（后台登录产生）：不通过用户接口校验，避免被当作无效用户清空
    let adminToken = null;
    try { adminToken = localStorage.getItem(ADMIN_TOKEN_KEY); } catch {}
    if (token === adminToken) {
      return getUser() || { isAdmin: true, nickname: '管理员', email: 'admin@alliance.local' };
    }

    if (IS_FILE_MODE) {
      const user = getUser();
      if ((token === 'local-user-token' || token === 'local-admin-token') && user) {
        return user;
      }
      clearAuth();
      return null;
    }

    try {
      const res = await fetch(API_BASE + '/api/auth/me', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (!res.ok) {
        clearAuth();
        return null;
      }
      const data = await res.json();
      if (data.success && data.user) {
        saveAuth(token, data.user);
        return data.user;
      }
    } catch {}
    return null;
  }

  /* ====== 退出登录 ====== */
  window.logout = function () {
    clearAuth();
    window.location.href = getLoginPage();
  };

  /* ====== 获取登录状态（供其他脚本使用） ====== */
  window.AuthState = {
    getToken,
    getUser,
    saveAuth,
    clearAuth,
    isLoggedIn() { return !!getToken(); },
    isAdmin() {
      if (IS_FILE_MODE) return !!getUser()?.isAdmin;
      try {
        const t = getToken();
        if (!t) return false;
        const raw = t.split('.')[1].replace(/-/g,'+').replace(/_/g,'/');
        const pad = raw.length + (4 - raw.length % 4) % 4;
        const p = JSON.parse(atob(raw + '='.repeat(pad)));
        return p.role === 'admin';
      } catch { return false; }
    },
    requireLogin() {
      if (!getToken()) {
        const dest = IS_FILE_MODE
          ? window.location.pathname.split('/').pop() + window.location.search
          : window.location.pathname + window.location.search;
        window.location.href = getLoginPage() + '?redirect=' + encodeURIComponent(dest);
        return false;
      }
      return true;
    }
  };

  /* ====== 初始化 ====== */
  // 兼容动态注入场景（DOMContentLoaded 可能已触发）
  async function bootNavAuth() {
    await verifyToken();
    updateNav();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootNavAuth);
  } else {
    bootNavAuth();
  }
})();
