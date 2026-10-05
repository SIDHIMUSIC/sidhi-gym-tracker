(function () {
  var ICONS = {
    home: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .7-1.5l7-6a2 2 0 0 1 2.6 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    workout: '<path d="M6 7v10"/><path d="M18 7v10"/><path d="M4 9h2"/><path d="M18 9h2"/><path d="M4 15h2"/><path d="M18 15h2"/><path d="M8 12h8"/>',
    progress: '<path d="M4 19V5"/><path d="M4 19h16"/><path d="M8 15l3-3 2 2 5-6"/>',
    run: '<circle cx="14" cy="5" r="1.4"/><path d="M8 21l2.2-5.2 2.2 1.4 1.6-2.2"/><path d="M13.8 15.2l2.4 1.2 1.8-3.4"/><path d="M10.2 15.8l-2.4-1.2"/>',
    history: '<path d="M8 6h12"/><path d="M8 12h12"/><path d="M8 18h12"/><path d="M4 6h.01"/><path d="M4 12h.01"/><path d="M4 18h.01"/>',
    profile: '<circle cx="12" cy="8" r="3"/><path d="M5 19a7 7 0 0 1 14 0"/>'
  };
  if (!document.getElementById("seg-nav-css")) {
    var s = document.createElement("style");
    s.id = "seg-nav-css";
    s.textContent = "#tabbar.tabbar{position:fixed;left:50%;right:auto;bottom:calc(12px + env(safe-area-inset-bottom));transform:translateX(-50%);width:min(96vw,460px);height:66px;padding:6px;display:flex;align-items:center;gap:2px;background:rgba(15,23,42,.94);border:1px solid rgba(255,255,255,.08);border-radius:34px;z-index:40}#tabbar .tab{flex:1;height:54px;display:flex;align-items:center;justify-content:center;gap:4px;color:#94a3b8;background:transparent;border:0;border-radius:28px;font:800 10px Comfortaa,sans-serif;text-transform:uppercase}#tabbar .tab svg{width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:2}#tabbar .tab .nav-label{display:none}#tabbar .tab.on{flex:1.7;color:#0f172a;background:#fff}#tabbar .tab.on .nav-label{display:inline}";
    document.head.appendChild(s);
  }
  function icon(name) {
    return '<svg viewBox="0 0 24 24">' + (ICONS[name] || ICONS.home) + "</svg>";
  }
  function dress(btn) {
    var key = btn.getAttribute("data-tab") || "home";
    if (btn.dataset.segkey === key && btn.querySelector(".nav-label")) return;
    btn.dataset.segkey = key;
    btn.innerHTML = icon(key) + '<span class="nav-label">' + key + "</span>";
  }
  function once() {
    var bar = document.getElementById("tabbar");
    if (!bar || bar.dataset.navready) return;
    if (!bar.querySelector('.tab[data-tab="run"]')) {
      var b = document.createElement("button");
      b.className = "tab";
      b.type = "button";
      b.setAttribute("data-tab", "run");
      b.onclick = function () {
        var ov = document.getElementById("runOv");
        if (ov) ov.classList.add("on");
      };
      var hist = bar.querySelector('.tab[data-tab="history"]');
      if (hist) bar.insertBefore(b, hist); else bar.appendChild(b);
    }
    bar.querySelectorAll(".tab").forEach(dress);
    bar.dataset.navready = "1";
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", once);
  else once();
  setTimeout(once, 800);
})();
