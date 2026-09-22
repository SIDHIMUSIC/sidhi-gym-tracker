(function () {
  const RUN_KEY = "sidhi-gym-run";
  const MIN_MOVE_KMH = 6;
  const MAX_ACC_M = 22;
  const MIN_DT = 1.2;
  const MAX_DT = 8;
  const MIN_D_KM = 0.004;
  const MAX_D_KM = 0.04;
  const run = {
    state: "idle", mode: "auto", speed: 0, incline: 0,
    startedAt: 0, elapsedMs: 0, distanceKm: 0, maxSpeed: 0,
    tick: null, watch: null, lastFix: null, wake: null,
    moving: 0, points: []
  };
  function el(id) { return document.getElementById(id); }
  function fancy(s) {
    const m = { a:"ꜰ", b:"ʙ", c:"ᴄ", d:"ᴅ", e:"ᴇ", f:"ꜰ", g:"ɢ", h:"ʜ", i:"ɪ", j:"ᴊ", k:"ᴋ", l:"ʟ", m:"ᴍ", n:"ɴ", o:"ᴏ", p:"ᴘ", q:"ǫ", r:"ʀ", s:"s", t:"ᴛ", u:"ᴜ", v:"ᴠ", w:"ᴡ", x:"x", y:"ʏ", z:"ᴢ" };
    m.a = "ᴀ";
    return String(s).replace(/[A-Za-z]/g, function (ch) { return m[ch.toLowerCase()] || ch; });
  }
  function fmtClock(ms) {
    const s = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    return h ? (h + ":" + String(m % 60).padStart(2,"0") + ":" + String(s % 60).padStart(2,"0")) : (String(m % 60).padStart(2,"0") + ":" + String(s % 60).padStart(2,"0"));
  }
  function runWeight() {
    const row = (typeof todayRow === "function" && todayRow()) || (typeof currentRow === "function" && currentRow()) || {};
    const w = typeof kg === "function" ? (kg(row.entryWeight) || kg(row.afterTreadmillWeight)) : Number(row.entryWeight);
    return w || 70;
  }
  function runMet(spd, inc) {
    const s = Number(spd) || 0;
    let met = 3.5;
    if (s >= 12) met = 12.5; else if (s >= 10) met = 10; else if (s >= 8) met = 8.5; else if (s >= 6) met = 6; else if (s >= 4) met = 3.8; else if (s > 0) met = 2.5;
    return met + (Number(inc) || 0) * 0.4;
  }
  function haversine(a, b) {
    const R = 6371;
    const dLat = (b.lat - a.lat) * Math.PI / 180;
    const dLng = (b.lng - a.lng) * Math.PI / 180;
    const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(x)));
  }
  function zoneOf(spd) {
    if (spd >= 11) return "fast";
    if (spd >= 7) return "medium";
    if (spd >= MIN_MOVE_KMH) return "slow";
    return "idle";
  }
  function allRuns() {
    const list = (typeof sessions !== "undefined" && sessions) || [];
    const out = [];
    list.forEach(function (s) { (s.runs || []).forEach(function (r) { out.push(Object.assign({ date: s.date, day: s.day }, r)); }); });
    return out;
  }
  function inRange(iso, days) {
    const t = new Date(iso).getTime();
    return Date.now() - t <= days * 86400000;
  }
  function runSnap() {
    const hours = run.elapsedMs / 3600000;
    let km = run.distanceKm;
    if (run.mode !== "auto") km = Math.round((run.speed * hours) * 1000) / 1000;
    const spd = run.mode === "auto" ? run.speed : Number(run.speed) || 0;
    const cal = Math.round(runMet(spd, run.incline) * runWeight() * hours);
    const pace = km > 0.2 ? fmtClock(run.elapsedMs / km) : "—";
    return { km: km, cal: cal, pace: pace, spd: spd, zone: zoneOf(spd) };
  }
  function paintZone(zone) {
    const fig = el("runFig");
    if (!fig) return;
    fig.className = "run-fig zone-" + zone;
    const lab = el("runZoneLab");
    if (lab) lab.textContent = fancy(zone === "idle" ? "stand still" : zone + " run");
  }
  function drawGraph() {
    const c = el("runGraph");
    if (!c) return;
    const ctx = c.getContext("2d");
    const w = c.width, h = c.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "rgba(255,255,255,.04)";
    ctx.fillRect(0, 0, w, h);
    const pts = run.points;
    if (pts.length < 2) {
      ctx.fillStyle = "#9aa7b8";
      ctx.font = "12px Comfortaa,sans-serif";
      ctx.fillText("speed graph — tap after run starts", 12, h / 2);
      return;
    }
    const maxS = Math.max(12, ...pts.map(function (p) { return p.spd; }));
    ctx.strokeStyle = "rgba(240,194,122,.9)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    pts.forEach(function (p, i) {
      const x = (i / (pts.length - 1)) * (w - 16) + 8;
      const y = h - 10 - (p.spd / maxS) * (h - 20);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }
  function paintSummary() {
    const box = el("runSum");
    if (!box) return;
    const runs = allRuns();
    const week = runs.filter(function (r) { return inRange(r.endedAt || r.startedAt || r.date, 7); });
    const month = runs.filter(function (r) { return inRange(r.endedAt || r.startedAt || r.date, 30); });
    function tot(arr) {
      return arr.reduce(function (a, r) {
        a.km += Number(r.distanceKm) || 0;
        a.min += Math.round((Number(r.durationSec) || 0) / 60);
        a.cal += Number(r.calories) || 0;
        return a;
      }, { km: 0, min: 0, cal: 0 });
    }
    const w = tot(week), mo = tot(month);
    let bestRun = runs[0] || null;
    runs.forEach(function (r) {
      if (!bestRun || (Number(r.distanceKm) || 0) > (Number(bestRun.distanceKm) || 0)) bestRun = r;
    });
    const gymDays = ((typeof sessions !== "undefined" && sessions) || []).filter(function (s) { return s.finished || s.after1HourNote; });
    let bestGym = gymDays[0] || null;
    gymDays.forEach(function (s) {
      const noteLen = String(s.after1HourNote || "").length;
      const prev = String((bestGym && bestGym.after1HourNote) || "").length;
      if (noteLen > prev) bestGym = s;
    });
    box.innerHTML =
      '<div class="sum-grid">' +
      '<div class="glass run-stat"><b>' + w.km.toFixed(1) + '</b><span>' + fancy("week km") + '</span></div>' +
      '<div class="glass run-stat"><b>' + mo.km.toFixed(1) + '</b><span>' + fancy("month km") + '</span></div>' +
      '<div class="glass run-stat"><b>' + (bestRun ? Number(bestRun.distanceKm).toFixed(2) : "—") + '</b><span>' + fancy("best run km") + '</span></div>' +
      '<div class="glass run-stat"><b>' + (bestGym ? (bestGym.date || "—") : "—") + '</b><span>' + fancy("top gym day") + '</span></div>' +
      '</div><p class="sub" style="text-align:center;margin-top:8px">' +
      fancy("pace = min per km") + " • " + fancy("auto only counts 6+ km/h") + '</p>';
  }
  function paintRun() {
    if (!el("livebar")) return;
    const snap = runSnap();
    el("livebar").classList.toggle("on", run.state !== "idle");
    if (el("runOpenBtn")) {
      el("runOpenBtn").classList.toggle("live", run.state === "running");
      el("runOpenBtn").textContent = run.state === "running" ? "● " + fancy("run") : run.state === "paused" ? fancy("paused") : fancy("run");
    }
    el("liveTime").textContent = fmtClock(run.elapsedMs);
    el("liveKm").textContent = snap.km.toFixed(2) + " " + fancy("km");
    el("liveSpd").textContent = snap.spd.toFixed(1) + " " + fancy("km/h");
    el("liveCal").textContent = snap.cal + " " + fancy("kcal");
    if (el("runClock")) el("runClock").textContent = fmtClock(run.elapsedMs);
    if (el("ovKm")) el("ovKm").textContent = snap.km.toFixed(2);
    if (el("ovSpd")) el("ovSpd").textContent = snap.spd.toFixed(1);
    if (el("ovCal")) el("ovCal").textContent = String(snap.cal);
    if (el("ovPace")) el("ovPace").textContent = snap.pace;
    paintZone(run.state === "running" ? snap.zone : "idle");
    if (el("runStatus")) {
      el("runStatus").textContent = run.state === "running"
        ? fancy(run.mode === "auto" ? (snap.zone === "idle" ? "gps waiting — run faster" : "auto gps live") : run.mode + " live")
        : run.state === "paused" ? fancy("paused") : fancy("auto gps — only real run counts");
    }
    if (el("runStartBtn")) el("runStartBtn").classList.toggle("hidden", run.state !== "idle");
    if (el("runPauseBtn")) el("runPauseBtn").classList.toggle("hidden", run.state !== "running");
    if (el("runResumeBtn")) el("runResumeBtn").classList.toggle("hidden", run.state !== "paused");
    if (el("runEndBtn")) el("runEndBtn").classList.toggle("hidden", run.state === "idle");
    drawGraph();
  }
  function persistRun() {
    if (run.state === "idle") { localStorage.removeItem(RUN_KEY); return; }
    localStorage.setItem(RUN_KEY, JSON.stringify({
      state: run.state, mode: run.mode, speed: run.speed, incline: run.incline,
      startedAt: run.startedAt, elapsedMs: run.elapsedMs, distanceKm: run.distanceKm,
      maxSpeed: run.maxSpeed, points: run.points.slice(-80)
    }));
  }
  function onFix(pos) {
    if (run.state !== "running" || run.mode !== "auto") return;
    const acc = pos.coords.accuracy;
    if (acc && acc > MAX_ACC_M) return;
    const fix = { lat: pos.coords.latitude, lng: pos.coords.longitude, t: Date.now() };
    let gpsKmh = 0;
    if (pos.coords.speed != null && pos.coords.speed >= 0) gpsKmh = pos.coords.speed * 3.6;
    if (run.lastFix) {
      const dt = (fix.t - run.lastFix.t) / 1000;
      const d = haversine(run.lastFix, fix);
      if (dt < MIN_DT || dt > MAX_DT || d < MIN_D_KM || d > MAX_D_KM) { run.lastFix = fix; return; }
      const fromDist = d / dt * 3600;
      if (!gpsKmh) gpsKmh = fromDist;
      const use = Math.min(gpsKmh, fromDist);
      if (use >= MIN_MOVE_KMH && use < 28) {
        run.moving = Math.min(4, run.moving + 1);
        if (run.moving >= 2) {
          run.distanceKm += d;
          run.speed = Math.round(use * 10) / 10;
          if (run.speed > run.maxSpeed) run.maxSpeed = run.speed;
          run.points.push({ t: fix.t, spd: run.speed, km: run.distanceKm });
          if (run.points.length > 120) run.points.shift();
        }
      } else {
        run.moving = 0;
        run.speed = Math.round(use * 10) / 10;
      }
    }
    run.lastFix = fix; persistRun(); paintRun();
  }
  function startGps() {
    stopGps();
    if (!navigator.geolocation) { if (typeof toast === "function") toast(fancy("gps nahi mila")); return; }
    run.watch = navigator.geolocation.watchPosition(onFix, function () {
      if (typeof toast === "function") toast(fancy("location allow karo"));
    }, { enableHighAccuracy: true, maximumAge: 800, timeout: 10000 });
  }
  function stopGps() {
    if (run.watch != null && navigator.geolocation) navigator.geolocation.clearWatch(run.watch);
    run.watch = null; run.lastFix = null; run.moving = 0;
  }
  async function lockScreen() { try { if (navigator.wakeLock) run.wake = await navigator.wakeLock.request("screen"); } catch (e) {} }
  function unlockScreen() { try { if (run.wake) run.wake.release(); } catch (e) {} run.wake = null; }
  function startTicker() {
    clearInterval(run.tick);
    run.tick = setInterval(function () {
      if (run.state !== "running") return;
      run.elapsedMs = Date.now() - run.startedAt;
      if (run.mode !== "auto") {
        run.distanceKm = Math.round((Number(run.speed) * (run.elapsedMs / 3600000)) * 1000) / 1000;
        run.points.push({ t: Date.now(), spd: Number(run.speed) || 0, km: run.distanceKm });
        if (run.points.length > 120) run.points.shift();
      }
      persistRun(); paintRun();
    }, 250);
  }
  function applyMode(btn) {
    document.querySelectorAll("#runModes button").forEach(function (b) { b.classList.toggle("on", b === btn); });
    run.mode = btn.dataset.mode;
    run.speed = Number(btn.dataset.spd) || 0;
    if (el("runSpeedIn")) el("runSpeedIn").value = run.speed;
    if (run.mode === "incline" && el("runInclineIn") && !(Number(el("runInclineIn").value) > 0)) el("runInclineIn").value = "8";
    run.incline = el("runInclineIn") ? Number(el("runInclineIn").value) || 0 : 0;
    if (run.state === "running") { if (run.mode === "auto") startGps(); else stopGps(); }
    paintRun();
  }
  function startRun() {
    run.speed = el("runSpeedIn") ? Number(el("runSpeedIn").value) || run.speed : run.speed;
    run.incline = el("runInclineIn") ? Number(el("runInclineIn").value) || 0 : 0;
    run.state = "running";
    run.startedAt = Date.now() - run.elapsedMs;
    persistRun(); lockScreen(); startTicker();
    if (run.mode === "auto") startGps();
    paintRun(); paintSummary();
    if (typeof toast === "function") toast(fancy(run.mode === "auto" ? "auto run — 6 km/h se upar count" : "run start"));
  }
  function pauseRun() {
    if (run.state !== "running") return;
    run.elapsedMs = Date.now() - run.startedAt;
    run.state = "paused"; clearInterval(run.tick); stopGps(); persistRun(); paintRun();
    if (typeof toast === "function") toast(fancy("paused"));
  }
  function resumeRun() {
    if (run.state !== "paused") return;
    run.state = "running"; run.startedAt = Date.now() - run.elapsedMs;
    persistRun(); startTicker(); if (run.mode === "auto") startGps(); lockScreen(); paintRun();
    if (typeof toast === "function") toast(fancy("resume"));
  }
  async function endRun(silent) {
    if (run.state === "idle") return;
    if (run.state === "running") run.elapsedMs = Date.now() - run.startedAt;
    const snap = runSnap();
    const rec = {
      mode: run.mode, source: run.mode === "auto" ? "gps" : "treadmill",
      startedAt: new Date(Date.now() - run.elapsedMs).toISOString(),
      endedAt: new Date().toISOString(),
      durationSec: Math.round(run.elapsedMs / 1000),
      distanceKm: snap.km,
      avgSpeed: snap.km && run.elapsedMs ? Math.round((snap.km / (run.elapsedMs / 3600000)) * 10) / 10 : snap.spd,
      maxSpeed: run.maxSpeed || snap.spd, inclinePct: run.incline, calories: snap.cal,
      points: run.points.slice(-80)
    };
    clearInterval(run.tick); stopGps(); unlockScreen();
    run.state = "idle"; run.elapsedMs = 0; run.startedAt = 0; run.distanceKm = 0; run.maxSpeed = 0; run.points = []; run.moving = 0;
    persistRun(); paintRun();
    if (el("runOv")) el("runOv").classList.remove("on");
    if (typeof token === "undefined" || !token) return;
    try {
      if (el("date") && !el("date").value && typeof todayISO === "function") el("date").value = todayISO();
      const old = (typeof currentRow === "function" && currentRow()) || (typeof todayRow === "function" && todayRow()) || {};
      const body = formBody(false);
      body.date = typeof todayISO === "function" ? todayISO() : body.date;
      body.runs = (old.runs || []).concat([rec]);
      if (rec.mode === "incline") {
        body.afterTreadmillKm = Math.round(((Number(old.afterTreadmillKm) || 0) + rec.distanceKm) * 1000) / 1000;
        body.afterTreadmillMins = Math.round((Number(old.afterTreadmillMins) || 0) + rec.durationSec / 60);
        body.afterTreadmillSpeed = rec.avgSpeed;
        body.afterTreadmillIncline = rec.inclinePct || old.afterTreadmillIncline;
        body.afterTreadmillTime = typeof nowTime === "function" ? nowTime() : body.afterTreadmillTime;
      } else {
        body.beforeTreadmillKm = Math.round(((Number(old.beforeTreadmillKm) || 0) + rec.distanceKm) * 1000) / 1000;
        body.beforeTreadmillMins = Math.round((Number(old.beforeTreadmillMins) || 0) + rec.durationSec / 60);
        body.beforeTreadmillSpeed = rec.avgSpeed;
        body.beforeTreadmillTime = typeof nowTime === "function" ? nowTime() : body.beforeTreadmillTime;
      }
      const data = await api("/api/session", { method: "PUT", body: body });
      sessions = data.sessions || [];
      if (typeof fillForm === "function") fillForm();
      if (typeof paintHome === "function") paintHome();
      if (typeof paintHist === "function") paintHist();
      paintSummary();
      if (!silent && typeof toast === "function") toast(fancy("run saved") + " " + rec.distanceKm.toFixed(2) + " km");
    } catch (err) { if (!silent && typeof toast === "function") toast(err.message); }
  }
  function restoreRun() {
    try {
      const raw = localStorage.getItem(RUN_KEY); if (!raw) return;
      const s = JSON.parse(raw);
      run.mode = s.mode || "auto"; run.speed = Number(s.speed) || 0; run.incline = Number(s.incline) || 0;
      run.elapsedMs = Number(s.elapsedMs) || 0; run.distanceKm = Number(s.distanceKm) || 0; run.maxSpeed = Number(s.maxSpeed) || 0;
      run.points = Array.isArray(s.points) ? s.points : [];
      if (el("runSpeedIn")) el("runSpeedIn").value = run.speed;
      if (el("runInclineIn")) el("runInclineIn").value = run.incline;
      document.querySelectorAll("#runModes button").forEach(function (b) { b.classList.toggle("on", b.dataset.mode === run.mode); });
      if (s.state === "running") { run.state = "running"; run.startedAt = Date.now() - run.elapsedMs; startTicker(); lockScreen(); if (run.mode === "auto") startGps(); }
      else if (s.state === "paused") run.state = "paused";
      paintRun();
    } catch (e) {}
  }
  if (typeof paintHome === "function") {
    const _paintHome = paintHome;
    paintHome = function () {
      _paintHome();
      const box = el("homeRun"); const row = typeof todayRow === "function" ? todayRow() : null; const runs = (row && row.runs) || [];
      if (!box) return; if (!runs.length) { box.textContent = "—"; return; }
      const rkm = runs.reduce(function (a, r) { return a + (Number(r.distanceKm) || 0); }, 0);
      const rcal = runs.reduce(function (a, r) { return a + (Number(r.calories) || 0); }, 0);
      const rsec = runs.reduce(function (a, r) { return a + (Number(r.durationSec) || 0); }, 0);
      box.textContent = rkm.toFixed(2) + " km • " + Math.round(rsec / 60) + " min • " + Math.round(rcal) + " kcal";
    };
  }
  if (typeof formBody === "function") {
    const _formBody = formBody;
    formBody = function (finished) {
      const body = _formBody(finished);
      const old = (typeof currentRow === "function" && currentRow()) || {};
      body.runs = old.runs || [];
      return body;
    };
  }
  const logoutBtn = el("logoutBtn");
  if (logoutBtn) {
    const prev = logoutBtn.onclick;
    logoutBtn.onclick = function (ev) {
      if (run.state === "running" || run.state === "paused") endRun(true);
      if (typeof prev === "function") prev.call(this, ev);
    };
  }
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible" && run.state === "running") {
      lockScreen();
      if (run.mode === "auto") startGps();
      run.startedAt = Date.now() - run.elapsedMs;
      startTicker();
    }
  });
  (function ensureUI() {
    var css = ".head-actions{display:flex;flex-direction:column;align-items:flex-end;gap:8px}.head-btns{display:flex;gap:8px;align-items:center}.btn.run{min-height:42px;border-radius:999px;padding:8px 16px;background:linear-gradient(135deg,#63e2b3,#7ab8ff);border:0;color:#04140d;font:700 13px Comfortaa,sans-serif;letter-spacing:.08em}.livebar{display:none;gap:6px;flex-wrap:wrap;justify-content:flex-end}.livebar.on{display:flex}.chip{padding:6px 10px;border-radius:999px;background:rgba(99,226,179,.14);font:800 11px Comfortaa,sans-serif;color:#c8ffe8}.run-ov{position:fixed;inset:0;z-index:80;display:none;overflow:auto;background:#070b12;padding:14px 14px 36px}.run-ov.on{display:block}.run-clock{font:800 64px Comfortaa,sans-serif;text-align:center;margin:8px 0 4px;color:#f0c27a}.modes{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:14px 0}.modes button{border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.06);color:#fff;border-radius:999px;padding:12px 14px;min-height:46px;font:700 13px Comfortaa,sans-serif}.modes button.on{color:#04140d;background:linear-gradient(135deg,#a8edea,#63e2b3)}.run-stats{display:grid;grid-template-columns:1fr 1fr;gap:10px}.run-stat{text-align:center;padding:16px 8px}.run-stat b{display:block;font:800 24px Comfortaa,sans-serif;color:#f0c27a}.run-stat span{font-size:12px;letter-spacing:.08em}.run-acts{display:flex;flex-direction:column;gap:10px;margin-top:16px}.run-acts .row{display:flex;gap:10px}.run-ov .btn{min-height:58px;font-size:16px;letter-spacing:.1em}.run-ov #runEndBtn,.run-ov #runPauseBtn,.run-ov #runResumeBtn,.run-ov #runStartBtn{flex:1}.run-fig{width:72px;height:72px;margin:8px auto 4px;border-radius:50%;display:grid;place-items:center;font-size:34px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12)}.run-fig.zone-idle{animation:none;opacity:.55}.run-fig.zone-slow{animation:bounce 1.1s ease-in-out infinite}.run-fig.zone-medium{animation:bounce .7s ease-in-out infinite}.run-fig.zone-fast{animation:bounce .38s ease-in-out infinite;box-shadow:0 0 22px #63e2b366}@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}.sum-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px}#runGraph{width:100%;height:120px;border-radius:16px;background:rgba(255,255,255,.04);margin-top:12px}";
    var st = document.getElementById("run-css");
    if (!st) { st = document.createElement("style"); st.id = "run-css"; document.head.appendChild(st); }
    st.textContent = css;
    var logout = el("logoutBtn");
    if (logout && !el("runOpenBtn")) {
      var wrap = document.createElement("div"); wrap.className = "head-actions";
      wrap.innerHTML = '<div class="head-btns"><button class="btn run" id="runOpenBtn" type="button">' + fancy("run") + '</button></div><div class="livebar" id="livebar"><span class="chip" id="liveTime">00:00</span><span class="chip" id="liveKm">0.00</span><span class="chip" id="liveSpd">0.0</span><span class="chip" id="liveCal">0</span></div>';
      logout.parentNode.insertBefore(wrap, logout);
      wrap.querySelector(".head-btns").appendChild(logout);
    }
    if (!el("homeRun")) {
      var tm = el("homeTm");
      if (tm && tm.parentNode && tm.parentNode.parentNode) {
        var row = document.createElement("div"); row.className = "kv"; row.innerHTML = "<span>" + fancy("run") + "</span><b id=\"homeRun\">—</b>";
        tm.parentNode.parentNode.insertBefore(row, tm.parentNode.nextSibling);
      }
    }
    var ovHtml = '<div class="wrap" style="padding-top:8px"><div class="row" style="justify-content:space-between"><p class="badge">' + fancy("live run") + '</p><button class="btn ghost" id="runCloseBtn" type="button">' + fancy("close") + '</button></div><div class="run-fig zone-idle" id="runFig">🏃</div><p class="sub" id="runZoneLab" style="text-align:center">' + fancy("stand still") + '</p><div class="run-clock" id="runClock">00:00</div><p class="sub" id="runStatus" style="text-align:center">' + fancy("auto gps — only real run counts") + '</p><div class="modes" id="runModes"><button type="button" data-mode="auto" data-spd="0" class="on">' + fancy("auto gps") + '</button><button type="button" data-mode="walk" data-spd="4.5">' + fancy("walk") + ' 4.5</button><button type="button" data-mode="jog" data-spd="6.5">' + fancy("jog") + ' 6.5</button><button type="button" data-mode="run" data-spd="8.5">' + fancy("run") + ' 8.5</button><button type="button" data-mode="incline" data-spd="5.5">' + fancy("incline") + ' 5.5</button><button type="button" data-mode="sprint" data-spd="11">' + fancy("sprint") + ' 11</button></div><div class="grid"><div><label>' + fancy("speed km/h") + '</label><input id="runSpeedIn" value="0"></div><div><label>' + fancy("incline") + ' %</label><input id="runInclineIn" value="0"></div></div><div class="run-stats"><div class="glass run-stat"><b id="ovKm">0.00</b><span>' + fancy("km") + '</span></div><div class="glass run-stat"><b id="ovSpd">0.0</b><span>' + fancy("km/h") + '</span></div><div class="glass run-stat"><b id="ovCal">0</b><span>' + fancy("kcal") + '</span></div><div class="glass run-stat"><b id="ovPace">—</b><span>' + fancy("pace min/km") + '</span></div></div><canvas id="runGraph" width="640" height="160"></canvas><p class="sub" id="graphHint" style="text-align:center">' + fancy("tap graph for speed + time") + '</p><div id="runSum"></div><div class="run-acts"><button class="btn ok full" id="runStartBtn" type="button">' + fancy("start") + '</button><div class="row"><button class="btn ghost full hidden" id="runPauseBtn" type="button">' + fancy("stop") + '</button><button class="btn full hidden" id="runResumeBtn" type="button">' + fancy("resume") + '</button></div><button class="btn danger full hidden" id="runEndBtn" type="button">' + fancy("end run") + '</button></div></div>';
    var ov = el("runOv");
    if (!ov) { ov = document.createElement("div"); ov.className = "run-ov"; ov.id = "runOv"; document.body.appendChild(ov); }
    ov.innerHTML = ovHtml;
  })();
  if (el("runOpenBtn")) el("runOpenBtn").onclick = function () { el("runOv").classList.add("on"); paintRun(); paintSummary(); };
  if (el("runCloseBtn")) el("runCloseBtn").onclick = function () { el("runOv").classList.remove("on"); };
  if (el("runModes")) el("runModes").addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) applyMode(b); });
  if (el("runSpeedIn")) el("runSpeedIn").addEventListener("input", function () { run.speed = Number(el("runSpeedIn").value) || 0; paintRun(); });
  if (el("runInclineIn")) el("runInclineIn").addEventListener("input", function () { run.incline = Number(el("runInclineIn").value) || 0; paintRun(); });
  if (el("runStartBtn")) el("runStartBtn").onclick = startRun;
  if (el("runPauseBtn")) el("runPauseBtn").onclick = pauseRun;
  if (el("runResumeBtn")) el("runResumeBtn").onclick = resumeRun;
  if (el("runEndBtn")) el("runEndBtn").onclick = function () { endRun(false); };
  if (el("runGraph")) {
    el("runGraph").addEventListener("click", function (e) {
      const pts = run.points;
      if (!pts.length) return;
      const rect = el("runGraph").getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const i = Math.max(0, Math.min(pts.length - 1, Math.round(x * (pts.length - 1))));
      const p = pts[i];
      const when = new Date(p.t);
      const hh = String(when.getHours()).padStart(2, "0");
      const mm = String(when.getMinutes()).padStart(2, "0");
      const ss = String(when.getSeconds()).padStart(2, "0");
      if (el("graphHint")) el("graphHint").textContent = fancy("at") + " " + hh + ":" + mm + ":" + ss + " • " + p.spd.toFixed(1) + " km/h • " + (p.km || 0).toFixed(2) + " km";
    });
  }
  restoreRun();
  paintSummary();
})();
