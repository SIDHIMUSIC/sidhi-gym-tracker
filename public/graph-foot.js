(function () {
  if (!document.querySelector('link[rel="manifest"]')) {
    var m = document.createElement("link"); m.rel = "manifest"; m.href = "/manifest.json"; document.head.appendChild(m);
  }
  ["login-forgot.js?v=7","login-otp.js?v=4"].forEach(function (src) {
    var file = src.split("?")[0];
    if (document.querySelector('script[src*="' + file + '"]')) return;
    var t = document.createElement("script"); t.src = src; document.body.appendChild(t);
  });
})();
