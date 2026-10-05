(function () {
  var ICONS = {
    home: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .7-1.5l7-6a2 2 0 0 1 2.6 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    workout: '<path d="M6 7v10"/><path d="M18 7v10"/><path d="M4 9h2"/><path d="M18 9h2"/><path d="M4 15h2"/><path d="M18 15h2"/><path d="M8 12h8"/>',
    progress: '<path d="M4 19V5"/><path d="M4 19h16"/><path d="M8 15l3-3 2 2 5-6"/>',
    run: '<circle cx="14" cy="5" r="1.4"/><path d="M8 21l2.2-5.2 2.2 1.4 1.6-2.2"/><path d="M13.8 15.2l2.4 1.2 1.8-3.4"/><path d="M10.2 15.8l-2.4-1.2"/>',
    history: '<path d="M8 6h12"/><path d="M8 12h12"/><path d="M8 18h12"/><path d="M4 6h.01"/><path d="M4 12h.01"/><path d="M4 18h.01"/>',
    profile: '<circle cx="12" cy="8" r="3"/><path d="M5 19a7 7 0 0 1 14 0"/>'
  };
  var ORDER = ["home", "workout", "progress", "run", "history", "profile"];
  if (!document.getElementById("seg-nav-css")) {
    var s = document.createElement("style");
    s.id = "seg-nav-css";
    s.textContent = [
      "#tabbar.tabbar{position:fixed;left:50%;right:auto;bottom:calc(12px + env(safe-area-inset-bottom));transform:translateX(-50%);width:min(96vw,460px);height:66px;padding:6px 6px;display:flex!important;align-items:center;justify-content:space-between;gap:2px;background:rgba(15,23,42,.94);border:1px solid rgba(255,255,255,.08);border-radius:34px;box-shadow:0 15px 40px rgba(0,0,0,.4);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);z-index:40}",
      "#tabbar .tab{flex:1;height:54px;min-height:54px;display:flex;align-items:center;justify-content:center;gap:5px;color:#64748b;background:transparent;border:0;border-radius:28px;font:800 10px Comfortaa,sans-serif;letter-spacing:.02em;text-transform:uppercase;white-space:nowrap;overflow:hidden;padding:0 4px;box-shadow:none}",
      "#tabbar .tab svg{width:18px;height:18px;flex-shrink:0;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}",
      "#tabbar .tab .nav-label{max-width:0;opacity:0;overflow:hidden}",
      "#tabbar .tab.on,#tabbar .tab.active{flex:1.85;color:#0f172a;background:#fff;box-shadow:0 7px 18px rgba(0,0,0,.3)}",
      "#tabbar .tab.on .nav-label,#tabbar .tab.active .nav-label{max-width:62px;opacity:1}",
      "#tabbar .tab:active{transform:scale(.92)}",
      "#tabbar.hidden{display:none!important}",
      "#runOpenBtn{display:none!important}"
    ].join("");
    document.head.appendChild(s);
  }
  function icon(name) {
    return '<svg viewBox="0 0 24 24">' + (ICONS[name] || ICONS.home) + "</svg>";
  }
  function openRun() {
    var ov = document.getElementById("runOv");
    if (ov) ov.classList.add("on");
    var btn = document.getElementById("runOpenBtn");
    if (btn) btn.click();
  }
  function ensureRun() {
    var bar = document.getElementById("tabbar");
    if (!bar || bar.querySelector('.tab[data-tab="run"]')) return;
    var b = document.createElement("button");
    b.className = "tab";
    b.type = "button";
    b.setAttribute("data-tab", "run");
    b.textContent = "run";
    b.onclick = function () {
      bar.querySelectorAll(".tab").forEach(function (t) { t.classList.remove("on"); });
      b.classList.add("on");
      openRun();
    };
    var hist = bar.querySelector('.tab[data-tab="history"]');
    if (hist) bar.insertBefore(b, hist); else bar.appendChild(b);
  }
  function dress(btn) {
    var key = btn.getAttribute("data-tab") || "home";
    if (!btn.querySelector(".nav-label") || btn.dataset.segkey !== key) {
      btn.dataset.seg = "1";
      btn.dataset.segkey = key;
      btn.innerHTML = icon(key) + '<span class="nav-label">' + key + "</span>";
    }
  }
  function sync() {
    var bar = document.getElementById("tabbar");
    if (!bar) return;
    ensureRun();
    ORDER.forEach(function (name) {
      var btn = bar.querySelector('.tab[data-tab="' + name + '"]');
      if (!btn) return;
      if (btn.parentNode === bar) bar.appendChild(btn);
    });
    bar.querySelectorAll(".tab").forEach(function (b) {
      dress(b);
      b.classList.toggle("active", b.classList.contains("on"));
    });
  }
  sync();
  var bar = document.getElementById("tabbar");
  if (bar && window.MutationObserver) {
    new MutationObserver(sync).observe(bar, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  }
  setInterval(sync, 900);
})();
