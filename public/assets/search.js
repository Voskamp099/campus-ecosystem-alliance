/**
 * search.js — 全局搜索功能（增强版）
 * 功能：搜索历史、热门搜索、搜索结果优化、搜索建议
 */
(function () {
  'use strict';

  // ============ 配置常量 ============
  var API_BASE = window.location.protocol === 'file:' ? 'http://localhost:3000' : '';
  var HISTORY_KEY = 'alliance_search_history';
  var MAX_HISTORY = 10;
  var HOT_KEYWORDS = ['北京', '实习', '活动', '创业', 'AI'];
  var DEBOUNCE_DELAY = 300;

  // ============ DOM 元素 ============
  var overlay = document.getElementById('searchOverlay');
  var input = document.getElementById('searchInput');
  var results = document.getElementById('searchResults');
  var searchBtn = document.getElementById('navSearchBtn');
  var debounceTimer = null;

  // ============ 类型配置 ============
  var TYPE_CONFIG = {
    partners:  { label: '合作伙伴', icon: '🤝', emoji: 'partners' },
    directory: { label: '生态名录', icon: '🌐', emoji: 'directory' },
    events:    { label: '近期活动', icon: '📅', emoji: 'events' },
    recruits:  { label: '实习实践', icon: '💼', emoji: 'recruits' }
  };

  // ============ 搜索历史管理 ============
  /**
   * 获取搜索历史
   * @returns {Array} 搜索历史数组
   */
  function getSearchHistory() {
    try {
      var saved = localStorage.getItem(HISTORY_KEY);
      if (saved) {
        var parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (e) {
      console.warn('读取搜索历史失败:', e);
    }
    return [];
  }

  /**
   * 保存搜索历史
   * @param {Array} history - 搜索历史数组
   */
  function saveSearchHistory(history) {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
    } catch (e) {
      console.warn('保存搜索历史失败:', e);
    }
  }

  /**
   * 添加搜索关键词到历史
   * @param {string} keyword - 搜索关键词
   */
  function addToHistory(keyword) {
    if (!keyword || !keyword.trim()) return;
    keyword = keyword.trim();

    var history = getSearchHistory();
    // 移除已存在的相同关键词
    history = history.filter(function(item) {
      return item !== keyword;
    });
    // 添加到开头
    history.unshift(keyword);
    // 限制数量
    history = history.slice(0, MAX_HISTORY);

    saveSearchHistory(history);
  }

  /**
   * 清除所有搜索历史
   */
  function clearHistory() {
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch (e) {
      console.warn('清除搜索历史失败:', e);
    }
  }

  // ============ 搜索建议数据 ============
  /**
   * 获取所有可用于建议的标题
   * @returns {Array} 标题数组
   */
  function getSuggestionData() {
    var suggestions = [];

    // 从 site.js 的全局状态获取数据（如果可用）
    if (window.state && window.state.content) {
      var content = window.state.content;

      // 合作伙伴
      if (content.partners) {
        Object.keys(content.partners).forEach(function(type) {
          (content.partners[type] || []).forEach(function(item) {
            if (item.name) suggestions.push(item.name);
          });
        });
      }

      // 生态名录
      if (content.directory) {
        Object.keys(content.directory).forEach(function(type) {
          (content.directory[type] || []).forEach(function(item) {
            if (item.title) suggestions.push(item.title);
          });
        });
      }

      // 实习实践
      (content.recruit || []).forEach(function(item) {
        if (item.title) suggestions.push(item.title);
      });

      // 活动
      (content.events || []).forEach(function(item) {
        if (item.title) suggestions.push(item.title);
      });
    }

    // 去重
    return suggestions.filter(function(item, index, arr) {
      return arr.indexOf(item) === index;
    });
  }

  /**
   * 根据输入获取匹配的建议
   * @param {string} query - 输入内容
   * @returns {Array} 匹配的建议
   */
  function getSuggestions(query) {
    if (!query || query.length < 1) return [];

    var allSuggestions = getSuggestionData();
    var lowerQuery = query.toLowerCase();

    return allSuggestions.filter(function(item) {
      return item.toLowerCase().indexOf(lowerQuery) !== -1;
    }).slice(0, 5); // 最多返回5条建议
  }

  // ============ UI 渲染 ============
  /**
   * HTML 转义
   * @param {string} s - 原始字符串
   * @returns {string} 转义后的字符串
   */
  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s || '';
    return d.innerHTML;
  }

  /**
   * 高亮关键词
   * @param {string} text - 原始文本
   * @param {string} keyword - 关键词
   * @returns {string} 高亮后的HTML
   */
  function highlight(text, keyword) {
    if (!keyword) return esc(text);
    var escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    var regex = new RegExp('(' + escaped + ')', 'gi');
    return esc(text).replace(regex, '<mark>$1</mark>');
  }

  /**
   * 渲染搜索历史标签
   * @returns {string} HTML字符串
   */
  function renderHistoryTags() {
    var history = getSearchHistory();
    if (history.length === 0) return '';

    var html = '<div class="search-section">';
    html += '<div class="search-section-header">';
    html += '<span class="search-section-title">搜索历史</span>';
    html += '<button class="search-clear-history" type="button">清除历史</button>';
    html += '</div>';
    html += '<div class="search-tags">';
    history.forEach(function(item) {
      html += '<button class="search-tag history-tag" data-keyword="' + esc(item) + '" type="button">';
      html += '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">';
      html += '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>';
      html += '</svg>';
      html += esc(item) + '</button>';
    });
    html += '</div></div>';

    return html;
  }

  /**
   * 渲染热门搜索标签
   * @returns {string} HTML字符串
   */
  function renderHotTags() {
    var html = '<div class="search-section">';
    html += '<div class="search-section-header">';
    html += '<span class="search-section-title">热门搜索</span>';
    html += '</div>';
    html += '<div class="search-tags">';
    HOT_KEYWORDS.forEach(function(item) {
      html += '<button class="search-tag hot-tag" data-keyword="' + esc(item) + '" type="button">';
      html += '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">';
      html += '<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>';
      html += '</svg>';
      html += esc(item) + '</button>';
    });
    html += '</div></div>';

    return html;
  }

  /**
   * 渲染搜索建议
   * @param {Array} suggestions - 建议数组
   * @param {string} query - 当前输入
   * @returns {string} HTML字符串
   */
  function renderSuggestions(suggestions, query) {
    if (suggestions.length === 0) return '';

    var html = '<div class="search-suggestions">';
    html += '<div class="search-suggestions-title">搜索建议</div>';
    suggestions.forEach(function(item) {
      html += '<button class="search-suggestion-item" data-keyword="' + esc(item) + '" type="button">';
      html += '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">';
      html += '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>';
      html += '</svg>';
      html += '<span>' + highlight(item, query) + '</span>';
      html += '</button>';
    });
    html += '</div>';

    return html;
  }

  /**
   * 渲染加载动画
   * @returns {string} HTML字符串
   */
  function renderLoading() {
    return '<div class="search-loading-wrapper">' +
      '<div class="search-loading-spinner"></div>' +
      '<div class="search-loading-text">搜索中...</div>' +
      '</div>';
  }

  /**
   * 渲染搜索结果
   * @param {Object} data - 搜索结果数据
   */
  function renderResults(data) {
    var groups = [
      { key: 'partners', items: data.results.partners || [] },
      { key: 'directory', items: data.results.directory || [] },
      { key: 'events', items: data.results.events || [] },
      { key: 'recruits', items: data.results.recruits || [] }
    ];

    var total = data.total || 0;

    // 显示搜索结果数量
    var html = '<div class="search-result-count">找到 <strong>' + total + '</strong> 个相关结果</div>';

    if (total === 0) {
      // 空结果时显示友好提示 + 推荐搜索
      html += '<div class="search-no-results-wrapper">';
      html += '<div class="search-no-results-icon">🔍</div>';
      html += '<div class="search-no-results-title">未找到 "' + esc(data.q) + '" 相关结果</div>';
      html += '<div class="search-no-results-desc">换个关键词试试，或者查看以下推荐</div>';
      html += '<div class="search-no-results-suggestions">';
      html += '<div class="search-section-title" style="margin-bottom:12px;">推荐搜索</div>';
      html += '<div class="search-tags">';
      HOT_KEYWORDS.forEach(function(item) {
        html += '<button class="search-tag hot-tag" data-keyword="' + esc(item) + '" type="button">' + esc(item) + '</button>';
      });
      html += '</div></div></div>';
      results.innerHTML = html;
      return;
    }

    html += '<div class="search-results-list">';
    groups.forEach(function (group) {
      if (group.items.length === 0) return;
      var cfg = TYPE_CONFIG[group.key];
      html += '<div class="search-group-title">' + cfg.label + ' (' + group.items.length + ')</div>';
      group.items.forEach(function (item) {
        html += '<a class="search-item" href="' + (item.url || '#') + '">';
        html += '<div class="search-item-icon ' + cfg.emoji + '">' + cfg.icon + '</div>';
        html += '<div class="search-item-body">';
        html += '<div class="search-item-title">' + highlight(item.title, data.q) + '</div>';
        if (item.desc) {
          html += '<div class="search-item-desc">' + highlight(item.desc, data.q) + '</div>';
        }
        html += '</div>';
        html += '<span class="search-item-type">' + cfg.label + '</span>';
        html += '</a>';
      });
    });
    html += '</div>';

    results.innerHTML = html;
  }

  /**
   * 渲染初始状态（历史和热门搜索）
   */
  function renderInitialState() {
    var html = '';

    // 搜索历史
    html += renderHistoryTags();

    // 热门搜索
    html += renderHotTags();

    results.innerHTML = html || '<div class="search-empty">输入关键词开始搜索</div>';

    // 绑定标签点击事件
    bindTagEvents();
  }

  // ============ 事件绑定 ============
  /**
   * 绑定标签点击事件
   */
  function bindTagEvents() {
    // 历史标签和热门标签
    results.querySelectorAll('.search-tag').forEach(function(tag) {
      tag.addEventListener('click', function() {
        var keyword = this.dataset.keyword;
        if (keyword) {
          input.value = keyword;
          doSearch(keyword);
        }
      });
    });

    // 清除历史按钮
    var clearBtn = results.querySelector('.search-clear-history');
    if (clearBtn) {
      clearBtn.addEventListener('click', function() {
        clearHistory();
        renderInitialState();
      });
    }

    // 搜索建议项
    results.querySelectorAll('.search-suggestion-item').forEach(function(item) {
      item.addEventListener('click', function() {
        var keyword = this.dataset.keyword;
        if (keyword) {
          input.value = keyword;
          doSearch(keyword);
        }
      });
    });
  }

  // ============ 搜索逻辑 ============
  /**
   * 执行搜索
   * @param {string} keyword - 搜索关键词
   */
  function doSearch(keyword) {
    keyword = (keyword || '').trim();
    if (!keyword) {
      renderInitialState();
      return;
    }

    // 添加到搜索历史
    addToHistory(keyword);

    // 显示加载动画
    results.innerHTML = renderLoading();

    fetch(API_BASE + '/api/public/search?q=' + encodeURIComponent(keyword) + '&type=all')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        data.q = keyword;
        renderResults(data);
        bindTagEvents(); // 重新绑定推荐搜索标签事件
      })
      .catch(function () {
        results.innerHTML = '<div class="search-no-results-wrapper">' +
          '<div class="search-no-results-icon">⚠️</div>' +
          '<div class="search-no-results-title">搜索失败</div>' +
          '<div class="search-no-results-desc">请检查网络连接后重试</div>' +
          '</div>';
      });
  }

  /**
   * 防抖搜索
   */
  function debounceSearch() {
    clearTimeout(debounceTimer);
    var keyword = input.value.trim();

    // 如果有输入，显示建议
    if (keyword) {
      var suggestions = getSuggestions(keyword);
      if (suggestions.length > 0) {
        results.innerHTML = renderSuggestions(suggestions, keyword);
        bindTagEvents();
      } else {
        debounceTimer = setTimeout(function () {
          doSearch(input.value);
        }, DEBOUNCE_DELAY);
      }
    } else {
      renderInitialState();
    }
  }

  // ============ 弹窗控制 ============
  /**
   * 打开搜索弹窗
   */
  function openSearch() {
    overlay.classList.add('open');
    input.value = '';
    input.focus();
    renderInitialState();
    document.body.style.overflow = 'hidden';
  }

  /**
   * 关闭搜索弹窗
   */
  function closeSearch() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  // ============ 初始化事件绑定 ============
  if (searchBtn) {
    searchBtn.addEventListener('click', openSearch);
  }

  if (overlay) {
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeSearch();
    });
  }

  if (input) {
    // 输入事件 - 防抖搜索
    input.addEventListener('input', debounceSearch);

    // 键盘事件
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeSearch();
      }
      if (e.key === 'Enter') {
        clearTimeout(debounceTimer);
        doSearch(input.value);
      }
    });
  }

  // 全局快捷键 Ctrl+K / Cmd+K
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      if (overlay.classList.contains('open')) {
        closeSearch();
      } else {
        openSearch();
      }
    }
    if (e.key === 'Escape' && overlay.classList.contains('open')) {
      closeSearch();
    }
  });

  // ============ 暴露全局API（供其他脚本调用） ============
  window.SearchEnhancement = {
    open: openSearch,
    close: closeSearch,
    search: doSearch,
    getHistory: getSearchHistory,
    clearHistory: clearHistory
  };
})();
