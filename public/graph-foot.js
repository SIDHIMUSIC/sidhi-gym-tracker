(function () {
  if (!document.querySelector('link[rel="manifest"]')) {
    var m = document.createElement("link"); m.rel = "manifest"; m.href = "/manifest.json"; document.head.appendChild(m);
    var ic = document.createElement("link"); ic.rel = "apple-touch-icon"; ic.href = "/icon.svg"; document.head.appendChild(ic);
  }
  var foot = document.getElementById("sidhiFoot");
  if (foot && !foot.dataset.done) {
    foot.dataset.done = "1";
    foot.innerHTML = "<b>SIDHI GYM TRACKER</b><div>Built with love by Harry</div><div>© 2026 SIDHI GYM TRACKER</div>";
  }
  ["timing-fix.js?v=6","tabs-fix.js?v=1","split-zone.js?v=2","persist-ui.js?v=3","ex-split.js?v=1","month-ui.js?v=2","extras-pack.js?v=1","icons-ui.js?v=1","polish-flow.js?v=2","upgrade-pack.js?v=1","plan-bind.js?v=1","account-ui.js?v=2","greet-fix.js?v=1","id-ui.js?v=1","daily-plus.js?v=2","login-forgot.js?v=4","polish-glitch.js?v=1","login-clean.js?v=1","admin-ui.js?v=1","left-admin.js?v=3","field-mode.js?v=2","muscle-tag.js?v=2","sched-home.js?v=3","login-otp.js?v=3"].forEach(function (src) {
    var file = src.split("?")[0];
    if (document.querySelector('script[src*="' + file + '"]')) return;
    var t = document.createElement("script"); t.src = src; document.body.appendChild(t);
  });
})();
