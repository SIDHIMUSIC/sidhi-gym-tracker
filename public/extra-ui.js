(function () {
  var profile = { displayName: "", gender: "", schedule: {}, createdAt: null };
  var todaySwap = localStorage.getItem("sidhi-today-swap") || "";
  var OPTIONS = window.SIDHI_DAY_OPTIONS || [
    "Day 1 — Chest + Triceps + Abs A",
    "Day 2 — Back + Biceps + Abs B",
    "Day 3 — Shoulders + Legs + Abs C",
    "Day 4 — Chest + Triceps + Abs A",
    "Day 5 — Back + Biceps + Abs B",
    "Day 6 — Shoulders + Legs + Abs C",
    "Day 7 — Rest / Recovery"
  ];
  var DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  function el(id) { return document.getElementById(id); }
  function firstName() {
    var n = (profile.displayName || username || "").trim();
    return n.split(/\s+/)[0] || username || "Athlete";
  }
  function greetText() {
    var h = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" }).format(new Date()));
    var name = firstName();
    if (h >= 5 && h < 12) return "Good Morning, " + name + " 👋";
    if (h >= 12 && h < 17) return "Good Afternoon, " + name + " 👋";
    if (h >= 17 && h < 21) return "Good Evening, " + name + " 👋";
    return "Good Night, " + name + " 🌙";
  }
  function applySplit() {
    if (typeof SPLIT !== "object") return;
    DAYS.forEach(function (d) {
      if (profile.schedule && profile.schedule[d]) SPLIT[d] = profile.schedule[d];
    });
    var today = (typeof dayFromDate === "function" && typeof todayISO === "function") ? dayFromDate(todayISO()) : DAYS[(new Date().getDay() + 6) % 7];
    if (todaySwap) SPLIT[today] = todaySwap;
  }
  function femaleAvatar() {
    return '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="sk" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6c7a8"/><stop offset="1" stop-color="#e8a882"/></linearGradient><linearGradient id="hz" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b1b22"/><stop offset="1" stop-color="#09090f"/></linearGradient></defs><circle cx="60" cy="60" r="60" fill="#141822"/><path d="M28 96c8-22 18-30 32-30s24 8 32 30" fill="#ff4f8b"/><path d="M38 102c6-14 13-20 22-20s16 6 22 20" fill="#2b2b36"/><circle cx="60" cy="46" r="20" fill="url(#sk)"/><path d="M38 48c-4-18 8-30 22-30 16 0 28 10 26 28-8-6-16-8-26-8s-18 2-22 10z" fill="url(#hz)"/><path d="M78 40c10 6 16 22 8 38-8 2-12-8-12-18 0-8 2-16 4-20z" fill="#111"/><circle cx="53" cy="46" r="2.2" fill="#2a1a14"/><circle cx="67" cy="46" r="2.2" fill="#2a1a14"/><path d="M54 54c4 3 8 3 12 0" stroke="#c06" stroke-width="1.4" fill="none" stroke-linecap="round"/><circle cx="80" cy="34" r="3" fill="#f0c27a"/></svg>';
  }
  function maleAvatar() {
    return '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="sk2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e0b089"/><stop offset="1" stop-color="#c4895c"/></linearGradient></defs><circle cx="60" cy="60" r="60" fill="#141822"/><path d="M26 100c8-24 20-34 34-34s26 10 34 34" fill="#2b6cff"/><path d="M36 104c6-14 14-20 24-20s18 6 24 20" fill="#1b1b22"/><circle cx="60" cy="46" r="20" fill="url(#sk2)"/><path d="M40 40c0-16 10-24 20-24s20 8 20 24c-8-4-14-6-20-6s-12 2-20 6z" fill="#1a1410"/><circle cx="53" cy="46" r="2.2" fill="#2a1a14"/><circle cx="67" cy="46" r="2.2" fill="#2a1a14"/><path d="M55 55c3 2 7 2 10 0" stroke="#8a4" stroke-width="1.3" fill="none"/></svg>';
  }
  function avatarHtml() {
    var g = (profile.gender || "").toLowerCase();
    var svg = g === "female" ? femaleAvatar() : maleAvatar();
    return '<div class="avatar-wrap"><div class="avatar-ring">' + svg + '</div><p class="sub">' + (g === "female" ? "gym girl avatar" : "gym bro avatar") + '</p></div>';
  }

  if (!document.getElementById("extra-ui-css")) {
    var st = document.createElement("style");
    st.id = "extra-ui-css";
    st.textContent = ".tabbar{padding-bottom:calc(10px + env(safe-area-inset-bottom,0px))}.tab[data-tab=profile]{background:none !important;color:var(--muted,#9aa7b8);box-shadow:none}.tab[data-tab=profile].on{color:#120d06 !important;background:linear-gradient(135deg,#ff9a9e,#f0c27a,#63e2b3) !important}.wrap{padding-top:calc(10px + env(safe-area-inset-top,0px));padding-bottom:calc(118px + env(safe-area-inset-bottom,0px))}.modal{position:fixed;inset:0;z-index:40;background:#02040ccc;display:grid;place-items:end center;padding:12px}.modal .sheet{width:min(460px,100%);max-height:92dvh;overflow:auto;background:#0b1220;border-radius:24px;padding:16px}.tip{position:absolute;background:#0b1220;border:1px solid #38bdf8;color:#e0f2fe;border-radius:14px;padding:8px 10px;font-size:12px;pointer-events:none;transform:translate(-50%,-120%)}.foot{text-align:center;margin:18px 0 8px;color:#9aa7b8;font-size:12px}.foot a{color:#7dd3fc;margin:0 8px;text-decoration:none}.seg{display:flex;gap:8px}.seg button{flex:1;min-height:44px;border-radius:999px;border:1px solid rgba(56,189,248,.3);background:transparent;color:#fff}.seg button.on{background:linear-gradient(135deg,#38bdf8,#818cf8);color:#041018}.avatar-wrap{text-align:center;margin:6px 0 10px}.avatar-ring{width:128px;height:128px;margin:0 auto;border-radius:50%;padding:3px;background:linear-gradient(135deg,#ff8bd4,#f0c27a,#63e2b3);box-shadow:0 0 24px rgba(255,139,212,.25)}.avatar-ring svg{width:122px;height:122px;border-radius:50%;display:block;background:#0b1220}";
    document.head.appendChild(st);
  }

  function clearProfileTab() {
    var pv = el("view-profile"); if (pv) pv.classList.add("hidden");
    var tb = document.querySelector('.tab[data-tab="profile"]');
    if (tb) tb.classList.remove("on");
  }
  function ensureFooter() {
    if (el("sidhiFoot")) return;
    var f = document.createElement("div"); f.id = "sidhiFoot"; f.className = "foot";
    f.innerHTML = "<b>SIDHI GYM TRACKER</b><div>Built with ❤️ by Harry</div><div><a href=\"https://www.instagram.com/harryashu_/\" target=\"_blank\" rel=\"noopener\">Instagram</a><a href=\"https://t.me/SANATANI_BACHA\" target=\"_blank\" rel=\"noopener\">Telegram</a><a href=\"https://github.com/SIDHIMUSIC\" target=\"_blank\" rel=\"noopener\">GitHub</a></div><div>© 2026 SIDHI GYM TRACKER. All rights reserved.</div>";
    if (el("app")) el("app").appendChild(f);
  }
  function ensureProfileTab() {
    var bar = el("tabbar");
    if (bar && !bar.querySelector('[data-tab="profile"]')) {
      var b = document.createElement("button");
      b.className = "tab"; b.type = "button"; b.dataset.tab = "profile"; b.textContent = "profile";
      bar.appendChild(b);
      b.addEventListener("click", function (e) { e.preventDefault(); showProfile(); });
    }
    if (!el("view-profile")) {
      var v = document.createElement("div"); v.id = "view-profile"; v.className = "hidden";
      if (el("app")) el("app").appendChild(v);
    }
    if (typeof showTab === "function" && !showTab._pf) {
      var _st = showTab;
      showTab = function (name) { clearProfileTab(); _st(name); };
      showTab._pf = true;
    }
  }
  function showProfile() {
    ["home","workout","progress","history"].forEach(function (t) {
      var n = el("view-" + t); if (n) n.classList.add("hidden");
      var tb = document.querySelector('.tab[data-tab="' + t + '"]');
      if (tb) tb.classList.remove("on");
    });
    var pv = el("view-profile"); if (pv) pv.classList.remove("hidden");
    var ptab = document.querySelector('.tab[data-tab="profile"]');
    if (ptab) ptab.classList.add("on");
    var opts = window.SIDHI_DAY_OPTIONS || OPTIONS;
    var row = typeof todayRow === "function" ? todayRow() : null;
    var w = row && (row.afterTreadmillWeight || row.entryWeight);
    var since = profile.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-IN") : "—";
    var sched = DAYS.map(function (d) {
      var val = (profile.schedule && profile.schedule[d]) || (typeof SPLIT === "object" ? SPLIT[d] : opts[DAYS.indexOf(d)]);
      return "<label>" + d + "</label><select data-sch=\"" + d + "\">" + opts.map(function (o) {
        return "<option" + (val === o ? " selected" : "") + ">" + o + "</option>";
      }).join("") + "</select>";
    }).join("");
    el("view-profile").innerHTML =
      '<div class="glass card" style="text-align:center">' + avatarHtml() +
      '<p class="badge">PROFILE</p><h2>' + firstName() + '</h2><p class="sub">@' + (username || "") + ' • ' + (profile.gender || "") + '</p>' +
      '<div class="kv"><span>member since</span><b>' + since + '</b></div>' +
      '<div class="kv"><span>workouts</span><b>' + ((typeof sessions !== "undefined" ? sessions.filter(function (s) { return s.finished; }).length : 0)) + '</b></div>' +
      '<div class="kv"><span>weight</span><b>' + (w != null ? w + " kg" : "—") + '</b></div></div>' +
      '<div class="glass card"><h2>edit profile</h2><label>full name</label><input id="pfName" value="' + (profile.displayName || "") + '" /><label>gender</label><div class="seg" id="pfGen"><button type="button" data-g="male" class="' + (profile.gender === "male" ? "on" : "") + '">Male</button><button type="button" data-g="female" class="' + (profile.gender === "female" ? "on" : "") + '">Female</button></div><button class="btn ok full" id="pfSave" style="margin-top:12px">save changes</button></div>' +
      '<div class="glass card"><h2>choose official plan day</h2>' + sched + '<button class="btn full" id="pfSched" style="margin-top:12px">save schedule</button></div>';
    document.querySelectorAll("#pfGen button").forEach(function (b) {
      b.onclick = function () {
        document.querySelectorAll("#pfGen button").forEach(function (x) { x.classList.remove("on"); });
        b.classList.add("on");
        profile.gender = b.dataset.g;
        var ring = document.querySelector(".avatar-wrap");
        if (ring) ring.outerHTML = avatarHtml();
      };
    });
    var sv = el("pfSave");
    if (sv) sv.onclick = async function () {
      var gbtn = document.querySelector("#pfGen button.on");
      try {
        var data = await api("/api/me", { method: "PATCH", body: { displayName: el("pfName").value, gender: gbtn ? gbtn.dataset.g : "" } });
        profile.displayName = data.displayName; profile.gender = data.gender;
        if (el("hello")) el("hello").textContent = greetText();
        toast("Profile saved"); showProfile();
      } catch (e) { toast(e.message); }
    };
    var ss = el("pfSched");
    if (ss) ss.onclick = async function () {
      var obj = {};
      document.querySelectorAll("[data-sch]").forEach(function (s) { obj[s.dataset.sch] = s.value; });
      try {
        var data = await api("/api/me", { method: "PATCH", body: { schedule: obj } });
        profile.schedule = data.schedule || obj; applySplit();
        if (typeof paintHome === "function") paintHome();
        toast("Schedule saved");
      } catch (e) { toast(e.message); }
    };
  }
  function signupModal() {
    if (el("regModal")) { el("regModal").classList.remove("hidden"); return; }
    var m = document.createElement("div"); m.id = "regModal"; m.className = "modal";
    m.innerHTML = '<div class="sheet"><p class="badge">CREATE ACCOUNT</p><label>full name</label><input id="regName" placeholder="Enter your name" /><label>username</label><input id="regUser" autocomplete="username" /><label>password</label><input id="regPass" type="password" autocomplete="new-password" /><label>gender</label><div class="seg" id="regGen"><button type="button" data-g="male" class="on">Male</button><button type="button" data-g="female">Female</button></div><p class="sub" id="regErr"></p><button class="btn ok full" id="regGo" style="margin-top:12px">create</button><button class="btn ghost full" id="regClose" style="margin-top:8px">cancel</button></div>';
    document.body.appendChild(m);
    document.querySelectorAll("#regGen button").forEach(function (b) {
      b.onclick = function () { document.querySelectorAll("#regGen button").forEach(function (x) { x.classList.remove("on"); }); b.classList.add("on"); };
    });
    el("regClose").onclick = function () { m.classList.add("hidden"); };
    el("regGo").onclick = async function () {
      var name = el("regName").value.trim();
      var user = el("regUser").value.trim().toLowerCase();
      var pass = el("regPass").value;
      var g = (document.querySelector("#regGen button.on") || {}).dataset.g || "male";
      if (user.length < 2) { el("regErr").textContent = "Username too short"; return; }
      if (pass.length < 4) { el("regErr").textContent = "Password min 4"; return; }
      try {
        await api("/api/register", { method: "POST", body: { username: user, password: pass, displayName: name, gender: g } });
        el("loginUser").value = user; el("loginPass").value = pass;
        m.classList.add("hidden"); if (typeof login === "function") login();
      } catch (e) { el("regErr").textContent = e.message; }
    };
  }
  var setup = el("setupBtn");
  if (setup) setup.addEventListener("click", function (e) { e.preventDefault(); e.stopImmediatePropagation(); signupModal(); }, true);
  if (typeof paintHome === "function") {
    var _ph = paintHome;
    paintHome = function () { applySplit(); clearProfileTab(); _ph(); if (el("hello")) el("hello").textContent = greetText(); };
  }
  if (typeof afterAuth === "function") {
    var _aa = afterAuth;
    afterAuth = async function () {
      await _aa();
      try {
        var me = await api("/api/me");
        profile.displayName = me.displayName || "";
        profile.gender = me.gender || "";
        profile.schedule = me.schedule || {};
        profile.createdAt = me.createdAt;
        applySplit();
        if (el("hello")) el("hello").textContent = greetText();
      } catch (e) {}
      ensureFooter(); ensureProfileTab();
    };
  }
  ensureFooter(); ensureProfileTab();
})();
