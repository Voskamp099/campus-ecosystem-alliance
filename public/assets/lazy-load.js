/**
 * 图片懒加载工具
 * - 自动检测 IntersectionObserver 支持
 * - 平滑加载动画
 * - 错误处理
 */

class LazyLoader {
  constructor(options = {}) {
    this.options = {
      root: null,
      rootMargin: '50px',
      threshold: 0.01,
      loadingClass: 'lazy-loading',
      loadedClass: 'lazy-loaded',
      errorClass: 'lazy-error',
      ...options
    };
    
    this.observer = null;
    this.init();
  }
  
  init() {
    // 检查浏览器支持
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadImage(entry.target);
          }
        });
      }, {
        root: this.options.root,
        rootMargin: this.options.rootMargin,
        threshold: this.options.threshold
      });
    }
  }
  
  observe(elements) {
    if (!elements) return;
    
    // 支持选择器字符串
    if (typeof elements === 'string') {
      elements = document.querySelectorAll(elements);
    }
    
    // 转换为数组
    const elementsArray = elements instanceof NodeList 
      ? Array.from(elements) 
      : Array.isArray(elements) ? elements : [elements];
    
    elementsArray.forEach(element => {
      if (this.observer) {
        // 使用 IntersectionObserver
        this.observer.observe(element);
      } else {
        // 降级方案：立即加载
        this.loadImage(element);
      }
    });
  }
  
  loadImage(element) {
    const src = element.dataset.src || element.dataset.lazy;
    const srcset = element.dataset.srcset;
    
    if (!src) return;
    
    // 添加加载状态
    element.classList.add(this.options.loadingClass);
    
    // 创建图片对象预加载
    const img = new Image();
    
    img.onload = () => {
      // 应用图片
      if (element.tagName === 'IMG') {
        element.src = src;
        if (srcset) element.srcset = srcset;
      } else {
        element.style.backgroundImage = `url(${src})`;
      }
      
      // 更新状态
      element.classList.remove(this.options.loadingClass);
      element.classList.add(this.options.loadedClass);
      
      // 触发自定义事件
      element.dispatchEvent(new CustomEvent('lazyloaded', { 
        detail: { src, srcset } 
      }));
      
      // 停止观察
      if (this.observer) {
        this.observer.unobserve(element);
      }
    };
    
    img.onerror = () => {
      element.classList.remove(this.options.loadingClass);
      element.classList.add(this.options.errorClass);
      
      // 触发错误事件
      element.dispatchEvent(new CustomEvent('lazyerror', { 
        detail: { src } 
      }));
      
      // 停止观察
      if (this.observer) {
        this.observer.unobserve(element);
      }
    };
    
    img.src = src;
    if (srcset) img.srcset = srcset;
  }
  
  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// 创建全局实例
const lazyLoader = new LazyLoader();

// 自动初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    lazyLoader.observe('img[data-src], img[data-lazy], [data-background]');
  });
} else {
  lazyLoader.observe('img[data-src], img[data-lazy], [data-background]');
}

// 导出
if (typeof window !== 'undefined') {
  window.LazyLoader = LazyLoader;
  window.lazyLoader = lazyLoader;
}

// 兼容 CommonJS / 非模块化加载，避免经典 script 标签下 export 抛 SyntaxError
if (typeof module !== "undefined" && module.exports) {
  module.exports = LazyLoader;
}
