(function () {
  function el(id) { return document.getElementById(id); }
  var TOKEN_KEY = "sidhi-gym-token";
  var USER_KEY = "sidhi-gym-username";
  var CACHE = "sidhi-gym-sessions";

  if (!document.getElementById("persist-css")) {
    var s = document.createElement("style");
    s.id = "persist-css";
    s.textContent = "#runOpenBtn,.head-actions .btn.run,.livebar{display:none!important}#logoutBtn{display:inline-flex!important;min-height:36px;padding:8px 12px;font-size:11px}.tabbar .tab:focus{outline:none!important}button{-webkit-tap-highlight-color:transparent}.ex-sec{margin:14px 0 6px;font:800 13px Syne,sans-serif;letter-spacing:.14em;color:#f0c27a;text-transform:uppercase}";
    document.head.appendChild(s);
  }
  var runHead = el("runOpenBtn");
  if (runHead) runHead.style.display = "none";

  if (typeof token !== "undefined" && !token) {
    token = localStorage.getItem(TOKEN_KEY) || "";
    username = localStorage.getItem(USER_KEY) || username || "";
  }
  try {
    var cached = JSON.parse(localStorage.getItem(CACHE) || "[]");
    if (cached && cached.length && typeof sessions !== "undefined" && (!sessions || !sessions.length)) {
      sessions = cached;
    }
  } catch (e) {}

  function stayIn() {
    if (!token) return;
    var g = el("gate"), a = el("app"), tb = el("tabbar");
    if (g) g.classList.add("hidden");
    if (a) a.classList.remove("hidden");
    if (tb) tb.classList.remove("hidden");
  }
  stayIn();
  if (token && typeof paintHome === "function") {
    try { paintHome(); } catch (e) {}
  }

  if (typeof afterAuth === "function" && !afterAuth._stay) {
    var _aa = afterAuth;
    afterAuth = async function () {
      stayIn();
      try {
        await _aa();
        try { localStorage.setItem(CACHE, JSON.stringify(sessions || [])); } catch (e) {}
        stayIn();
      } catch (err) {
        stayIn();
        if (typeof toast === "function") toast("Server late, cache se khula");
      }
    };
    afterAuth._stay = true;
  }

  if (token && typeof afterAuth === "function") {
    afterAuth().catch(function () { stayIn(); });
  }

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
    view.querySelectorAll(".kv").forEach(function (row) {
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
})();
