(function () {
  function el(id) { return document.getElementById(id); }
  if (!document.getElementById("extras-css")) {
    var s = document.createElement("style");
    s.id = "extras-css";
    s.textContent =
      ".fire{animation:flicker .5s ease-in-out infinite alternate}" +
      "@keyframes flicker{from{transform:scale(1)}to{transform:scale(1.18)}}" +
      ".week-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:8px}" +
      ".week-grid b{display:block;font-size:18px;color:#f0c27a}" +
      ".week-grid span{font-size:11px;color:#9aa7b8}" +
      "#confettiFx{position:fixed;inset:0;z-index:80;pointer-events:none}" +
      ".pwa-bar{margin:10px 0 0;display:flex;gap:8px;flex-wrap:wrap}" +
      ".pwa-bar .btn{min-height:42px;font-size:12px}";
    document.head.appendChild(s);
  }

  function isoDaysAgo(n) {
    var d = new Date((typeof todayISO === "function" ? todayISO() : new Date().toISOString().slice(0, 10)) + "T12:00:00");
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
  }
  function weekRows() {
    var from = isoDaysAgo(6);
    return ((typeof sessions !== "undefined" && sessions) || []).filter(function (s) { return s.date >= from; });
  }
  function runBits(row) {
    var km = 0, min = 0, kcal = 0;
    if (!row) return { km: 0, min: 0, kcal: 0 };
    (row.runs || []).forEach(function (r) {
      km += Number(r.distanceKm || r.km || 0);
      min += Number(r.mins || r.durationMin || 0);
      kcal += Number(r.kcal || 0);
    });
    km += Number(row.beforeTreadmillKm || 0);
    min += Number(row.beforeTreadmillMins || 0);
    return { km: Math.round(km * 1000) / 1000, min: Math.round(min), kcal: Math.round(kcal) };
  }
  function gymDur(row) {
    if (typeof durationText === "function") {
      var t = durationText(row);
      if (t && t !== "—") return t;
    }
    var m = (Number(row && row.afterTreadmillMins) || 0);
    return m ? m + " min" : "—";
  }

  function confetti() {
    var c = el("confettiFx");
    if (!c) {
      c = document.createElement("canvas");
      c.id = "confettiFx";
      document.body.appendChild(c);
    }
    c.width = innerWidth; c.height = innerHeight;
    var ctx = c.getContext("2d");
    var cols = ["#ff8bd4", "#f0c27a", "#63e2b3", "#7ab8ff", "#fff"];
    var bits = [];
    for (var i = 0; i < 90; i++) {
      bits.push({ x: Math.random() * c.width, y: -20 - Math.random() * 80, vy: 2 + Math.random() * 4, vx: -1 + Math.random() * 2, s: 4 + Math.random() * 5, col: cols[i % cols.length], a: Math.random() * 6 });
    }
    var n = 0;
    function tick() {
      ctx.clearRect(0, 0, c.width, c.height);
      bits.forEach(function (b) {
        b.y += b.vy; b.x += b.vx; b.a += 0.1;
        ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.a);
        ctx.fillStyle = b.col; ctx.fillRect(-b.s / 2, -b.s / 2, b.s, b.s * 0.6);
        ctx.restore();
      });
      n++;
      if (n < 90) requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, c.width, c.height);
    }
    tick();
  }

  function weekReport() {
    var rows = weekRows();
    var gymDays = rows.filter(function (s) { return s.finished || s.after1HourNote || s.entryWeight; }).length;
    var runKm = 0, runMin = 0;
    var weights = [];
    rows.forEach(function (s) {
      var r = runBits(s);
      runKm += r.km; runMin += r.min;
      if (s.entryWeight != null) weights.push({ d: s.date, w: Number(s.entryWeight) });
      if (s.afterTreadmillWeight != null) weights.push({ d: s.date + "z", w: Number(s.afterTreadmillWeight) });
    });
    weights.sort(function (a, b) { return a.d.localeCompare(b.d); });
    var start = weights.length ? weights[0].w : null;
    var end = weights.length ? weights[weights.length - 1].w : null;
    var delta = (start != null && end != null) ? Math.round((end - start) * 10) / 10 : null;
    return {
      gymDays: gymDays,
      runKm: Math.round(runKm * 100) / 100,
      runMin: runMin,
      start: start,
      end: end,
      delta: delta
    };
  }

  function paintExtras() {
    var row = typeof todayRow === "function" ? todayRow() : null;
    var rb = runBits(row);
    var gymLine = el("homeDur");
    if (gymLine) {
      var parent = gymLine.closest(".kv");
      if (parent) {
        var lab = parent.querySelector("span");
        if (lab) lab.textContent = "gym duration";
      }
      gymLine.textContent = gymDur(row);
    }
    if (!el("homeRunDur")) {
      var tm = el("homeTm");
      var wrap = tm && tm.closest(".glass");
      if (wrap) {
        var kv = document.createElement("div");
        kv.className = "kv";
        kv.innerHTML = "<span>run duration</span><b id=\"homeRunDur\">—</b>";
        if (tm.parentNode) tm.parentNode.parentNode.insertBefore(kv, tm.parentNode.nextSibling);
      }
    }
    if (el("homeRunDur")) {
      el("homeRunDur").textContent = rb.min ? (rb.min + " min • " + rb.km + " km") : "—";
    }

    var st = el("stStreak");
    var n = st ? Number(st.textContent) : 0;
    if (typeof streakCount === "function") n = streakCount();
    if (st) {
      st.textContent = n >= 7 ? ("🔥 " + n) : String(n);
      st.classList.toggle("fire", n >= 7);
    }

    var w = weekReport();
    var box = el("weekBox");
    if (!box) {
      var home = el("view-home");
      if (home) {
        box = document.createElement("div");
        box.id = "weekBox";
        box.className = "glass card";
        var after = home.querySelector(".stats");
        if (after && after.parentNode) after.parentNode.insertBefore(box, after.nextSibling);
        else home.appendChild(box);
      }
    }
    if (box) {
      var dlt = w.delta == null ? "—" : ((w.delta > 0 ? "+" : "") + w.delta + " kg");
      var se = (w.start != null && w.end != null) ? (w.start + " → " + w.end + " kg") : "—";
      box.innerHTML =
        "<h2>this week</h2>" +
        "<div class=\"week-grid\">" +
        "<div><b>" + w.gymDays + "</b><span>gym days</span></div>" +
        "<div><b>" + w.runKm + " km</b><span>run + walk</span></div>" +
        "<div><b>" + se + "</b><span>start → end</span></div>" +
        "<div><b>" + dlt + "</b><span>week change</span></div></div>" +
        "<div class=\"pwa-bar\">" +
        "<button class=\"btn ok\" id=\"tgShare\" type=\"button\">Telegram summary</button>" +
        "<button class=\"btn ghost\" id=\"pwaBtn\" type=\"button\">Add to Home</button></div>";
      var tg = el("tgShare");
      if (tg) tg.onclick = shareTelegram;
      var pb = el("pwaBtn");
      if (pb) pb.onclick = addHome;
    }
  }

  function summaryText() {
    var row = typeof todayRow === "function" ? todayRow() : null;
    var w = weekReport();
    var name = (window.__displayName || (typeof username !== "undefined" ? username : "Sidhi"));
    var rb = runBits(row);
    var lines = [
      "SIDHI GYM • " + name,
      "Date: " + (typeof todayISO === "function" ? todayISO() : ""),
      "Today gym: " + gymDur(row),
      "Today run: " + (rb.min ? rb.min + " min / " + rb.km + " km" : "—"),
      "Week gym days: " + w.gymDays,
      "Week run: " + w.runKm + " km",
      "Week weight: " + ((w.start != null && w.end != null) ? (w.start + " → " + w.end + " kg") : "—"),
      "Streak: " + (typeof streakCount === "function" ? streakCount() : "") + " days"
    ];
    return lines.join("\n");
  }
  function shareTelegram() {
    var text = summaryText();
    var url = "https://t.me/share/url?url=" + encodeURIComponent("https://sidhi-gym-tracker.vercel.app") + "&text=" + encodeURIComponent(text);
    window.open(url, "_blank");
  }

  var deferredPrompt = null;
  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    deferredPrompt = e;
  });
  function addHome() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt = null;
      return;
    }
    if (typeof toast === "function") toast("Chrome menu → Add to Home screen");
  }

  if (typeof save === "function" && !save._conf) {
    var _sv = save;
    save = async function (finished) {
      await _sv(finished);
      if (finished) confetti();
    };
    save._conf = true;
  }
  var hf = el("homeFinish");
  if (hf && !hf._conf) {
    var old = hf.onclick;
    hf.onclick = function () {
      if (typeof old === "function") old();
      confetti();
    };
    hf._conf = true;
  }

  if (typeof paintHome === "function" && !paintHome._ex) {
    var _ph = paintHome;
    paintHome = function () { _ph(); paintExtras(); };
    paintHome._ex = true;
  }
  paintExtras();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").catch(function () {});
  }
})();
