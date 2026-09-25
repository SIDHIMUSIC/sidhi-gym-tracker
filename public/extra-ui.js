(function () {
  var profile = { displayName: "", gender: "", schedule: {}, createdAt: null };
  var todaySwap = localStorage.getItem("sidhi-today-swap") || "";
  var OPTIONS = ["Chest + Triceps","Back + Biceps","Shoulders + Legs","Legs","Chest","Back","Shoulders","Arms","Abs","Cardio","Running","Rest","Custom Workout"];
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

  if (!document.getElementById("extra-ui-css")) {
    var st = document.createElement("style");
    st.id = "extra-ui-css";
    st.textContent = ".tabbar{padding-bottom:calc(10px + env(safe-area-inset-bottom,0px))}.wrap{padding-top:calc(10px + env(safe-area-inset-top,0px));padding-bottom:calc(118px + env(safe-area-inset-bottom,0px))}#gate{min-height:100dvh;padding-top:calc(18px + env(safe-area-inset-top,0px));padding-bottom:calc(18px + env(safe-area-inset-bottom,0px))}.modal{position:fixed;inset:0;z-index:40;background:#02040ccc;display:grid;place-items:end center;padding:12px}.modal .sheet{width:min(460px,100%);max-height:92dvh;overflow:auto;background:#0b1220;border:1px solid rgba(56,189,248,.25);border-radius:24px 24px 16px 16px;padding:16px 16px calc(16px + env(safe-area-inset-bottom,0px))}.tip{position:absolute;background:#0b1220;border:1px solid #38bdf8;color:#e0f2fe;border-radius:14px;padding:8px 10px;font-size:12px;pointer-events:none;transform:translate(-50%,-120%)}.foot{text-align:center;margin:18px 0 8px;color:#9aa7b8;font-size:12px}.foot a{color:#7dd3fc;margin:0 8px;text-decoration:none}.seg{display:flex;gap:8px}.seg button{flex:1;min-height:44px;border-radius:999px;border:1px solid rgba(56,189,248,.3);background:transparent;color:#fff}.seg button.on{background:linear-gradient(135deg,#38bdf8,#818cf8);color:#041018}.g-hit{touch-action:manipulation}";
    document.head.appendChild(st);
  }
  if (!document.querySelector('meta[name="apple-mobile-web-app-capable"]')) {
    var m1 = document.createElement("meta"); m1.name = "apple-mobile-web-app-capable"; m1.content = "yes"; document.head.appendChild(m1);
    var m2 = document.createElement("meta"); m2.name = "apple-mobile-web-app-status-bar-style"; m2.content = "black-translucent"; document.head.appendChild(m2);
    var vp = document.querySelector('meta[name="viewport"]');
    if (vp) vp.setAttribute("content", "width=device-width, initial-scale=1, viewport-fit=cover");
  }

  function ensureFooter() {
    if (el("sidhiFoot")) return;
    var f = document.createElement("div");
    f.id = "sidhiFoot";
    f.className = "foot";
    f.innerHTML = "<b>SIDHI GYM TRACKER</b><div>Built with ❤️ by Harry</div><div><a href=\"https://www.instagram.com/harryashu_/\" target=\"_blank\" rel=\"noopener\">Instagram</a><a href=\"https://t.me/SANATANI_BACHA\" target=\"_blank\" rel=\"noopener\">Telegram</a><a href=\"https://github.com/SIDHIMUSIC\" target=\"_blank\" rel=\"noopener\">GitHub</a></div><div>© 2026 SIDHI GYM TRACKER. All rights reserved.</div>";
    var app = el("app");
    if (app) app.appendChild(f);
  }

  function ensureProfileTab() {
    var bar = el("tabbar");
    if (bar && !bar.querySelector('[data-tab="profile"]')) {
      var b = document.createElement("button");
      b.className = "tab"; b.dataset.tab = "profile"; b.textContent = "profile";
      bar.appendChild(b);
      b.onclick = function () { showProfile(); };
    }
    if (!el("view-profile")) {
      var v = document.createElement("div");
      v.id = "view-profile"; v.className = "hidden";
      var app = el("app");
      if (app) app.appendChild(v);
    }
  }

  function showProfile() {
    ["home","workout","progress","history","profile"].forEach(function (t) {
      var n = el("view-" + t); if (n) n.classList.toggle("hidden", t !== "profile");
      var tb = document.querySelector('.tab[data-tab="' + t + '"]');
      if (tb) tb.classList.toggle("on", t === "profile");
    });
    var row = typeof todayRow === "function" ? todayRow() : null;
    var w = row && (row.afterTreadmillWeight || row.entryWeight);
    var since = profile.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-IN") : "—";
    var sched = DAYS.map(function (d) {
      var val = (profile.schedule && profile.schedule[d]) || (typeof SPLIT === "object" ? SPLIT[d] : "");
      return "<label>" + d + "</label><select data-sch=\"" + d + "\">" + OPTIONS.map(function (o) {
        return "<option" + (val === o || (val && val.toLowerCase().indexOf(o.split("+")[0].trim().toLowerCase()) >= 0 && o.length > 4) ? " selected" : "") + ">" + o + "</option>";
      }).join("") + "</select>";
    }).join("");
    el("view-profile").innerHTML =
      '<div class="glass card"><p class="badge">PROFILE</p><h2>' + firstName() + '</h2><p class="sub">@' + (username || "") + ' • ' + (profile.gender || "") + '</p>' +
      '<div class="kv"><span>member since</span><b>' + since + '</b></div>' +
      '<div class="kv"><span>workouts</span><b>' + ((typeof sessions !== "undefined" ? sessions.filter(function (s) { return s.finished; }).length : 0)) + '</b></div>' +
      '<div class="kv"><span>weight</span><b>' + (w != null ? w + " kg" : "—") + '</b></div></div>' +
      '<div class="glass card"><h2>edit profile</h2><label>full name</label><input id="pfName" value="' + (profile.displayName || "") + '" /><label>gender</label><div class="seg" id="pfGen"><button type="button" data-g="male" class="' + (profile.gender === "male" ? "on" : "") + '">Male</button><button type="button" data-g="female" class="' + (profile.gender === "female" ? "on" : "") + '">Female</button></div><button class="btn ok full" id="pfSave" style="margin-top:12px">save changes</button></div>' +
      '<div class="glass card"><h2>choose workout schedule</h2>' + sched + '<button class="btn full" id="pfSched" style="margin-top:12px">save schedule</button></div>';
    document.querySelectorAll("#pfGen button").forEach(function (b) {
      b.onclick = function () { document.querySelectorAll("#pfGen button").forEach(function (x) { x.classList.remove("on"); }); b.classList.add("on"); };
    });
    var sv = el("pfSave");
    if (sv) sv.onclick = async function () {
      var gbtn = document.querySelector("#pfGen button.on");
      try {
        var data = await api("/api/me", { method: "PATCH", body: { displayName: el("pfName").value, gender: gbtn ? gbtn.dataset.g : "" } });
        profile.displayName = data.displayName; profile.gender = data.gender;
        if (el("hello")) el("hello").textContent = greetText();
        toast("Profile saved");
      } catch (e) { toast(e.message); }
    };
    var ss = el("pfSched");
    if (ss) ss.onclick = async function () {
      var obj = {};
      document.querySelectorAll("[data-sch]").forEach(function (s) { obj[s.dataset.sch] = s.value; });
      try {
        var data = await api("/api/me", { method: "PATCH", body: { schedule: obj } });
        profile.schedule = data.schedule || obj;
        applySplit();
        if (typeof paintHome === "function") paintHome();
        toast("Schedule saved");
      } catch (e) { toast(e.message); }
    };
  }

  function signupModal() {
    if (el("regModal")) { el("regModal").classList.remove("hidden"); return; }
    var m = document.createElement("div");
    m.id = "regModal"; m.className = "modal";
    m.innerHTML = '<div class="sheet"><p class="badge">CREATE ACCOUNT</p><label>full name</label><input id="regName" placeholder="Enter your name" /><label>username</label><input id="regUser" placeholder="Choose a username" autocomplete="username" /><label>password</label><input id="regPass" type="password" placeholder="Create password" autocomplete="new-password" /><label>gender</label><div class="seg" id="regGen"><button type="button" data-g="male" class="on">Male</button><button type="button" data-g="female">Female</button></div><p class="sub" id="regErr"></p><button class="btn ok full" id="regGo" style="margin-top:12px">create</button><button class="btn ghost full" id="regClose" style="margin-top:8px">cancel</button></div>';
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
        el("regGo").textContent = "creating...";
        await api("/api/register", { method: "POST", body: { username: user, password: pass, displayName: name, gender: g } });
        el("loginUser").value = user; el("loginPass").value = pass;
        m.classList.add("hidden");
        toast("Account created. Login.");
        if (typeof login === "function") login();
      } catch (e) { el("regErr").textContent = e.message; }
      el("regGo").textContent = "create";
    };
  }

  var setup = el("setupBtn");
  if (setup) {
    setup.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      signupModal();
    }, true);
  }

  if (typeof drawChart === "function") {
    var _dc = drawChart;
    drawChart = function (canvas, rows) {
      _dc(canvas, rows);
      if (!canvas) return;
      var pts = (rows || []).filter(function (s) { return s.entryWeight != null; }).slice().sort(function (a, b) { return a.date.localeCompare(b.date); }).slice(-14);
      canvas._pts = pts;
      if (canvas.dataset.hit) return;
      canvas.dataset.hit = "1";
      canvas.classList.add("g-hit");
      canvas.style.touchAction = "manipulation";
      function hit(ev) {
        var r = canvas.getBoundingClientRect();
        var x = ((ev.touches ? ev.touches[0].clientX : ev.clientX) - r.left) * (canvas.width / r.width);
        var list = canvas._pts || [];
        if (!list.length) return;
        var i = Math.round((x - 24) / ((canvas.width - 50) / Math.max(list.length - 1, 1)));
        i = Math.max(0, Math.min(list.length - 1, i));
        var p = list[i];
        var prev = i ? list[i - 1] : null;
        var d = prev ? Math.round((Number(p.entryWeight) - Number(prev.entryWeight)) * 1000) / 1000 : null;
        var tip = canvas.parentNode.querySelector(".tip") || document.createElement("div");
        tip.className = "tip";
        tip.textContent = p.date + "  •  " + p.entryWeight + " kg" + (p.entryTime ? "  •  " + p.entryTime : "") + (d != null ? "  •  " + (d > 0 ? "+" : "") + d + " kg" : "");
        canvas.parentNode.style.position = "relative";
        canvas.parentNode.appendChild(tip);
        tip.style.left = ((ev.touches ? ev.touches[0].clientX : ev.clientX) - r.left) + "px";
        tip.style.top = "8px";
      }
      canvas.addEventListener("click", hit);
      canvas.addEventListener("touchstart", hit, { passive: true });
    };
  }

  if (typeof greet === "function") {
    greet = function () { return greetText().replace(/,.*/, "").split(" ")[0] + " " + greetText().split(" ")[1]; };
  }
  if (typeof paintHome === "function") {
    var _ph = paintHome;
    paintHome = function () {
      applySplit();
      _ph();
      if (el("hello")) el("hello").textContent = greetText();
      var swap = el("todaySwap");
      if (!swap && el("homeSplit")) {
        var btn = document.createElement("button");
        btn.id = "todaySwap"; btn.className = "btn ghost full"; btn.style.marginTop = "8px";
        btn.textContent = "change today's workout";
        el("homeSplit").parentNode.appendChild(btn);
        btn.onclick = function () {
          var v = prompt("Today workout", el("homeSplit").textContent || "");
          if (!v) return;
          todaySwap = v; localStorage.setItem("sidhi-today-swap", v);
          applySplit(); paintHome();
        };
      }
    };
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
        if (me.goalWeight != null) goalWeight = me.goalWeight;
        applySplit();
        if (el("hello")) el("hello").textContent = greetText();
      } catch (e) {}
      ensureFooter(); ensureProfileTab();
    };
  }

  ensureFooter();
  ensureProfileTab();
  document.addEventListener("focusin", function (e) {
    if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) {
      setTimeout(function () { try { e.target.scrollIntoView({ block: "center", behavior: "smooth" }); } catch (err) {} }, 300);
    }
  });
})();
