(function () {
  "use strict";

  var IS_FILE_MODE = window.location.protocol === "file:";

  function getAssetPath(path) {
    var cleanPath = String(path || "").replace(/^\/+/, "");
    // file:// 模式下 HTML 本身就位于 public/ 目录，相对路径直接以 assets/ 开头即可；
    // 之前拼接成 public/assets/... 会导致浏览器解析为 public/public/assets/... 而 404。
    return IS_FILE_MODE ? cleanPath : "/" + cleanPath;
  }

  function appendHeadLink(options) {
    var link = document.createElement("link");
    link.rel = options.rel;
    if (options.type) link.type = options.type;
    if (options.sizes) link.sizes = options.sizes;
    link.href = getAssetPath(options.href);
    document.head.appendChild(link);
    return link;
  }

  function initHead() {
    // Google Fonts 通过 <link> 加载（而非 CSS @import），避免被 CSP 拦截
    if (!document.querySelector('link[data-alliance-fonts="true"]')) {
      var preconnect1 = document.createElement("link");
      preconnect1.rel = "preconnect";
      preconnect1.href = "https://fonts.googleapis.com";
      preconnect1.setAttribute("data-alliance-fonts", "true");
      document.head.appendChild(preconnect1);

      var preconnect2 = document.createElement("link");
      preconnect2.rel = "preconnect";
      preconnect2.href = "https://fonts.gstatic.com";
      preconnect2.crossOrigin = "";
      document.head.appendChild(preconnect2);

      var fontLink = document.createElement("link");
      fontLink.rel = "stylesheet";
      fontLink.href = "https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700;800&family=Noto+Serif+SC:wght@600;700;900&display=swap";
      document.head.appendChild(fontLink);
    }

    if (!document.querySelector('link[data-alliance-style="true"]')) {
      var stylesheet = document.createElement("link");
      stylesheet.rel = "stylesheet";
      stylesheet.href = getAssetPath("assets/styles.css");
      stylesheet.setAttribute("data-alliance-style", "true");
      document.head.appendChild(stylesheet);
    }

    // 视觉打磨层：只有页面用 <meta name="alliance-polish" content="1"> 声明时才加载。
    // 必须排在 styles.css 之后——styles.css 是运行时注入的，
    // 如果打磨层先于它出现在文档顺序里，同优先级时 styles.css 会反过来覆盖打磨层。
    var polishMeta = document.querySelector('meta[name="alliance-polish"]');
    if (polishMeta && polishMeta.getAttribute("content") === "1"
        && !document.querySelector('link[data-alliance-polish="true"]')) {
      var polishLink = document.createElement("link");
      polishLink.rel = "stylesheet";
      polishLink.href = getAssetPath("assets/polish.css") + "?v=202610221545";
      polishLink.setAttribute("data-alliance-polish", "true");
      document.head.appendChild(polishLink);
    }

    if (!document.querySelector('link[data-alliance-favicon="true"]')) {
      [
        { rel: "icon", type: "image/svg+xml", href: "favicon.svg" },
        { rel: "icon", type: "image/png", sizes: "32x32", href: "favicon-32.png" },
        { rel: "icon", type: "image/png", sizes: "16x16", href: "favicon-16.png" },
        { rel: "apple-touch-icon", href: "apple-touch-icon.png" }
      ].forEach(function (item) {
        var link = appendHeadLink(item);
        link.setAttribute("data-alliance-favicon", "true");
      });
    }
  }

  function loadScript(path) {
    return new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = getAssetPath(path);
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  function loadScripts(paths) {
    var queue = Array.isArray(paths) ? paths.slice() : [];
    return queue.reduce(function (promise, path) {
      return promise.then(function () {
        return loadScript(path);
      });
    }, Promise.resolve());
  }

  window.AllianceBootstrap = {
    isFileMode: IS_FILE_MODE,
    getAssetPath: getAssetPath,
    initHead: initHead,
    loadScript: loadScript,
    loadScripts: loadScripts
  };
})();
