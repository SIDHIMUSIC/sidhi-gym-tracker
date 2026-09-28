(function () {
  function el(id) { return document.getElementById(id); }
  if (!document.getElementById("persist-css")) {
    var s = document.createElement("style");
    s.id = "persist-css";
    s.textContent = "#runOpenBtn,.head-actions .btn.run,.livebar{display:none!important}#logoutBtn{display:inline-flex!important;position:relative;min-height:36px;padding:8px 12px;font-size:11px}.tabbar .tab,.tabbar .tab:focus,.tabbar .tab:focus-visible{outline:none!important;box-shadow:none!important}button,a,.tab{-webkit-tap-highlight-color:transparent}button:focus,button:focus-visible{outline:none}.ex-sec{margin:14px 0 6px;font:800 13px Syne,sans-serif;letter-spacing:.14em;color:#f0c27a;text-transform:uppercase}";
    document.head.appendChild(s);
  }
  var runHead = el("runOpenBtn");
  if (runHead) runHead.style.display = "none";

  function firstJoinKg() {
    var list = ((typeof sessions !== "undefined" && sessions) || []).slice().sort(function (a, b) { return String(a.date).localeCompare(String(b.date)); });
    for (var i = 0; i < list.length; i++) {
      var n = Number(list[i].entryWeight);
      if (Number.isFinite(n) && n > 0) return Math.round(n * 1000) / 1000;
    }
    return null;
  }
  function placeLogout() {
    var view = el("view-profile");
    if (!view) return;
    var old = el("pfLogout");
    if (old) old.remove();
    var btn = document.createElement("button");
    btn.id = "pfLogout"; btn.type = "button"; btn.className = "btn danger";
    btn.textContent = "logout";
    btn.style.cssText = "position:absolute;top:10px;right:10px;min-height:36px;padding:8px 14px;z-index:3";
    var card = view.querySelector(".glass");
    if (card) { card.style.position = "relative"; card.appendChild(btn); }
    btn.onclick = function () {
      var src = el("logoutBtn");
      if (src) src.click();
    };
    var kvs = view.querySelectorAll(".kv");
    kvs.forEach(function (row) {
      var lab = (row.querySelector("span") || {}).textContent || "";
      if (lab.toLowerCase().indexOf("weight") >= 0) {
        var b = row.querySelector("b");
        var j = firstJoinKg();
        if (b && j != null) b.textContent = j + " kg join";
      }
    });
  }
  var _sp = window.showProfile;
  window.showProfile = function () {
    if (typeof _sp === "function") _sp();
    placeLogout();
  };

  function labelChart(canvas) {
    if (!canvas || !canvas.getContext) return;
    var pts = ((typeof sessions !== "undefined" && sessions) || []).filter(function (s) {
      return s.entryWeight != null && isFinite(Number(s.entryWeight));
    }).slice().sort(function (a, b) { return String(a.date).localeCompare(String(b.date)); }).slice(-10);
    if (!pts.length) return;
    var ctx = canvas.getContext("2d");
    var w = canvas.width, h = canvas.height;
    var ys = pts.map(function (p) { return Number(p.entryWeight); });
    var min = Math.min.apply(null, ys) - 0.4, max = Math.max.apply(null, ys) + 0.4;
    ctx.textAlign = "center";
    pts.forEach(function (p, i) {
      var x = 24 + i * ((w - 50) / Math.max(pts.length - 1, 1));
      var y = h - 20 - ((Number(p.entryWeight) - min) / (max - min || 1)) * (h - 40);
      ctx.fillStyle = "#ffe4b5"; ctx.font = "13px Comfortaa,sans-serif";
      ctx.fillText(Number(p.entryWeight).toFixed(1), x, y - 10);
    });
    ctx.textAlign = "left";
  }
  if (typeof paintHome === "function" && !paintHome._kg) {
    var _ph = paintHome;
    paintHome = function () {
      _ph();
      labelChart(el("homeChart"));
      labelChart(el("progChart"));
    };
    paintHome._kg = true;
  }
  if (typeof drawChart === "function" && !drawChart._kg) {
    var _dc = drawChart;
    drawChart = function (canvas, rows) { _dc(canvas, rows); labelChart(canvas); };
    drawChart._kg = true;
  }

  var TOKEN_KEY = "sidhi-gym-token";
  var USER_KEY = "sidhi-gym-username";
  if (typeof token !== "undefined" && !token && localStorage.getItem(TOKEN_KEY)) {
    token = localStorage.getItem(TOKEN_KEY) || "";
    username = localStorage.getItem(USER_KEY) || username || "";
  }
  if (typeof token !== "undefined" && token && el("app") && el("app").classList.contains("hidden") && typeof afterAuth === "function") {
    afterAuth().catch(function () {});
  }
})();
