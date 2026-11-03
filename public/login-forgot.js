(function () {
  var TG = "https://t.me/SANATANI_BACCHA";
  var mode = "pass";
  function uid(name) {
    var s = String(name || "").toLowerCase();
    var n = 2166136261;
    for (var i = 0; i < s.length; i++) n = Math.imul(n ^ s.charCodeAt(i), 16777619);
    return "S" + (n >>> 0).toString(16).toUpperCase().padStart(8, "0").slice(0, 8);
  }
  function note(msg) {
    var n = document.getElementById("fgNote");
    if (n) n.textContent = msg;
  }
  function spin(title, sub) {
    if (!document.getElementById("fgSpinCss")) {
      var st = document.createElement("style");
      st.id = "fgSpinCss";
      st.textContent = "@keyframes fgTurn{to{transform:rotate(360deg)}}#fgSpin{position:absolute;inset:0;border-radius:24px;background:rgba(8,12,22,.92);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:14px;z-index:2}#fgRing{width:84px;height:84px;border-radius:50%;border:3px solid rgba(255,255,255,.12);border-top-color:#f0c27a;animation:fgTurn .8s linear infinite}#fgSpin b{color:#f6f1e8;font:700 15px Comfortaa,sans-serif}#fgSpin span{color:#9fb0c3;font-size:12px}";
      document.head.appendChild(st);
    }
    var box = document.querySelector("#forgotSheet > div");
    if (!box) return;
    box.style.position = "relative";
    var old = document.getElementById("fgSpin");
    if (old) old.remove();
    var el = document.createElement("div");
    el.id = "fgSpin";
    el.innerHTML = '<div id="fgRing"></div><b>' + title + '</b><span>' + (sub || "") + '</span>';
    box.appendChild(el);
  }
  function stopSpin() {
    var el = document.getElementById("fgSpin");
    if (el) el.remove();
  }
  function closeSheet() {
    var old = document.getElementById("forgotSheet");
    if (old) old.remove();
  }
  function sheet(html) {
    closeSheet();
    if (!document.getElementById("fgSheetCss")) {
      var st = document.createElement("style");
      st.id = "fgSheetCss";
      st.textContent =
        "#forgotSheet{position:fixed;inset:0;z-index:99999;background:rgba(2,6,14,.64);backdrop-filter:blur(9px);-webkit-backdrop-filter:blur(9px);display:flex;align-items:flex-end;justify-content:center;padding:12px 12px calc(12px + env(safe-area-inset-bottom,0px))}" +
        "#forgotSheet .fg-panel{position:relative;width:min(460px,100%);max-height:min(84dvh,720px);overflow:auto;overscroll-behavior:contain;background:linear-gradient(155deg,#172238,#101827 62%,#0c1421);border:1px solid rgba(148,163,184,.22);border-radius:28px;padding:20px 18px 18px;box-shadow:0 24px 70px #0009,inset 0 1px 0 #ffffff12}" +
        "#forgotSheet .fg-panel:before{content:'';display:block;width:42px;height:4px;border-radius:9px;background:#64748b88;margin:0 auto 16px}" +
        "#forgotSheet .fg-panel input{min-height:54px;border-radius:18px;background:#09111d;border:1px solid #ffffff20;padding:14px 16px;color:#f8fafc;width:100%;font:500 15px Comfortaa,sans-serif;outline:none}" +
        "#forgotSheet .fg-panel input:focus{border-color:#7dd3fc;box-shadow:0 0 0 3px #38bdf822}" +
        "#forgotSheet .fg-panel .btn{min-height:48px;border-radius:16px;letter-spacing:.04em;font-size:12px;transition:transform .16s ease,filter .16s ease}" +
        "#forgotSheet .fg-panel .btn:active{transform:scale(.985)}" +
        "#forgotSheet .fg-mode{background:#202a3c!important;border:1px solid #ffffff18!important;color:#aab6c7!important}" +
        "#forgotSheet .fg-mode.active{background:linear-gradient(135deg,#dbeafe,#a5b4fc)!important;color:#111827!important;border-color:#bfdbfe!important;box-shadow:0 5px 16px #818cf844!important}" +
        "#forgotSheet .fg-send{background:linear-gradient(135deg,#f5d79a,#e9ae5a)!important;color:#201607!important;border:0!important;box-shadow:0 7px 18px #e9ae5a30!important}" +
        "#forgotSheet .fg-verify{background:linear-gradient(135deg,#a8edea,#63e2b3)!important;color:#04140d!important;border:0!important;box-shadow:0 7px 18px #63e2b32b!important}" +
        "#forgotSheet .fg-cancel{background:transparent!important;border:1px solid #64748b88!important;color:#cbd5e1!important;box-shadow:none!important}" +
        "#forgotSheet .fg-note{min-height:18px;font-size:12px;line-height:1.5;color:#f4d9a7!important}" +
        "#forgotSheet .fg-pass-row{display:flex;gap:8px;margin-top:10px;align-items:stretch}" +
        "#forgotSheet .fg-pass-row input{flex:1;min-width:0}" +
        "#forgotSheet .fg-eye{min-width:76px!important;flex:none}" +
        "@media(min-width:560px){#forgotSheet{align-items:center;padding:20px}}";
      document.head.appendChild(st);
    }
    var m = document.createElement("div");
    m.id = "forgotSheet";
    m.innerHTML = '<div class="fg-panel">' + html + '<p id="fgNote" class="fg-note" aria-live="polite" style="margin:12px 2px 0"></p></div>';
    m.addEventListener("click", function (e) { if (e.target === m) closeSheet(); });
    document.body.appendChild(m);
  }
  function mark() {
    var p = document.getElementById("fgPass");
    var u = document.getElementById("fgUser");
    if (!p || !u) return;
    p.classList.toggle("active", mode === "pass");
    u.classList.toggle("active", mode === "user");
  }
  function openMenu() {
    sheet(
      '<p class="badge">FORGOT</p>' +
      '<div style="display:flex;gap:8px;margin-top:12px">' +
      '<button type="button" id="fgAdmin" class="btn ghost fg-mode" style="flex:1">message admin</button>' +
      '<button type="button" id="fgMailBtn" class="btn ghost fg-mode active" style="flex:1">email verify</button>' +
      '</div>' +
      '<button type="button" id="fgNo" class="btn ghost fg-cancel full" style="margin-top:10px">cancel</button>'
    );
  }
  function openEmail() {
    sheet(
      '<p class="badge">EMAIL VERIFY</p>' +
      '<input id="fgKey" placeholder="saved email / username / user id" />' +
      '<div style="display:flex;gap:8px;margin-top:8px">' +
      '<button type="button" id="fgPass" class="btn ghost fg-mode active" style="flex:1">password</button>' +
      '<button type="button" id="fgUser" class="btn ghost fg-mode" style="flex:1">username</button>' +
      '</div>' +
      '<button type="button" id="fgSend" class="btn fg-send full" style="margin-top:10px">send OTP</button>' +
      '<input id="fgCode" inputmode="numeric" placeholder="6 digit otp" style="margin-top:8px" />' +
      '<div id="fgPassBox" class="fg-pass-row"><input id="fgNew" type="password" autocomplete="new-password" placeholder="new password" /><button type="button" id="fgEye" class="btn ghost fg-eye">show</button></div>' +
      '<button type="button" id="fgReset" class="btn fg-verify full" style="margin-top:10px">verify</button>' +
      '<button type="button" id="fgBack" class="btn ghost fg-cancel full" style="margin-top:8px">cancel</button>'
    );
    mark();
  }
  function sendAdmin() {
    var user = ((document.getElementById("loginUser") || {}).value || "harry").trim().toLowerCase();
    closeSheet();
    window.location.href = TG + "?text=" + encodeURIComponent(["SIDHI GYM \u2014 forgot", "username: " + user, "user id: " + uid(user), "Please reset."].join("\n"));
  }
  document.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest("button") : e.target;
    if (!t) return;
    var label = (t.innerText || "").trim().toLowerCase();
    if (label === "message admin" && t.id !== "fgAdmin") {
      e.preventDefault();
      e.stopPropagation();
      openMenu();
      return;
    }
    if (!t.id) return;
    if (t.id === "fgNo" || t.id === "fgBack") { e.preventDefault(); closeSheet(); }
    if (t.id === "fgAdmin") { e.preventDefault(); sendAdmin(); }
    if (t.id === "fgMailBtn") { e.preventDefault(); openEmail(); }
    if (t.id === "fgPass") {
      e.preventDefault();
      mode = "pass";
      mark();
      var box = document.getElementById("fgPassBox");
      if (box) box.style.display = "flex";
      note("password reset selected");
    }
    if (t.id === "fgUser") {
      e.preventDefault();
      mode = "user";
      mark();
      var box2 = document.getElementById("fgPassBox");
      if (box2) box2.style.display = "none";
      note("username selected");
    }
    if (t.id === "fgEye") {
      e.preventDefault();
      var p = document.getElementById("fgNew");
      if (!p) return;
      p.type = p.type === "password" ? "text" : "password";
      t.textContent = p.type === "password" ? "show" : "hide";
    }
    if (t.id === "fgSend") {
      e.preventDefault();
      spin("account finding", "saved email dhoondh rahe");
      fetch("/api/otp/reset-start", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ key: (document.getElementById("fgKey").value || "").trim() }) })
        .then(function (r) { return r.json().then(function (d) { if (!r.ok) throw new Error(d.error || "fail"); return d; }); })
        .then(function (d) {
          spin("otp sent", d.hint || "email");
          setTimeout(function () { stopSpin(); note("code daalo"); }, 1100);
        })
        .catch(function (err) { stopSpin(); note(err.message || "OTP fail"); });
    }
    if (t.id === "fgReset") {
      e.preventDefault();
      var key = (document.getElementById("fgKey").value || "").trim();
      var code = (document.getElementById("fgCode").value || "").trim();
      note("1. code check");
      if (mode === "user") {
        fetch("/api/otp/who", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ key: key, code: code }) })
          .then(function (r) { return r.json().then(function (d) { if (!r.ok) throw new Error(d.error || "fail"); return d; }); })
          .then(function (d) { note("2. OTP sahi. Username: " + d.username); })
          .catch(function (err) { note(err.message || "OTP galat"); });
        return;
      }
      note("1. code check  2. password save");
      fetch("/api/otp/reset-finish", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ key: key, code: code, password: document.getElementById("fgNew").value || "" }) })
        .then(function (r) { return r.json().then(function (d) { if (!r.ok) throw new Error(d.error || "fail"); return d; }); })
        .then(function (d) { note("3. ho gaya. Login: " + d.username); setTimeout(closeSheet, 1200); })
        .catch(function (err) { note(err.message || "reset fail"); });
    }
  }, true);
  var forgotButton = document.getElementById("forgotBtn");
  if (forgotButton && !forgotButton._forgotBound) {
    forgotButton._forgotBound = true;
    forgotButton.addEventListener("click", function (ev) { ev.preventDefault(); ev.stopPropagation(); openMenu(); });
  }
  document.addEventListener("keydown", function (ev) { if (ev.key === "Escape") closeSheet(); });
})();
