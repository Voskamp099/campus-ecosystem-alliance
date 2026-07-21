/**
 * user-center.js — 我的页面专用脚本（左右两栏版）
 */
(function () {
  'use strict';

  var IS_FILE_MODE = window.location.protocol === 'file:';
  var API_BASE = IS_FILE_MODE ? 'http://localhost:3000' : '';
  var LOGIN_PAGE = IS_FILE_MODE ? 'login.html' : '/login.html';
  var DIRECTORY_APPLY_PAGE = IS_FILE_MODE ? 'directory-apply.html' : '/directory-apply.html';
  var CATEGORIES_PAGE = IS_FILE_MODE ? 'categories.html' : '/categories.html';
  var PUBLISH_PAGE = IS_FILE_MODE ? 'publish.html' : '/publish.html';
  var LOCAL_ADMIN_TOKEN_KEY = 'alliance_admin_token';
  var user = null;

  /* ====== 初始化 ====== */
  async function init() {
    await waitForAuthState();
    
    // 调试日志
    console.log('[UserCenter] AuthState:', window.AuthState);
    console.log('[UserCenter] isLoggedIn:', window.AuthState?.isLoggedIn?.());
    console.log('[UserCenter] isAdmin:', window.AuthState?.isAdmin?.());
    console.log('[UserCenter] getUser:', window.AuthState?.getUser?.());

    if (!window.AuthState || !window.AuthState.isLoggedIn()) {
      document.getElementById('loginWall').classList.add('show');
      return;
    }

    user = window.AuthState.getUser();
    fillUserInfo();
    bindMenu();

    // 显示管理员入口（支持 isAdmin() 方法或 user.isAdmin 属性）
    var isAdminUser = (window.AuthState && window.AuthState.isAdmin && window.AuthState.isAdmin()) || 
                      (user && user.isAdmin === true);
    console.log('[UserCenter] isAdmin check:', { method: window.AuthState?.isAdmin?.(), property: user?.isAdmin, result: isAdminUser });
    if (isAdminUser) {
      var adminLink = document.getElementById('adminMenuItem');
      if (adminLink) {
        adminLink.style.display = 'flex';
        console.log('[UserCenter] admin link shown');
      } else {
        console.log('[UserCenter] adminMenuItem element not found!');
      }
    }
    bindLogout();

    // 加载所有数据
    loadApplications();
    loadRegistrations();
    loadDeliveries();
    loadMyPublish();
  }

  /* ====== 填充用户信息 ====== */
  function fillUserInfo() {
    if (!user) return;
    var nick = user.nickname || user.email || '用户';
    var initial = nick.slice(0, 1).toUpperCase();

    setText('topAvatar', initial);
    setText('topName', nick);
    setText('profileAvatar', initial);
    setText('profileName', nick);
    setText('profileEmail', user.email || '');
    setText('profileCreatedAt', user.created_at ? formatDate(user.created_at) : '-');

    // 管理员入口已并列到左侧菜单，不再在“用户信息”里追加跳转按钮
  }

  /* ====== 菜单切换 ====== */
  function bindMenu() {
    document.querySelectorAll('.menu-item').forEach(function (item) {
      if (!item.dataset.panel) return; // 跳过无 panel 的菜单项（如外部链接）
      item.addEventListener('click', function (event) {
        event.preventDefault();
        var panelId = item.dataset.panel;
        // 切换菜单高亮
        document.querySelectorAll('.menu-item').forEach(function (m) { m.classList.remove('active'); });
        item.classList.add('active');
        // 切换面板
        document.querySelectorAll('.panel').forEach(function (p) { p.classList.remove('active'); });
        var target = document.getElementById('panel-' + panelId);
        if (target) target.classList.add('active');
        // 滚动到顶部
        document.querySelector('.content').scrollTop = 0;
      });
    });
  }

  /* ====== 退出登录 ====== */
  function bindLogout() {
    var btn = document.getElementById('userLogoutBtn');
    window.__allianceForceLogout = function () {
      try {
        if (window.AuthState && typeof window.AuthState.clearAuth === 'function') {
          window.AuthState.clearAuth();
        }
      } catch (e) {}
      try {
        localStorage.removeItem('alliance_token');
        localStorage.removeItem('alliance_user');
        localStorage.removeItem(LOCAL_ADMIN_TOKEN_KEY);
      } catch (e) {}
      window.location.replace(LOGIN_PAGE);
    };
    if (btn) btn.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      window.__allianceForceLogout();
    });
  }

  /* ====== 等待 AuthState ====== */
  function waitForAuthState() {
    return new Promise(function (resolve) {
      function check() {
        if (typeof window.AuthState !== 'undefined') resolve();
        else setTimeout(check, 50);
      }
      check();
    });
  }

  /* ====== 通用 fetch ====== */
  async function apiFetch(path) {
    if (IS_FILE_MODE) return null;
    var token = window.AuthState.getToken();
    var res = await fetch(API_BASE + path, {
      headers: { 'Authorization': 'Bearer ' + (token || '') }
    });
    if (res.status === 401) {
      window.AuthState.clearAuth();
      window.location.href = LOGIN_PAGE;
      return null;
    }
    return res.json();
  }

  function readLocalJson(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function getLocalDirectoryApplications() {
    return readLocalJson('alliance_directory_applications', []).map(function (row) {
      return {
        id: row.id,
        targetTitle: row.targetTitle || row.title || '',
        targetMeta: row.targetMeta || row.meta || '',
        applicantName: row.applicantName || '',
        applicantOrg: row.applicantOrg || '',
        cooperationIntent: row.cooperationIntent || '',
        trackingCode: row.trackingCode || '',
        status: row.status || 'pending',
        statusNote: row.statusNote || '',
        createdAt: row.createdAt || new Date().toISOString(),
        statusInfo: {
          label: ({
            pending: '联盟初审中',
            reviewing: '对接评估中',
            matched: '已转交对接',
            contacted: '对接沟通中',
            completed: '对接已完成',
            rejected: '当前暂不匹配'
          })[row.status] || '联盟初审中'
        }
      };
    });
  }

  /* ====== 生态对接申请 ====== */
  async function loadApplications() {
    var el = document.getElementById('applicationsList');
    if (!el) return;
    if (IS_FILE_MODE) {
      var localList = getLocalDirectoryApplications();
      el.innerHTML = localList.length
        ? localList.map(renderRecord).join('')
        : empty('暂无生态对接申请', '<a href="' + DIRECTORY_APPLY_PAGE + '">去提交申请</a>');
      return;
    }
    try {
      var data = await apiFetch('/api/user-center/applications?userId=' + uid());
      if (!data) return;
      var list = data.applications || [];
      el.innerHTML = list.length
        ? list.map(renderRecord).join('')
        : empty('暂无生态对接申请', '<a href="' + DIRECTORY_APPLY_PAGE + '">去提交申请</a>');
    } catch (e) {
      el.innerHTML = empty('加载失败，请刷新重试');
    }
  }

  /* ====== 活动报名 ====== */
  async function loadRegistrations() {
    var el = document.getElementById('registrationsList');
    if (!el) return;
    if (IS_FILE_MODE) {
      el.innerHTML = empty('本地模式下暂无活动报名记录', '<a href="' + CATEGORIES_PAGE + '">查看活动</a>');
      return;
    }
    try {
      var data = await apiFetch('/api/user-center/registrations?userId=' + uid());
      if (!data) return;
      var list = data.registrations || [];
      el.innerHTML = list.length
        ? list.map(renderRecord).join('')
        : empty('暂无活动报名记录', '<a href="' + CATEGORIES_PAGE + '">查看活动</a>');
    } catch (e) {
      el.innerHTML = empty('加载失败，请刷新重试');
    }
  }

  /* ====== 投递记录 ====== */
  async function loadDeliveries() {
    var el = document.getElementById('deliveriesList');
    if (!el) return;
    if (IS_FILE_MODE) {
      el.innerHTML = empty('本地模式下暂无投递记录', '<a href="' + CATEGORIES_PAGE + '">查看机会</a>');
      return;
    }
    try {
      var data = await apiFetch('/api/user-center/deliveries?userId=' + uid());
      if (!data) return;
      var list = data.deliveries || [];
      el.innerHTML = list.length
        ? list.map(renderRecord).join('')
        : empty('暂无投递记录', '<a href="' + CATEGORIES_PAGE + '">查看机会</a>');
    } catch (e) {
      el.innerHTML = empty('加载失败，请刷新重试');
    }
  }

  /* ====== 我的发布 ====== */
  async function loadMyPublish() {
    var el = document.getElementById('myPublishList');
    if (!el) return;
    if (IS_FILE_MODE) {
      el.innerHTML = empty('本地模式下还没有发布过内容', '<a href="' + PUBLISH_PAGE + '">去发布内容</a>');
      return;
    }
    try {
      var [evRes, recRes] = await Promise.all([
        apiFetch('/api/my/events'),
        apiFetch('/api/my/recruits')
      ]);
      var events = (evRes && evRes.items) || [];
      var recruits = (recRes && recRes.items) || [];
      var all = [
        ...events.map(function(i) { return Object.assign({}, i, { _type: '活动' }); }),
        ...recruits.map(function(i) { return Object.assign({}, i, { _type: '实习实践' }); })
      ].sort(function(a, b) { return new Date(b.created_at) - new Date(a.created_at); });

      if (!all.length) {
        el.innerHTML = empty('还没有发布过内容');
        return;
      }
      el.innerHTML = all.map(function (item) {
        var statusClass = item.status === 'approved' ? 'badge-approved'
          : item.status === 'rejected' ? 'badge-rejected' : 'badge-pending';
        var statusLabel = item.status === 'approved' ? '已通过'
          : item.status === 'rejected' ? '已拒绝' : '待审核';
        return '<div class="record-card">' +
          '<div class="record-row">' +
            '<span class="record-name">' + esc(item.title) + '</span>' +
            '<span class="badge ' + statusClass + '">' + statusLabel + '</span>' +
          '</div>' +
          '<div class="record-meta">' + esc(item._type) + ' · ' + formatDate(item.created_at) + '</div>' +
        '</div>';
      }).join('');
    } catch (e) {
      el.innerHTML = empty('加载失败，请刷新重试');
    }
  }

  /* ====== 渲染记录卡片 ====== */
  function renderRecord(r) {
    var statusClass = 'badge-pending';
    if (r.status === 'approved' || r.status === 'confirmed' || r.status === 'accepted') statusClass = 'badge-approved';
    else if (r.status === 'rejected' || r.status === 'cancelled') statusClass = 'badge-rejected';
    var statusLabel = (r.statusInfo && r.statusInfo.label) || r.status || '待处理';
    var title = r.title || r.targetTitle || r.activityTitle || r.opportunityTitle || '未命名';
    var meta = r.applicantOrg || r.cooperationIntent || r.activityTitle || '';
    return '<div class="record-card">' +
      '<div class="record-row">' +
        '<span class="record-name">' + esc(title) + '</span>' +
        '<span class="badge ' + statusClass + '">' + esc(statusLabel) + '</span>' +
      '</div>' +
      (meta ? '<div class="record-meta">' + esc(meta) + '</div>' : '') +
      (r.trackingCode ? '<div class="record-meta">查询编号：' + esc(r.trackingCode) + '</div>' : '') +
      (r.statusNote ? '<div class="record-meta">' + esc(r.statusNote) + '</div>' : '') +
      '<div class="record-meta">' + formatDate(r.createdAt || r.created_at) + '</div>' +
    '</div>';
  }

  /* ====== 工具函数 ====== */
  function uid() { return user ? (user.userId || user.id || '') : ''; }

  function empty(text, extra) {
    return '<div class="empty"><div class="empty-icon">📭</div>' +
      '<div class="empty-text">' + text + (extra ? '<br>' + extra : '') + '</div></div>';
  }

  function setText(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val || '';
  }

  function formatDate(s) {
    if (!s) return '';
    return new Date(s).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }

  function esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* ====== 启动 ====== */
  // 注意：my.html 通过 AllianceBootstrap.loadScripts 动态注入本脚本，
  // 此时 DOMContentLoaded 已经触发，必须用 readyState 兜底，否则 init 永不执行。
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
