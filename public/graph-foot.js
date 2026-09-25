(function () {
  var IG = '<svg viewBox="0 0 24 24" width="22" height="22"><defs><radialGradient id="ig" cx="30%" cy="107%" r="150%"><stop offset="0" stop-color="#fdf497"/><stop offset=".5" stop-color="#fd5949"/><stop offset="1" stop-color="#d6249f"/></radialGradient></defs><rect x="2" y="2" width="20" height="20" rx="6" fill="url(#ig)"/><circle cx="12" cy="12" r="5" fill="none" stroke="#fff" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1.3" fill="#fff"/></svg>';
  var TG = '<svg viewBox="0 0 24 24" width="22" height="22"><circle cx="12" cy="12" r="12" fill="#229ED9"/><path fill="#fff" d="M5.4 11.8l11.7-4.5c.5-.2 1 .1.8.9l-2 9.3c-.1.7-.6.8-1.1.5l-3-2.2-1.5 1.4c-.2.2-.3.3-.6.3l.2-3.1 5.6-5.1c.2-.2 0-.3-.3-.1l-7 4.4-3-.9c-.6-.2-.6-.6.2-.8z"/></svg>';
  var GH = '<svg viewBox="0 0 24 24" width="22" height="22"><circle cx="12" cy="12" r="12" fill="#fff"/><path fill="#181717" d="M12 3.1c-5 0-9 4-9 9 0 4 2.6 7.4 6.2 8.6.5.1.6-.2.6-.4v-1.5c-2.5.5-3-1.2-3-1.2-.4-1-1-1.3-1-1.3-.8-.6.1-.6.1-.6.9.1 1.4 1 1.4 1 .8 1.4 2.2 1 2.7.8.1-.6.3-1 .6-1.2-2-.2-4.1-1-4.1-4.5 0-1 .4-1.8 1-2.4-.1-.2-.4-1.2.1-2.5 0 0 .8-.3 2.5 1a8.7 8.7 0 014.6 0c1.7-1.3 2.5-1 2.5-1 .5 1.3.2 2.3.1 2.5.6.6 1 1.4 1 2.4 0 3.5-2.1 4.3-4.1 4.5.3.3.6.8.6 1.7v2.5c0 .2.2.5.6.4A9 9 0 0021 12.1c0-5-4-9-9-9z"/></svg>';
  function logos() {
    return '<div class="soc"><a href="https://www.instagram.com/harryashu_/" target="_blank" rel="noopener">' + IG + '<span>Instagram</span></a><a href="https://t.me/SANATANI_BACHA" target="_blank" rel="noopener">' + TG + '<span>Telegram</span></a><a href="https://github.com/SIDHIMUSIC" target="_blank" rel="noopener">' + GH + '<span>GitHub</span></a></div>';
  }
  if (!document.getElementById("gf-css")) {
    var s = document.createElement("style");
    s.id = "gf-css";
    s.textContent = ".soc{display:flex;justify-content:center;gap:16px;margin:10px 0;flex-wrap:wrap}.soc a{display:flex;flex-direction:column;align-items:center;gap:4px;color:#cfe8ff;text-decoration:none;font-size:11px;min-width:64px}.wgt-card{margin-top:8px;font-size:13px;color:#ffe4b5}";
    document.head.appendChild(s);
  }
  var foot = document.getElementById("sidhiFoot");
  if (foot) foot.innerHTML = "<b>SIDHI GYM TRACKER</b><div>Built with ❤️ by Harry</div>" + logos() + "<div>© 2026 SIDHI GYM TRACKER. All rights reserved.</div>";
  function shortDate(iso) {
    var p = String(iso || "").split("-");
    return (p[2] || "") + "/" + (p[1] || "");
  }
  function drawReal(canvas, rows) {
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");
    var w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    var pts = (rows || []).filter(function (s) { return s.entryWeight != null && isFinite(Number(s.entryWeight)); }).slice().sort(function (a, b) { return a.date.localeCompare(b.date); }).slice(-10);
    canvas._wpts = pts;
    if (!pts.length) {
      ctx.fillStyle = "#9aa7b8"; ctx.font = "22px Comfortaa,sans-serif";
      ctx.fillText("No weight data yet", 24, h / 2);
      return;
    }
    var ys = pts.map(function (p) { return Number(p.entryWeight); });
    var min = Math.min.apply(null, ys) - 0.4;
    var max = Math.max.apply(null, ys) + 0.4;
    var left = 52, right = 16, top = 28, bot = 36;
    ctx.strokeStyle = "rgba(255,255,255,.08)"; ctx.lineWidth = 1;
    for (var g = 0; g < 4; g++) {
      var gy = top + g * (h - top - bot) / 3;
      ctx.beginPath(); ctx.moveTo(left, gy); ctx.lineTo(w - right, gy); ctx.stroke();
      ctx.fillStyle = "#9aa7b8"; ctx.font = "16px Comfortaa,sans-serif";
      ctx.fillText((max - g * (max - min) / 3).toFixed(1), 6, gy + 5);
    }
    function X(i) { return left + i * ((w - left - right) / Math.max(pts.length - 1, 1)); }
    function Y(v) { return h - bot - ((v - min) / (max - min || 1)) * (h - top - bot); }
    ctx.beginPath();
    pts.forEach(function (p, i) { var x = X(i), y = Y(Number(p.entryWeight)); if (!i) ctx.moveTo(x, y); else ctx.lineTo(x, y); });
    ctx.strokeStyle = "#f0c27a"; ctx.lineWidth = 3; ctx.stroke();
    pts.forEach(function (p, i) {
      var x = X(i), y = Y(Number(p.entryWeight));
      ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#63e2b3"; ctx.fill();
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = "#ffe4b5"; ctx.font = "13px Comfortaa,sans-serif"; ctx.textAlign = "center";
      ctx.fillText(Number(p.entryWeight).toFixed(1), x, y - 10);
      ctx.fillStyle = "#9aa7b8"; ctx.font = "12px Comfortaa,sans-serif";
      ctx.fillText(shortDate(p.date), x, h - 10);
    });
    ctx.textAlign = "left";
  }
  function bind(canvas) {
    if (!canvas || canvas.dataset.real) return;
    canvas.dataset.real = "1";
    function hit(ev) {
      var pts = canvas._wpts || []; if (!pts.length) return;
      var r = canvas.getBoundingClientRect();
      var cx = ((ev.touches ? ev.touches[0].clientX : ev.clientX) - r.left) * (canvas.width / r.width);
      var i = Math.round((cx - 52) / ((canvas.width - 68) / Math.max(pts.length - 1, 1)));
      i = Math.max(0, Math.min(pts.length - 1, i));
      var p = pts[i], prev = i ? pts[i - 1] : null;
      var d = prev ? Math.round((Number(p.entryWeight) - Number(prev.entryWeight)) * 1000) / 1000 : null;
      var box = canvas.parentNode.querySelector(".wgt-card") || document.createElement("div");
      box.className = "wgt-card";
      box.textContent = p.date + " • " + Number(p.entryWeight).toFixed(1) + " kg" + (d != null ? " • " + (d > 0 ? "+" : "") + d + " kg" : "");
      canvas.parentNode.appendChild(box);
    }
    canvas.addEventListener("click", hit);
    canvas.addEventListener("touchstart", hit, { passive: true });
  }
  if (typeof drawChart === "function") {
    drawChart = function (canvas, rows) { drawReal(canvas, rows); bind(canvas); };
    if (typeof sessions !== "undefined") {
      drawReal(document.getElementById("homeChart"), sessions);
      bind(document.getElementById("homeChart"));
      drawReal(document.getElementById("progChart"), sessions);
      bind(document.getElementById("progChart"));
    }
  }
  ["timing-fix.js?v=2", "tabs-fix.js?v=1"].forEach(function (src) {
    if (document.querySelector('script[src*="' + src.split("?")[0] + '"]')) return;
    var t = document.createElement("script");
    t.src = src;
    document.body.appendChild(t);
  });
})();
