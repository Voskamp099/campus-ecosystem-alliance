(function () {
  "use strict";

  var IS_FILE_MODE = window.location.protocol === "file:";

  function getAssetPath(path) {
    var cleanPath = String(path || "").replace(/^\/+/, "");
    return IS_FILE_MODE ? "public/" + cleanPath : "/" + cleanPath;
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
