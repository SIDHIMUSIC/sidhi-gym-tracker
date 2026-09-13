(function () {
  const RUN_KEY = "sidhi-gym-run";
  const run = { state: "idle", mode: "auto", speed: 0, incline: 0, startedAt: 0, elapsedMs: 0, distanceKm: 0, maxSpeed: 0, tick: null, watch: null, lastFix: null, wake: null };
  function el(id) { return document.getElementById(id); }
  function fancy(s) {
    const map = { a:"ꜰ",b:"ʙ",c:"ᴄ",d:"ᴅ",e:"ᴇ",f:"ꜰ",g:"ɢ",h:"ʜ",i:"ɪ",j:"ᴊ",k:"ᴋ",l:"ʟ",m:"ᴍ",n:"ɴ",o:"ᴏ",p:"ᴘ",q:"ǫ",r:"ʀ",s:"s",t:"ᴛ",u:"ᴜ",v:"ᴠ",w:"ᴡ",x:"x",y:"ʏ",z:"ᴢ" };
    map.a = "ᴀ"; map.f = "ꜰ";
    const m = {a:"ᴀ",b:"ʙ",c:"ᴄ",d:"ᴅ",e:"ᴇ",f:"ꜰ",g:"ɢ",h:"ʜ",i:"ɪ",j:"ᴊ",k:"ᴋ",l:"ʟ",m:"ᴍ",n:"ɴ",o:"ᴏ",p:"ᴘ",q:"ǫ",r:"ʀ",s:"s",t:"ᴛ",u:"ᴜ",v:"ᴠ",w:"ᴡ",x:"x",y:"ʏ",z:"ᴢ"};
    return String(s).replace(/[A-Za-z]/g, function (ch) { return m[ch.toLowerCase()] || ch; });
  }
  function fmtClock(ms) {
    const s = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    const ss = String(s % 60).padStart(2, "0");
    const mm = String(m % 60).padStart(2, "0");
    return h ? (h + ":" + mm + ":" + ss) : (mm + ":" + ss);
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
  function runSnap() {
    const hours = run.elapsedMs / 3600000;
    let km = run.distanceKm;
    if (run.mode !== "auto") km = Math.round((run.speed * hours) * 1000) / 1000;
    const spd = run.mode === "auto" ? run.speed : Number(run.speed) || 0;
    const cal = Math.round(runMet(spd, run.incline) * runWeight() * hours);
    const pace = km > 0.05 ? fmtClock(run.elapsedMs / km) : "—";
    return { km: km, cal: cal, pace: pace, spd: spd };
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
    if (el("runStatus")) {
      el("runStatus").textContent = run.state === "running"
        ? fancy(run.mode === "auto" ? "auto gps live" : run.mode + " live")
        : run.state === "paused" ? fancy("paused") : fancy("auto speed on  start");
    }
    if (el("runStartBtn")) el("runStartBtn").classList.toggle("hidden", run.state !== "idle");
    if (el("runPauseBtn")) el("runPauseBtn").classList.toggle("hidden", run.state !== "running");
    if (el("runResumeBtn")) el("runResumeBtn").classList.toggle("hidden", run.state !== "paused");
    if (el("runEndBtn")) el("runEndBtn").classList.toggle("hidden", run.state === "idle");
  }
  function persistRun() {
    if (run.state === "idle") { localStorage.removeItem(RUN_KEY); return; }
    localStorage.setItem(RUN_KEY, JSON.stringify({ state: run.state, mode: run.mode, speed: run.speed, incline: run.incline, startedAt: run.startedAt, elapsedMs: run.elapsedMs, distanceKm: run.distanceKm, maxSpeed: run.maxSpeed }));
  }
  function onFix(pos) {
    if (run.state !== "running" || run.mode !== "auto") return;
    const fix = { lat: pos.coords.latitude, lng: pos.coords.longitude, t: Date.now() };
    let gpsKmh = 0;
    if (pos.coords.speed != null && pos.coords.speed >= 0) gpsKmh = pos.coords.speed * 3.6;
    if (run.lastFix) {
      const dt = (fix.t - run.lastFix.t) / 1000;
      const d = haversine(run.lastFix, fix);
      if (dt > 0.6 && d < 0.08) { run.distanceKm += d; if (!gpsKmh) gpsKmh = d / dt * 3600; }
    }
    if (gpsKmh > 0 && gpsKmh < 35) { run.speed = Math.round(gpsKmh * 10) / 10; if (run.speed > run.maxSpeed) run.maxSpeed = run.speed; }
    run.lastFix = fix; persistRun(); paintRun();
  }
  function startGps() {
    stopGps();
    if (!navigator.geolocation) { if (typeof toast === "function") toast(fancy("gps nahi mila")); return; }
    run.watch = navigator.geolocation.watchPosition(onFix, function () { if (typeof toast === "function") toast(fancy("location allow karo")); }, { enableHighAccuracy: true, maximumAge: 1000, timeout: 8000 });
  }
  function stopGps() {
    if (run.watch != null && navigator.geolocation) navigator.geolocation.clearWatch(run.watch);
    run.watch = null; run.lastFix = null;
  }
  async function lockScreen() { try { if (navigator.wakeLock) run.wake = await navigator.wakeLock.request("screen"); } catch (e) {} }
  function unlockScreen() { try { if (run.wake) run.wake.release(); } catch (e) {} run.wake = null; }
  function startTicker() {
    clearInterval(run.tick);
    run.tick = setInterval(function () {
      if (run.state !== "running") return;
      run.elapsedMs = Date.now() - run.startedAt;
      if (run.mode !== "auto") run.distanceKm = Math.round((Number(run.speed) * (run.elapsedMs / 3600000)) * 1000) / 1000;
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
    paintRun();
    if (typeof toast === "function") toast(fancy(run.mode === "auto" ? "auto run start" : "run start"));
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
    persistRun(); startTicker(); if (run.mode === "auto") startGps(); paintRun();
    if (typeof toast === "function") toast(fancy("resume"));
  }
  async function endRun(silent) {
    if (run.state === "idle") return;
    if (run.state === "running") run.elapsedMs = Date.now() - run.startedAt;
    const snap = runSnap();
    const rec = { mode: run.mode, source: run.mode === "auto" ? "gps" : "treadmill", startedAt: new Date(Date.now() - run.elapsedMs).toISOString(), endedAt: new Date().toISOString(), durationSec: Math.round(run.elapsedMs / 1000), distanceKm: snap.km, avgSpeed: snap.km && run.elapsedMs ? Math.round((snap.km / (run.elapsedMs / 3600000)) * 10) / 10 : snap.spd, maxSpeed: run.maxSpeed || snap.spd, inclinePct: run.incline, calories: snap.cal };
    clearInterval(run.tick); stopGps(); unlockScreen();
    run.state = "idle"; run.elapsedMs = 0; run.startedAt = 0; run.distanceKm = 0; run.maxSpeed = 0;
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
      if (!silent && typeof toast === "function") toast(fancy("run saved") + " " + rec.distanceKm.toFixed(2) + " km");
    } catch (err) { if (!silent && typeof toast === "function") toast(err.message); }
  }
  function restoreRun() {
    try {
      const raw = localStorage.getItem(RUN_KEY); if (!raw) return;
      const s = JSON.parse(raw);
      run.mode = s.mode || "auto"; run.speed = Number(s.speed) || 0; run.incline = Number(s.incline) || 0;
      run.elapsedMs = Number(s.elapsedMs) || 0; run.distanceKm = Number(s.distanceKm) || 0; run.maxSpeed = Number(s.maxSpeed) || 0;
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
  (function ensureUI() {
    var css = ".head-actions{display:flex;flex-direction:column;align-items:flex-end;gap:8px}.head-btns{display:flex;gap:8px;align-items:center}.btn.run{min-height:42px;border-radius:999px;padding:8px 16px;background:linear-gradient(135deg,#63e2b3,#7ab8ff);border:0;color:#04140d;font:700 13px Comfortaa,sans-serif;letter-spacing:.08em}.livebar{display:none;gap:6px;flex-wrap:wrap;justify-content:flex-end}.livebar.on{display:flex}.chip{padding:6px 10px;border-radius:999px;background:rgba(99,226,179,.14);font:800 11px Comfortaa,sans-serif;color:#c8ffe8}.run-ov{position:fixed;inset:0;z-index:80;display:none;overflow:auto;background:#070b12;padding:14px 14px 36px}.run-ov.on{display:block}.run-clock{font:800 64px Comfortaa,sans-serif;text-align:center;margin:8px 0 4px;color:#f0c27a}.modes{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:14px 0}.modes button{border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.06);color:#fff;border-radius:999px;padding:12px 14px;min-height:46px;font:700 13px Comfortaa,sans-serif}.modes button.on{color:#04140d;background:linear-gradient(135deg,#a8edea,#63e2b3)}.run-stats{display:grid;grid-template-columns:1fr 1fr;gap:10px}.run-stat{text-align:center;padding:16px 8px}.run-stat b{display:block;font:800 24px Comfortaa,sans-serif;color:#f0c27a}.run-stat span{font-size:12px;letter-spacing:.08em}.run-acts{display:flex;flex-direction:column;gap:10px;margin-top:16px}.run-acts .row{display:flex;gap:10px}.run-ov .btn{min-height:58px;font-size:16px;letter-spacing:.1em}.run-ov #runEndBtn,.run-ov #runPauseBtn,.run-ov #runResumeBtn,.run-ov #runStartBtn{flex:1}";
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
    var ovHtml = '<div class="wrap" style="padding-top:8px"><div class="row" style="justify-content:space-between"><p class="badge">' + fancy("live run") + '</p><button class="btn ghost" id="runCloseBtn" type="button">' + fancy("close") + '</button></div><div class="run-clock" id="runClock">00:00</div><p class="sub" id="runStatus" style="text-align:center">' + fancy("auto speed on") + '</p><div class="modes" id="runModes"><button type="button" data-mode="auto" data-spd="0" class="on">' + fancy("auto gps") + '</button><button type="button" data-mode="walk" data-spd="4.5">' + fancy("walk") + ' 4.5</button><button type="button" data-mode="jog" data-spd="6.5">' + fancy("jog") + ' 6.5</button><button type="button" data-mode="run" data-spd="8.5">' + fancy("run") + ' 8.5</button><button type="button" data-mode="incline" data-spd="5.5">' + fancy("incline") + ' 5.5</button><button type="button" data-mode="sprint" data-spd="11">' + fancy("sprint") + ' 11</button></div><div class="grid"><div><label>' + fancy("speed km/h") + '</label><input id="runSpeedIn" value="0"></div><div><label>' + fancy("incline") + ' %</label><input id="runInclineIn" value="0"></div></div><div class="run-stats"><div class="glass run-stat"><b id="ovKm">0.00</b><span>' + fancy("km") + '</span></div><div class="glass run-stat"><b id="ovSpd">0.0</b><span>' + fancy("km/h") + '</span></div><div class="glass run-stat"><b id="ovCal">0</b><span>' + fancy("kcal") + '</span></div><div class="glass run-stat"><b id="ovPace">-</b><span>' + fancy("pace") + '</span></div></div><div class="run-acts"><button class="btn ok full" id="runStartBtn" type="button">' + fancy("start") + '</button><div class="row"><button class="btn ghost full hidden" id="runPauseBtn" type="button">' + fancy("stop") + '</button><button class="btn full hidden" id="runResumeBtn" type="button">' + fancy("resume") + '</button></div><button class="btn danger full hidden" id="runEndBtn" type="button">' + fancy("end run") + '</button></div></div>';
    var ov = el("runOv");
    if (!ov) {
      ov = document.createElement("div");
      ov.className = "run-ov";
      ov.id = "runOv";
      document.body.appendChild(ov);
    }
    ov.innerHTML = ovHtml;
  })();
  if (el("runOpenBtn")) el("runOpenBtn").onclick = function () { el("runOv").classList.add("on"); paintRun(); };
  if (el("runCloseBtn")) el("runCloseBtn").onclick = function () { el("runOv").classList.remove("on"); };
  if (el("runModes")) el("runModes").addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) applyMode(b); });
  if (el("runSpeedIn")) el("runSpeedIn").addEventListener("input", function () { run.speed = Number(el("runSpeedIn").value) || 0; paintRun(); });
  if (el("runInclineIn")) el("runInclineIn").addEventListener("input", function () { run.incline = Number(el("runInclineIn").value) || 0; paintRun(); });
  if (el("runStartBtn")) el("runStartBtn").onclick = startRun;
  if (el("runPauseBtn")) el("runPauseBtn").onclick = pauseRun;
  if (el("runResumeBtn")) el("runResumeBtn").onclick = resumeRun;
  if (el("runEndBtn")) el("runEndBtn").onclick = function () { endRun(false); };
  restoreRun();
})();
