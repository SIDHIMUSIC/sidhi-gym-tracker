(function () {
  var profile = { displayName: "", email: "", emailVerified: false, gender: "", schedule: {}, createdAt: null };
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
  function escHtml(value) { return String(value == null ? "" : value).replace(/[&<>"]/g, function (ch) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"' : "&quot;" })[ch]; }); }
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
    st.textContent = ".tabbar{padding-bottom:calc(10px + env(safe-area-inset-bottom,0px))}.tab[data-tab=profile]{background:none !important;color:var(--muted,#9aa7b8);box-shadow:none}.tab[data-tab=profile].on{color:#120d06 !important;background:linear-gradient(135deg,#ff9a9e,#f0c27a,#63e2b3) !important}.wrap{padding-top:calc(10px + env(safe-area-inset-top,0px));padding-bottom:calc(118px + env(safe-area-inset-bottom,0px))}.modal{position:fixed;inset:0;z-index:40;background:#02040ccc;display:grid;place-items:end center;padding:12px}.modal .sheet{width:min(460px,100%);max-height:92dvh;overflow:auto;background:#0b1220;border-radius:24px;padding:16px}.tip{position:absolute;background:#0b1220;border:1px solid #38bdf8;color:#e0f2fe;border-radius:14px;padding:8px 10px;font-size:12px;pointer-events:none;transform:translate(-50%,-120%)}.foot{text-align:center;margin:22px 0 10px;color:#9aa7b8;font-size:12px}.foot .brand{letter-spacing:.22em;font:800 11px Syne,sans-serif;color:#f0c27a}.foot .by{margin:6px 0 10px;color:#f6f1e8}.foot .links{display:flex;justify-content:center;gap:10px;margin:8px 0}.foot .links a{width:42px;height:42px;border-radius:50%;display:grid;place-items:center;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);color:#fff;text-decoration:none}.foot .copy{opacity:.7;font-size:11px}.seg{display:flex;gap:8px}.seg button{flex:1;min-height:44px;border-radius:999px;border:1px solid rgba(56,189,248,.3);background:transparent;color:#fff}.seg button.on{background:linear-gradient(135deg,#38bdf8,#818cf8);color:#041018}.avatar-wrap{text-align:center;margin:6px 0 10px}.avatar-ring{width:128px;height:128px;margin:0 auto;border-radius:50%;padding:3px;background:linear-gradient(135deg,#ff8bd4,#f0c27a,#63e2b3);box-shadow:0 0 24px rgba(255,139,212,.25)}.avatar-ring svg{width:122px;height:122px;border-radius:50%;display:block;background:#0b1220}.email-verify{margin-top:14px;padding:13px;border:1px solid rgba(99,226,179,.2);border-radius:18px;background:rgba(7,15,25,.55)}.email-status{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:12px;color:#9aa7b8;margin:6px 0 10px}.email-status b{color:#63e2b3}.email-verify input{min-width:0}.email-actions{display:flex;gap:8px;margin-top:10px}.email-actions .btn{flex:1;min-height:44px;padding:10px 12px;font-size:12px}.email-verify .email-send{background:linear-gradient(135deg,#f0c27a,#d99b45);color:#17110a;box-shadow:0 5px 16px #f0c27a2b}.email-verify .email-confirm{background:linear-gradient(135deg,#a8edea,#63e2b3);color:#04140d;box-shadow:0 5px 16px #63e2b32b}.email-verify .email-code{margin-top:10px;letter-spacing:.25em;text-align:center}.profile-quick-actions{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:16px 0 2px;padding-top:14px;border-top:1px solid rgba(255,255,255,.09)}.profile-quick-actions>span{font-size:10px;color:#8794a7}.profile-logout{display:inline-flex;align-items:center;justify-content:center;gap:9px;min-height:44px;padding:0 20px;border:1px solid rgba(255,120,120,.3);border-radius:999px;background:linear-gradient(135deg,#ff777d,#c93636);color:#fff;font-weight:800;box-shadow:0 8px 22px rgba(220,55,55,.2)}.profile-logout span{font-size:18px}.email-verify{margin-top:10px;padding:15px;border:1px solid rgba(99,226,179,.2);border-radius:20px;background:linear-gradient(145deg,rgba(9,22,32,.9),rgba(11,18,32,.95))}.email-verify label{display:block;margin:12px 0 7px;color:#c8b6ed;font-size:12px;letter-spacing:.08em}.email-verify input{width:100%;min-width:0;box-sizing:border-box}.email-verify .email-send{min-height:48px;border:1px solid rgba(240,194,122,.35);border-radius:999px;background:linear-gradient(135deg,#f0c27a,#e2a64e);color:#17110a;font-weight:800}.email-instructions{display:flex;flex-direction:column;gap:4px;margin:13px 0 4px;padding:11px 12px;border:1px solid rgba(168,237,234,.15);border-radius:13px;background:rgba(168,237,234,.055)}.email-instructions b{font-size:12px;color:#a8edea}.email-instructions span{font-size:11px;line-height:1.5;color:#9aa7b8}.otp-entry{display:flex;gap:8px;align-items:stretch}.otp-entry input{flex:1;letter-spacing:.18em;text-align:center}.otp-copy{flex:0 0 auto;min-width:92px;padding:0 12px;border:1px solid rgba(168,237,234,.3);border-radius:14px;background:linear-gradient(135deg,rgba(168,237,234,.16),rgba(99,226,179,.08));color:#a8edea;font-size:12px;font-weight:800}.email-verified-panel{display:flex;align-items:center;gap:12px;padding:14px;border:1px solid rgba(99,226,179,.28);border-radius:16px;background:rgba(99,226,179,.08)}.email-verified-icon{display:grid;place-items:center;flex:0 0 38px;height:38px;border-radius:50%;background:linear-gradient(135deg,#a8edea,#63e2b3);color:#062219;font-weight:900;font-size:21px}.email-verified-panel b{color:#a8edea}.email-verified-panel p{margin:4px 0 0;color:#aab6c6;font-size:11px;line-height:1.4}";
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
    f.innerHTML = '<div class="brand">SIDHI GYM TRACKER</div><div class="by">Built by Harry</div><div class="links">' +
      '<a href="https://www.instagram.com/harryashu_/" target="_blank" rel="noopener" aria-label="Instagram"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="#fff"/></svg></a>' +
      '<a href="https://t.me/SANATANI_BACCHA" target="_blank" rel="noopener" aria-label="Telegram"><svg width="18" height="18" viewBox="0 0 24 24" fill="#2AABEE"><path d="M21.5 4.5 2.8 11.7c-1.3.5-1.3 1.2-.2 1.5l4.8 1.5 1.8 5.6c.2.7.1 1 .9.9.6 0 .8-.3 1.1-.6l2.6-2.5 5.4 4c1 .5 1.7.3 1.9-.9l3.5-16.2c.3-1.4-.5-2-1.6-1.5z"/></svg></a>' +
      '<a href="https://github.com/SIDHIMUSIC" target="_blank" rel="noopener" aria-label="GitHub"><svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.2-3.4-1.2-.4-1.1-1-1.4-1-1.4-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.7 9.7 0 0 1 5 0c2-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.7.7 1 1.6 1 2.7 0 3.9-2.3 4.7-4.6 5 .4.3.7 1 .7 2v2.9c0 .3.2.6.7.5A10 10 0 0 0 12 2z"/></svg></a>' +
      '</div><div class="copy">© 2026 Sidhi Gym Tracker · <a href="/privacy.html">Privacy</a></div>';
    if (el("app")) el("app").appendChild(f);
  }
  function ensureProfileTab() {
    // Profile lives in the top-right header now, not in the crowded bottom navigation.
    var profileButton = el("profileBtn");
    if (profileButton && !profileButton.dataset.bound) {
      profileButton.dataset.bound = "1";
      profileButton.addEventListener("click", function (e) { e.preventDefault(); showProfile(); });
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
    ["home","workout","progress","history","premium"].forEach(function (t) {
      var n = el("view-" + t); if (n) n.classList.add("hidden");
      var tb = document.querySelector('.tab[data-tab="' + t + '"]');
      if (tb) tb.classList.remove("on");
    });
    var pv = el("view-profile"); if (pv) pv.classList.remove("hidden");
    var ptab = document.querySelector('.tab[data-tab="profile"]');
    if (ptab) ptab.classList.add("on");
    var opts = window.SIDHI_DAY_OPTIONS || OPTIONS;
    var weightRows = (typeof sessions !== "undefined" && Array.isArray(sessions) ? sessions : []).filter(function (x) {
      return Number(x.entryWeight) > 0 || Number(x.afterTreadmillWeight) > 0;
    }).slice().sort(function (a, b) { return String(a.date).localeCompare(String(b.date)); });
    var startWeightRow = weightRows.find(function (x) { return Number(x.entryWeight) > 0; }) || weightRows[0] || null;
    var latestWeightRow = weightRows.length ? weightRows[weightRows.length - 1] : null;
    var startWeight = startWeightRow ? Number(startWeightRow.entryWeight || startWeightRow.afterTreadmillWeight) : null;
    var latestWeight = latestWeightRow ? Number(latestWeightRow.afterTreadmillWeight || latestWeightRow.entryWeight) : null;
    var weightDelta = startWeight != null && latestWeight != null ? Math.round((latestWeight - startWeight) * 100) / 100 : null;
    var since = profile.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-IN") : "—";
    var sched = DAYS.map(function (d) {
      var val = (profile.schedule && profile.schedule[d]) || (typeof SPLIT === "object" ? SPLIT[d] : opts[DAYS.indexOf(d)]);
      return "<label>" + d + "</label><select data-sch=\"" + d + "\">" + opts.map(function (o) {
        return "<option" + (val === o ? " selected" : "") + ">" + o + "</option>";
      }).join("") + "</select>";
    }).join("");
    el("view-profile").innerHTML =
      '<div class="glass card" style="text-align:center">' + avatarHtml() +
      '<p class="badge">PROFILE</p><h2>' + escHtml(firstName()) + '</h2><p class="sub">@' + escHtml(username || "") + ' • ' + escHtml(profile.gender || "") + '</p>' +
      '<div class="kv"><span>email</span><b>' + (profile.email ? escHtml(profile.email) : '—') + (profile.emailVerified ? ' · ✓ verified' : ' · not verified') + '</b></div>' +
      '<div class="kv"><span>member since</span><b>' + since + '</b></div>' +
      '<div class="kv"><span>workouts</span><b>' + ((typeof sessions !== "undefined" ? sessions.filter(function (s) { return s.finished; }).length : 0)) + '</b></div>' +
      '<div class="kv"><span>starting weight</span><b>' + (startWeight != null ? startWeight + " kg" : "Add first workout") + '</b></div>' +
      '<div class="kv"><span>latest weight</span><b>' + (latestWeight != null ? latestWeight + " kg" : "—") + '</b></div>' +
      '<div class="kv"><span>change since start</span><b>' + (weightDelta != null ? (weightDelta > 0 ? "+" : "") + weightDelta + " kg" : "—") + '</b></div>' +
      '<div class="kv"><span>goal weight</span><b>' + (typeof goalWeight !== "undefined" && goalWeight != null ? goalWeight + " kg" : "—") + '</b></div>' +
      '<div class="profile-quick-actions"><button type="button" class="profile-logout" id="logoutBtn"><span>↗</span> Sign out</button><span>Quick account action</span></div></div>' +
      '<div class="glass card" id="pfEmailCard"><h2>email verification</h2>' + (profile.emailVerified ? '<div class="email-verified-panel"><div class="email-verified-icon">✓</div><div><b>Email verified successfully</b><p>@' + escHtml(username || "") + ' · Your email is now locked to this account.</p></div></div><div class="kv"><span>verified email</span><b>' + escHtml(profile.email) + '</b></div>' : '<div class="email-verify"><label>email address</label><input id="pfEmailInput" type="email" autocomplete="email" value="' + escHtml(profile.email) + '" placeholder="you@example.com" /><button type="button" class="btn email-send full" id="pfEmailSend" style="margin-top:10px">✉ Send verification code</button><div class="email-instructions"><b>Check your inbox</b><span>We will send a 6-digit code. Also check Spam or Promotions. Code expires in 10 minutes.</span></div><label>6-digit verification code</label><div class="otp-entry"><input id="pfEmailCode" inputmode="numeric" maxlength="6" autocomplete="one-time-code" placeholder="6-digit code" /><button type="button" id="pfEmailCopy" class="otp-copy">Copy code</button></div><button type="button" class="btn ok full" id="pfEmailVerify" style="margin-top:12px">✓ Verify & lock email</button><p class="sub" id="pfEmailNote">Your email becomes permanent after successful verification.</p></div>') + '</div>' + '<div class="glass card"><h2>edit profile</h2><label>full name</label><input id="pfName" value="' + (profile.displayName || "") + '" /><label>gender</label><div class="seg" id="pfGen"><button type="button" data-g="male" class="' + (profile.gender === "male" ? "on" : "") + '">Male</button><button type="button" data-g="female" class="' + (profile.gender === "female" ? "on" : "") + '">Female</button></div><button class="btn ok full" id="pfSave" style="margin-top:12px">save changes</button></div>' +
      '<div class="glass card"><h2>choose official plan day</h2>' + sched + '<button class="btn full" id="pfSched" style="margin-top:12px">save schedule</button></div>' +
      '';
    var emailCodeMatch = (window.location.hash || "").match(/^#email-code=(\d{6})$/);
    if (emailCodeMatch && !profile.emailVerified) {
      var codeInput = el("pfEmailCode");
      if (codeInput) {
        codeInput.value = emailCodeMatch[1];
        var codeNote = el("pfEmailNote");
        if (codeNote) codeNote.textContent = "✓ Code opened from your email. Check it and verify below.";
      }
      try { history.replaceState(null, "", window.location.pathname + window.location.search); } catch (e) {}
    }
    document.querySelectorAll("#pfGen button").forEach(function (b) {
      b.onclick = function () {
        document.querySelectorAll("#pfGen button").forEach(function (x) { x.classList.remove("on"); });
        b.classList.add("on");
        profile.gender = b.dataset.g;
        var ring = document.querySelector(".avatar-wrap");
        if (ring) ring.outerHTML = avatarHtml();
      };
    });
    var emailSend = el("pfEmailSend");
    if (emailSend) emailSend.onclick = async function () {
      var address = (el("pfEmailInput").value || "").trim().toLowerCase();
      if (!address) { toast("Email address daalo"); return; }
      emailSend.disabled = true;
      try {
        var sent = await api("/api/profile-email/send-otp", { method: "POST", body: { email: address } });
        var note = el("pfEmailNote"); if (note) note.textContent = "✓ Code sent to " + (sent.hint || address) + ". It expires in 10 minutes.";
        emailSend.textContent = "↻ Resend verification code";
        toast("Verification code sent. Check inbox / Spam.");
      } catch (e) { toast(e.message || "OTP send fail"); }
      finally { emailSend.disabled = false; }
    };
    var emailCopy = el("pfEmailCopy");
    if (emailCopy) emailCopy.onclick = async function () {
      var codeValue = (el("pfEmailCode").value || "").trim();
      if (!/^\d{6}$/.test(codeValue)) { toast("Enter the 6-digit code first"); return; }
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) await navigator.clipboard.writeText(codeValue);
        else {
          var temp = document.createElement("textarea"); temp.value = codeValue; document.body.appendChild(temp);
          temp.select(); document.execCommand("copy"); temp.remove();
        }
        emailCopy.textContent = "✓ Copied";
        toast("Verification code copied");
      } catch (e) { toast("Copy failed. Long-press the code to copy."); }
    };
    var emailVerify = el("pfEmailVerify");
    if (emailVerify) emailVerify.onclick = async function () {
      var address = (el("pfEmailInput").value || "").trim().toLowerCase();
      var code = (el("pfEmailCode").value || "").trim();
      if (!/^\d{6}$/.test(code)) { toast("6 digit OTP daalo"); return; }
      emailVerify.disabled = true;
      try {
        var verified = await api("/api/profile-email/verify", { method: "POST", body: { email: address, code: code } });
        profile.email = verified.email; profile.emailVerified = true;
        showProfile();
        toast(verified.confirmationEmailSent
          ? "Email verified! Confirmation email sent to your inbox."
          : "Email verified! Confirmation email could not be sent; your account is verified.");
      } catch (e) { toast(e.message || "Verification fail"); }
      finally { emailVerify.disabled = false; }
    };
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
    m.innerHTML = '<div class="sheet"><p class="badge">CREATE ACCOUNT</p><label>full name</label><input id="regName" placeholder="Enter your name" /><label>username</label><input id="regUser" autocomplete="username" /><label>password</label><input id="regPass" type="password" autocomplete="new-password" /><label>email</label><input id="regEmail" type="email" autocomplete="email" placeholder="you@gmail.com" /><button type="button" class="btn ghost full" id="regSend" style="margin-top:8px">send otp</button><label>otp</label><input id="regOtp" inputmode="numeric" maxlength="6" placeholder="6 digit code" /><label>gender</label><div class="seg" id="regGen"><button type="button" data-g="male" class="on">Male</button><button type="button" data-g="female">Female</button></div><p class="sub" id="regErr"></p><button class="btn ok full" id="regGo" style="margin-top:12px">create</button><button class="btn ghost full" id="regClose" style="margin-top:8px">cancel</button></div>';
    document.body.appendChild(m);
    document.querySelectorAll("#regGen button").forEach(function (b) {
      b.onclick = function () { document.querySelectorAll("#regGen button").forEach(function (x) { x.classList.remove("on"); }); b.classList.add("on"); };
    });
    el("regClose").onclick = function () { m.classList.add("hidden"); };
    el("regSend").onclick = async function () {
      var email = el("regEmail").value.trim().toLowerCase();
      el("regErr").textContent = "OTP bhej rahe hain";
      try {
        await api("/api/otp/send", { method: "POST", body: { email: email } });
        el("regErr").textContent = "OTP email pe chala gaya";
      } catch (e) { el("regErr").textContent = e.message; }
    };
    el("regGo").onclick = async function () {
      var name = el("regName").value.trim();
      var user = el("regUser").value.trim().toLowerCase();
      var pass = el("regPass").value;
      var email = el("regEmail").value.trim().toLowerCase();
      var otp = el("regOtp").value.trim();
      var g = (document.querySelector("#regGen button.on") || {}).dataset.g || "male";
      if (user.length < 2) { el("regErr").textContent = "Username too short"; return; }
      if (pass.length < 6) { el("regErr").textContent = "Password min 6"; return; }
      if (!email || otp.length !== 6) { el("regErr").textContent = "Email aur 6 digit OTP daalo"; return; }
      try {
        await api("/api/register", { method: "POST", body: { username: user, password: pass, displayName: name, gender: g, email: email, otp: otp } });
        el("loginUser").value = user; el("loginPass").value = pass;
        m.classList.add("hidden"); if (typeof login === "function") login();
      } catch (e) { el("regErr").textContent = e.message; }
    };
  }
  var setup = el("setupBtn");
  if (setup) setup.addEventListener("click", function (e) { e.preventDefault(); e.stopImmediatePropagation(); signupModal(); }, true);
  if (typeof paintHome === "function") {
    var _ph = paintHome;
    paintHome = function () { applySplit(); var profileOpen = !!(el("view-profile") && !el("view-profile").classList.contains("hidden")); if (!profileOpen) clearProfileTab(); _ph(); if (el("hello")) el("hello").textContent = greetText(); };
  }
  if (typeof afterAuth === "function") {
    var _aa = afterAuth;
    afterAuth = async function () {
      await _aa();
      try {
        var me = await api("/api/me");
        profile.displayName = me.displayName || "";
        profile.email = me.email || "";
        profile.emailVerified = me.emailVerified === true;
        profile.gender = me.gender || "";
        profile.schedule = me.schedule || {};
        profile.createdAt = me.createdAt;
        applySplit();
        if (el("hello")) el("hello").textContent = greetText();
      } catch (e) {}
      ensureFooter(); ensureProfileTab();
      if ((window.location.hash || "").indexOf("#email-code=") === 0) showProfile();
    };
  }
  ensureFooter(); ensureProfileTab();
})();
