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
    s.textContent = [
      "#tabbar.tabbar{position:fixed;left:50%;right:auto;bottom:calc(12px + env(safe-area-inset-bottom));transform:translateX(-50%);width:min(94vw,440px);height:66px;padding:6px 8px;display:flex!important;align-items:center;justify-content:space-between;gap:2px;background:rgba(15,23,42,.94);border:1px solid rgba(255,255,255,.08);border-radius:34px;box-shadow:0 15px 40px rgba(0,0,0,.4);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px;);z-index:40}",
      "#tabbar .tab{flex:1;height:54px;min-height:54px;display:flex;align-items:center;justify-content:center;gap:6px;color:#64748b;background:transparent;border:0;border-radius:28px;font:800 10px Comfortaa,sans-serif;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap;overflow:hidden;padding:0 6px;box-shadow:none;transition:background .35s cubic-bezier(.34,1.56,.64,1),color .3s ease,flex .35s cubic-bezier(.34,1.56,.64,1),transform .2s ease}",
      "#tabbar .tab svg{width:20px;height:20px;flex-shrink:0;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}",
      "#tabbar .tab .nav-label{max-width:0;opacity:0;overflow:hidden;transform:translateX(-6px);transition:max-width .35s cubic-bezier(.34,1.56,.64,1),opacity .25s,transform .35s}",
      "#tabbar .tab.on,#tabbar .tab.active{flex:1.7;color:#0f172a;background:#fff;box-shadow:0 7px 18px rgba(0,0,0,.3)}",
      "#tabbar .tab.on .nav-label,#tabbar .tab.active .nav-label{max-width:64px;opacity:1;transform:none}",
      "#tabbar .tab:active{transform:scale(.92)}",
      "#tabbar.hidden{display:none!important}"
    ].join("");
    document.head.appendChild(s);
  }
  function icon(name) {
    return '<svg viewBox="0 0 24 24">' + (ICONS[name] || ICONS.home) + "</svg>";
  }
  function dress(btn) {
    if (!btn || btn.dataset.seg) return;
    var key = btn.getAttribute("data-tab") || (btn.textContent || "").trim().toLowerCase();
    if (key.indexOf("run") >= 0) key = "run";
    if (key.indexOf("profile") >= 0) key = "profile";
    var label = (btn.getAttribute("data-tab") || btn.textContent || "tab").replace(/\s+/g, " ").trim();
    label = label.charAt(0).toUpperCase() + label.slice(1);
    btn.dataset.seg = "1";
    btn.innerHTML = icon(key) + '<span class="nav-label">' + label + "</span>";
  }
  function sync() {
    var bar = document.getElementById("tabbar");
    if (!bar) return;
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
  setInterval(sync, 700);
})();
