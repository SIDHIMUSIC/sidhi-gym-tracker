(function () {
  function el(id) { return document.getElementById(id); }
  if (!document.getElementById("month-ui-css")) {
    var st = document.createElement("style");
    st.id = "month-ui-css";
    st.textContent =
      "#tabbar .tab{position:relative;transition:transform .2s ease;outline:none!important;box-shadow:none!important}" +
      "#tabbar .tab.on{transform:translateY(-2px)}" +
      "#tabbar .tab:focus{outline:none!important}" +
      ".cal{display:grid;grid-template-columns:repeat(7,1fr);gap:6px;text-align:center}" +
      ".cal .d{font-size:10px;color:#9aa7b8}" +
      ".cal .c{aspect-ratio:1;border-radius:50%;display:grid;place-items:center;font-size:12px;background:#141820;color:#6b7280}" +
      ".cal .c.done{background:linear-gradient(135deg,#63e2b3,#f0c27a);color:#120d06;font-weight:800}" +
      ".cal .c.today{outline:2px solid #f0c27a}" +
      ".wgt-tip{margin-top:8px;font-size:13px;color:#ffe4b5;text-align:center}" +
      ".hello{display:block;font-size:22px;line-height:1.35;margin:8px 0 0}" +
      ".hello .hn{font-family:Pacifico,cursive;background:linear-gradient(90deg,#ff8bd4,#f0c27a,#63e2b3);-webkit-background-clip:text;background-clip:text;color:transparent}" +
      ".hello .he{font-style:normal;font-size:20px}";
    document.head.appendChild(st);
  }

  function onlyTab(name) {
    document.querySelectorAll("#tabbar .tab").forEach(function (t) {
      t.classList.toggle("on", t.dataset.tab === name);
    });
    var ov = el("runOv");
    if (ov && name !== "run") ov.classList.remove("on");
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest("#tabbar .tab");
    if (!b) return;
    onlyTab(b.dataset.tab || "home");
  }, true);

  function monthRows() {
    var y = calCursor.getFullYear();
    var m = String(calCursor.getMonth() + 1).padStart(2, "0");
    return ((typeof sessions !== "undefined" && sessions) || []).filter(function (s) {
      return String(s.date || "").indexOf(y + "-" + m + "-") === 0;
    });
  }
  function paintCalReal() {
    var box = el("cal"); if (!box) return;
    var y = calCursor.getFullYear(), mo = calCursor.getMonth();
    if (el("calTitle")) el("calTitle").textContent = calCursor.toLocaleString("en-IN", { month: "long", year: "numeric" });
    var first = new Date(y, mo, 1).getDay();
    var days = new Date(y, mo + 1, 0).getDate();
    var map = {};
    monthRows().forEach(function (s) { map[s.date] = s; });
    var today = typeof todayISO === "function" ? todayISO() : "";
    var html = "SMTWTFS".split("").map(function (d) { return '<div class="d">' + d + "</div>"; }).join("");
    for (var i = 0; i < first; i++) html += "<div></div>";
    for (var d = 1; d <= days; d++) {
      var iso = y + "-" + String(mo + 1).padStart(2, "0") + "-" + String(d).padStart(2, "0");
      var row = map[iso];
      var cls = "c";
      if (row && (row.finished || row.entryWeight || row.after1HourNote)) cls += " done";
      if (iso === today) cls += " today";
      html += '<div class="' + cls + '" data-day="' + iso + '">' + d + "</div>";
    }
    box.innerHTML = html;
  }
  function drawMonthGraph(canvas) {
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");
    var w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    var pts = monthRows().filter(function (s) {
      return s.entryWeight != null && isFinite(Number(s.entryWeight));
    }).slice().sort(function (a, b) { return String(a.date).localeCompare(String(b.date)); });
    canvas._mpts = pts;
    if (!pts.length) {
      ctx.fillStyle = "#9aa7b8"; ctx.font = "20px Comfortaa,sans-serif";
      ctx.fillText("Is month ka weight nahi", 24, h / 2);
      return;
    }
    var ys = pts.map(function (p) { return Number(p.entryWeight); });
    var min = Math.min.apply(null, ys) - 0.4, max = Math.max.apply(null, ys) + 0.4;
    var left = 28, bot = 36, top = 28, right = 16;
    function X(i) { return left + i * ((w - left - right) / Math.max(pts.length - 1, 1)); }
    function Y(v) { return h - bot - ((v - min) / (max - min || 1)) * (h - top - bot); }
    ctx.beginPath();
    pts.forEach(function (p, i) {
      var x = X(i), y = Y(Number(p.entryWeight));
      if (!i) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = "#f0c27a"; ctx.lineWidth = 3; ctx.stroke();
    ctx.textAlign = "center";
    pts.forEach(function (p, i) {
      var x = X(i), y = Y(Number(p.entryWeight));
      ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#63e2b3"; ctx.fill();
      ctx.fillStyle = "#ffe4b5"; ctx.font = "13px Comfortaa,sans-serif";
      ctx.fillText(Number(p.entryWeight).toFixed(1), x, y - 10);
      ctx.fillStyle = "#9aa7b8"; ctx.font = "11px Comfortaa,sans-serif";
      ctx.fillText(String(p.date).slice(8), x, h - 10);
    });
    ctx.textAlign = "left";
  }
  function bindTip(canvas) {
    if (!canvas || canvas._tipOn) return;
    canvas._tipOn = true;
    canvas.addEventListener("click", function (ev) {
      var pts = canvas._mpts || []; if (!pts.length) return;
      var r = canvas.getBoundingClientRect();
      var cx = (ev.clientX - r.left) * (canvas.width / r.width);
      var i = Math.max(0, Math.min(pts.length - 1, Math.round((cx - 28) / ((canvas.width - 44) / Math.max(pts.length - 1, 1)))));
      var p = pts[i];
      var tip = canvas.parentNode.querySelector(".wgt-tip") || document.createElement("div");
      tip.className = "wgt-tip";
      tip.textContent = p.date + "  •  " + Number(p.entryWeight).toFixed(1) + " kg";
      canvas.parentNode.appendChild(tip);
    });
  }
  function paintMonth() {
    paintCalReal();
    drawMonthGraph(el("progChart"));
    bindTip(el("progChart"));
  }
  if (typeof paintCal === "function") paintCal = paintMonth;
  if (typeof showTab === "function" && !showTab._month) {
    var _st = showTab;
    showTab = function (name) {
      onlyTab(name === "run" ? "run" : name);
      _st(name);
      if (name === "progress") paintMonth();
    };
    showTab._month = true;
  }
  if (el("calPrev")) el("calPrev").onclick = function () { calCursor.setMonth(calCursor.getMonth() - 1); paintMonth(); };
  if (el("calNext")) el("calNext").onclick = function () { calCursor.setMonth(calCursor.getMonth() + 1); paintMonth(); };

  function toMin(t) {
    if (!t) return null;
    var p = String(t).split(":");
    var h = Number(p[0]), m = Number(p[1] || 0);
    if (!Number.isFinite(h)) return null;
    return h * 60 + m;
  }
  function gymDuration(row) {
    if (!row) return "—";
    var tm = (Number(row.beforeTreadmillMins) || 0) + (Number(row.afterTreadmillMins) || 0);
    var a = toMin(row.after1HourTime);
    var b = toMin(row.exitTime || row.afterTreadmillTime);
    var e = toMin(row.entryTime);
    function span(x, y) {
      if (x == null || y == null) return null;
      var d = y - x;
      if (d < 0) d += 24 * 60;
      if (d <= 0 || d > 4 * 60) return null;
      return d;
    }
    var s = span(a, b);
    if (s == null && e != null && e >= 12 * 60) s = span(e, b);
    if (s != null) {
      var hh = Math.floor(s / 60), mm = s % 60;
      return hh ? (hh + "h " + mm + "m") : (mm + " min");
    }
    if (tm) return tm + " min";
    return "—";
  }
  if (typeof durationText === "function") durationText = gymDuration;

  function greetNice() {
    var h = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" }).format(new Date()));
    var n = (window.__displayName || (typeof username !== "undefined" ? username : "") || "Ashutosh").trim().split(/\s+/)[0];
    var w = "Good Evening", e = "🌆";
    if (h >= 4 && h < 12) { w = "Good Morning"; e = "☀️"; }
    else if (h >= 12 && h < 17) { w = "Good Afternoon"; e = "⛅"; }
    else if (h >= 17 && h < 21) { w = "Good Evening"; e = "🌆"; }
    else { w = "Good Night"; e = "🌙"; }
    return '<span class="hn">' + w + ", " + n + '</span> <span class="he">' + e + "</span>";
  }
  function applyGreet() {
    var h = el("hello");
    if (h) h.innerHTML = greetNice();
    var dur = el("homeDur");
    var row = typeof todayRow === "function" ? todayRow() : null;
    if (dur) dur.textContent = gymDuration(row);
  }
  if (typeof paintHome === "function") {
    var _ph = paintHome;
    paintHome = function () { _ph(); applyGreet(); };
  }
  applyGreet();
  paintMonth();
})();
