(function () {
  function el(id) { return document.getElementById(id); }
  var KEY = "sidhi-steps-";
  function dayKey() {
    return typeof todayISO === "function" ? todayISO() : new Date().toISOString().slice(0, 10);
  }
  function load() {
    try { return JSON.parse(localStorage.getItem(KEY + dayKey()) || "null") || { steps: 0, updated: 0 }; }
    catch (e) { return { steps: 0, updated: 0 }; }
  }
  function saveLocal(n) {
    localStorage.setItem(KEY + dayKey(), JSON.stringify({ steps: n, updated: Date.now() }));
  }
  var state = load();
  var live = false;
  var lastMag = 0, lastAt = 0, lastTick = 0;
  var wake = null;

  if (!document.getElementById("steps-css")) {
    var st = document.createElement("style");
    st.id = "steps-css";
    st.textContent =
      "#stepsOv{display:none;position:fixed;inset:0;z-index:16;background:#070b12;overflow:auto;padding:16px 14px 110px}" +
      "#stepsOv.on{display:block}" +
      ".steps-hero{text-align:center;padding:22px 12px}" +
      ".steps-hero b{display:block;font:800 56px Comfortaa,sans-serif;background:linear-gradient(90deg,#ff8bd4,#f0c27a,#63e2b3);-webkit-background-clip:text;background-clip:text;color:transparent}" +
      ".steps-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}" +
      ".pulse-dot{width:10px;height:10px;border-radius:50%;background:#63e2b3;display:inline-block;margin-right:6px}" +
      ".pulse-dot.on{animation:pdot 1s ease-in-out infinite}" +
      "@keyframes pdot{50%{opacity:.3;transform:scale(.8)}}";
    document.head.appendChild(st);
  }

  function kmOf(s) { return Math.round((s * 0.00078) * 1000) / 1000; }
  function kcalOf(s) { return Math.round(s * 0.04); }

  function paint() {
    var n = el("stepCount");
    if (n) n.textContent = String(state.steps);
    if (el("stepKm")) el("stepKm").textContent = kmOf(state.steps) + " km";
    if (el("stepKcal")) el("stepKcal").textContent = kcalOf(state.steps) + " kcal";
    if (el("stepLive")) {
      el("stepLive").classList.toggle("on", live);
      el("stepStatus").textContent = live ? "phone se count ho raha hai" : "start dabao — motion permission";
    }
    var home = el("homeSteps");
    if (home) home.textContent = state.steps + " steps";
  }

  function ensureHomeLine() {
    if (el("homeSteps") || !el("homeTm")) return;
    var kv = document.createElement("div");
    kv.className = "kv";
    kv.innerHTML = "<span>steps today</span><b id=\"homeSteps\">0 steps</b>";
    var parent = el("homeTm").closest(".glass");
    if (parent) parent.appendChild(kv);
  }

  function ensureUI() {
    if (el("stepsOv")) return;
    var ov = document.createElement("div");
    ov.id = "stepsOv";
    ov.innerHTML =
      '<div class="wrap" style="padding-top:8px">' +
      '<div class="row" style="justify-content:space-between"><p class="badge">SIDHI STEPS</p><button class="btn ghost" id="stepsClose" type="button" style="min-height:40px">close</button></div>' +
      '<div class="glass card steps-hero"><span class="pulse-dot" id="stepLive"></span><span class="sub" id="stepStatus">start dabao</span>' +
      '<b id="stepCount">0</b><p class="sub">aaj ke steps</p></div>' +
      '<div class="steps-grid">' +
      '<div class="glass stat"><b id="stepKm">0 km</b><span>approx walk</span></div>' +
      '<div class="glass stat"><b id="stepKcal">0 kcal</b><span>approx burn</span></div></div>' +
      '<div class="glass card" style="margin-top:14px"><p class="sub">Google Fit jaisa 24h background website pe possible nahi. App / PWA khuli ho ya screen on ho to phone accelerometer se real step count hota hai. Lock + Chrome kill pe count rukta hai.</p>' +
      '<button class="btn ok full" id="stepsGo" type="button" style="margin-top:12px">start live steps</button>' +
      '<button class="btn ghost full" id="stepsStop" type="button" style="margin-top:8px">pause</button></div></div>';
    document.body.appendChild(ov);
    el("stepsClose").onclick = function () {
      ov.classList.remove("on");
      if (typeof showTab === "function") showTab("home");
    };
    el("stepsGo").onclick = startLive;
    el("stepsStop").onclick = stopLive;
  }

  function onMotion(e) {
    var a = e.accelerationIncludingGravity || e.acceleration;
    if (!a) return;
    var mag = Math.sqrt((a.x || 0) * (a.x || 0) + (a.y || 0) * (a.y || 0) + (a.z || 0) * (a.z || 0));
    var now = Date.now();
    var diff = mag - lastMag;
    lastMag = mag;
    if (diff > 1.6 && now - lastAt > 280) {
      lastAt = now;
      state.steps += 1;
      if (now - lastTick > 800) {
        lastTick = now;
        saveLocal(state.steps);
        paint();
      }
    }
  }

  async function startLive() {
    try {
      if (typeof DeviceMotionEvent !== "undefined" && typeof DeviceMotionEvent.requestPermission === "function") {
        var p = await DeviceMotionEvent.requestPermission();
        if (p !== "granted") {
          if (typeof toast === "function") toast("Motion permission chahiye");
          return;
        }
      }
    } catch (e) {}
    if (live) return;
    live = true;
    window.addEventListener("devicemotion", onMotion, { passive: true });
    try { wake = await navigator.wakeLock.request("screen"); } catch (e) {}
    paint();
    if (typeof toast === "function") toast("Steps live");
  }
  function stopLive() {
    live = false;
    window.removeEventListener("devicemotion", onMotion);
    if (wake) { try { wake.release(); } catch (e) {} wake = null; }
    saveLocal(state.steps);
    paint();
    pushServer();
  }

  async function pushServer() {
    if (typeof api !== "function" || typeof formBody !== "function") return;
    try {
      var body = formBody(false);
      body.steps = state.steps;
      var data = await api("/api/session", { method: "PUT", body: body });
      if (data.sessions) sessions = data.sessions;
    } catch (e) {}
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) saveLocal(state.steps);
  });
  setInterval(function () {
    if (live) saveLocal(state.steps);
  }, 5000);

  var bar = el("tabbar");
  if (bar && !bar.querySelector('[data-tab="steps"]')) {
    var b = document.createElement("button");
    b.className = "tab"; b.type = "button"; b.dataset.tab = "steps";
    b.innerHTML = "steps";
    var run = bar.querySelector('[data-tab="run"]');
    if (run && run.nextSibling) bar.insertBefore(b, run.nextSibling);
    else if (run) bar.appendChild(b);
    else bar.appendChild(b);
    b.onclick = function (e) {
      e.preventDefault();
      document.querySelectorAll("#tabbar .tab").forEach(function (t) { t.classList.remove("on"); });
      b.classList.add("on");
      var ro = el("runOv"); if (ro) ro.classList.remove("on");
      ensureUI(); el("stepsOv").classList.add("on"); paint();
    };
  }
  ensureUI();
  ensureHomeLine();
  paint();
  if (typeof paintHome === "function" && !paintHome._steps) {
    var _ph = paintHome;
    paintHome = function () { _ph(); ensureHomeLine(); paint(); };
    paintHome._steps = true;
  }
})();
