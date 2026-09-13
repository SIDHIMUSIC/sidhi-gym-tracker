(function () {
  const RUN_KEY = "sidhi-gym-run";
  const run = {
    state: "idle",
    mode: "walk",
    speed: 4.5,
    incline: 0,
    startedAt: 0,
    elapsedMs: 0,
    tick: null,
    wake: null
  };

  function el(id) { return document.getElementById(id); }
  function fmtClock(ms) {
    const s = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    const ss = String(s % 60).padStart(2, "0");
    const mm = String(m % 60).padStart(2, "0");
    return h ? h + ":" + mm + ":" + ss : mm + ":" + ss;
  }
  function runWeight() {
    const row = (typeof todayRow === "function" && todayRow()) || (typeof currentRow === "function" && currentRow()) || {};
    const w = typeof kg === "function" ? kg(row.entryWeight) || kg(row.afterTreadmillWeight) : Number(row.entryWeight);
    return w || 70;
  }
  function runMet(spd, inc) {
    const s = Number(spd) || 0;
    let met = 3.5;
    if (s >= 12) met = 12.5;
    else if (s >= 10) met = 10;
    else if (s >= 8) met = 8.5;
    else if (s >= 6) met = 6;
    else if (s >= 4) met = 3.8;
    met += (Number(inc) || 0) * 0.4;
    return met;
  }
  function runSnap() {
    const hours = run.elapsedMs / 3600000;
    const km = Math.round((run.speed * hours) * 1000) / 1000;
    const cal = Math.round(runMet(run.speed, run.incline) * runWeight() * hours);
    const pace = km > 0.05 ? fmtClock(run.elapsedMs / km) : "—";
    return { km: km, cal: cal, pace: pace };
  }
  function runSummary(row) {
    const runs = (row && row.runs) || [];
    if (!runs.length) return "—";
    const rkm = runs.reduce(function (a, r) { return a + (Number(r.distanceKm) || 0); }, 0);
    const rcal = runs.reduce(function (a, r) { return a + (Number(r.calories) || 0); }, 0);
    const rsec = runs.reduce(function (a, r) { return a + (Number(r.durationSec) || 0); }, 0);
    return rkm.toFixed(2) + " km • " + Math.round(rsec / 60) + " min • " + Math.round(rcal) + " kcal";
  }
  function paintRun() {
    if (!el("livebar")) return;
    const snap = runSnap();
    const live = run.state !== "idle";
    el("livebar").classList.toggle("on", live);
    el("runOpenBtn").classList.toggle("live", run.state === "running");
    el("runOpenBtn").textContent = run.state === "running" ? "● ʀᴜɴ" : run.state === "paused" ? "⏸ ʀᴜɴ" : "▶ ʀᴜɴ";
    el("liveTime").textContent = "⏱ " + fmtClock(run.elapsedMs);
    el("liveKm").textContent = "📍 " + snap.km.toFixed(2) + " km";
    el("liveSpd").textContent = "⚡ " + Number(run.speed).toFixed(1);
    el("liveCal").textContent = "🔥 " + snap.cal;
    el("runClock").textContent = fmtClock(run.elapsedMs);
    el("ovKm").textContent = snap.km.toFixed(2);
    el("ovSpd").textContent = Number(run.speed).toFixed(1);
    el("ovCal").textContent = String(snap.cal);
    el("ovPace").textContent = snap.pace;
    el("runStatus").textContent = run.state === "running" ? (run.mode + " • live") : run.state === "paused" ? "paused" : "Pick a speed, then start";
    el("runStartBtn").classList.toggle("hidden", run.state !== "idle");
    el("runPauseBtn").classList.toggle("hidden", run.state !== "running");
    el("runResumeBtn").classList.toggle("hidden", run.state !== "paused");
    el("runEndBtn").classList.toggle("hidden", run.state === "idle");
  }
  function persistRun() {
    if (run.state === "idle") {
      localStorage.removeItem(RUN_KEY);
      return;
    }
    localStorage.setItem(RUN_KEY, JSON.stringify({
      state: run.state,
      mode: run.mode,
      speed: run.speed,
      incline: run.incline,
      startedAt: run.startedAt,
      elapsedMs: run.elapsedMs
    }));
  }
  function applyMode(btn) {
    document.querySelectorAll("#runModes button").forEach(function (b) { b.classList.toggle("on", b === btn); });
    run.mode = btn.dataset.mode;
    run.speed = Number(btn.dataset.spd);
    el("runSpeedIn").value = run.speed;
    if (run.mode === "incline" && !(Number(el("runInclineIn").value) > 0)) el("runInclineIn").value = "8";
    run.incline = Number(el("runInclineIn").value) || 0;
    paintRun();
  }
  async function lockScreen() {
    try { if (navigator.wakeLock) run.wake = await navigator.wakeLock.request("screen"); } catch (e) {}
  }
  function unlockScreen() {
    try { if (run.wake) run.wake.release(); } catch (e) {}
    run.wake = null;
  }
  function startTicker() {
    clearInterval(run.tick);
    run.tick = setInterval(function () {
      if (run.state !== "running") return;
      run.elapsedMs = Date.now() - run.startedAt;
      persistRun();
      paintRun();
    }, 250);
  }
  function startRun() {
    run.speed = Number(el("runSpeedIn").value) || run.speed || 4.5;
    run.incline = Number(el("runInclineIn").value) || 0;
    run.state = "running";
    run.startedAt = Date.now() - run.elapsedMs;
    persistRun();
    lockScreen();
    startTicker();
    paintRun();
    if (typeof toast === "function") toast("Run start");
  }
  function pauseRun() {
    if (run.state !== "running") return;
    run.elapsedMs = Date.now() - run.startedAt;
    run.state = "paused";
    clearInterval(run.tick);
    persistRun();
    paintRun();
    if (typeof toast === "function") toast("Paused");
  }
  function resumeRun() {
    if (run.state !== "paused") return;
    run.state = "running";
    run.startedAt = Date.now() - run.elapsedMs;
    persistRun();
    startTicker();
    paintRun();
    if (typeof toast === "function") toast("Resume");
  }
  async function endRun(silent) {
    if (run.state === "idle") return;
    if (run.state === "running") run.elapsedMs = Date.now() - run.startedAt;
    const snap = runSnap();
    const rec = {
      mode: run.mode,
      source: "treadmill",
      startedAt: new Date(Date.now() - run.elapsedMs).toISOString(),
      endedAt: new Date().toISOString(),
      durationSec: Math.round(run.elapsedMs / 1000),
      distanceKm: snap.km,
      avgSpeed: run.speed,
      maxSpeed: run.speed,
      inclinePct: run.incline,
      calories: snap.cal
    };
    clearInterval(run.tick);
    unlockScreen();
    run.state = "idle";
    run.elapsedMs = 0;
    run.startedAt = 0;
    persistRun();
    paintRun();
    el("runOv").classList.remove("on");
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
      if (!silent && typeof toast === "function") toast("Run saved • " + rec.distanceKm.toFixed(2) + " km • " + rec.calories + " kcal");
    } catch (err) {
      if (!silent && typeof toast === "function") toast(err.message);
    }
  }
  function restoreRun() {
    try {
      const raw = localStorage.getItem(RUN_KEY);
      if (!raw) return;
      const s = JSON.parse(raw);
      run.mode = s.mode || "walk";
      run.speed = Number(s.speed) || 4.5;
      run.incline = Number(s.incline) || 0;
      run.elapsedMs = Number(s.elapsedMs) || 0;
      if (el("runSpeedIn")) el("runSpeedIn").value = run.speed;
      if (el("runInclineIn")) el("runInclineIn").value = run.incline;
      document.querySelectorAll("#runModes button").forEach(function (b) {
        b.classList.toggle("on", b.dataset.mode === run.mode);
      });
      if (s.state === "running") {
        run.state = "running";
        run.startedAt = Date.now() - run.elapsedMs;
        startTicker();
        lockScreen();
      } else if (s.state === "paused") {
        run.state = "paused";
      }
      paintRun();
    } catch (e) {}
  }

  if (typeof paintHome === "function") {
    const _paintHome = paintHome;
    paintHome = function () {
      _paintHome();
      const box = el("homeRun");
      if (box && typeof todayRow === "function") box.textContent = runSummary(todayRow());
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

  el("runOpenBtn").onclick = function () { el("runOv").classList.add("on"); paintRun(); };
  el("runCloseBtn").onclick = function () { el("runOv").classList.remove("on"); };
  el("runModes").addEventListener("click", function (e) {
    const b = e.target.closest("button");
    if (b) applyMode(b);
  });
  el("runSpeedIn").addEventListener("input", function () {
    run.speed = Number(el("runSpeedIn").value) || run.speed;
    paintRun();
  });
  el("runInclineIn").addEventListener("input", function () {
    run.incline = Number(el("runInclineIn").value) || 0;
    paintRun();
  });
  el("runStartBtn").onclick = startRun;
  el("runPauseBtn").onclick = pauseRun;
  el("runResumeBtn").onclick = resumeRun;
  el("runEndBtn").onclick = function () { endRun(false); };
  restoreRun();
})();
