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
