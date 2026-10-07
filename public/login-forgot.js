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
    var m = document.createElement("div");
    m.id = "forgotSheet";
    m.style.cssText = "position:fixed;inset:0;z-index:99999;background:rgba(2,6,14,.78);display:flex;align-items:flex-end;justify-content:center;padding:16px";
    m.innerHTML = '<div style="width:min(420px,100%);background:#121a2b;border-radius:24px;padding:18px;border:1px solid rgba(255,255,255,.12)">' + html + '<p id="fgNote" class="sub" style="margin-top:10px;color:#ffe4b5"></p></div>';
    document.body.appendChild(m);
  }
  function mark() {
    var p = document.getElementById("fgPass");
    var u = document.getElementById("fgUser");
    if (!p || !u) return;
    p.style.outline = mode === "pass" ? "2px solid #fff" : "0";
    u.style.outline = mode === "user" ? "2px solid #fff" : "0";
    p.style.opacity = mode === "pass" ? "1" : ".55";
    u.style.opacity = mode === "user" ? "1" : ".55";
  }
  function openMenu() {
    sheet(
      '<p class="badge">FORGOT</p>' +
      '<div style="display:flex;gap:8px;margin-top:12px">' +
      '<button type="button" id="fgAdmin" class="btn ghost" style="flex:1">message admin</button>' +
      '<button type="button" id="fgMailBtn" class="btn ghost" style="flex:1">email verify</button>' +
      '</div>' +
      '<button type="button" id="fgNo" class="btn ghost full" style="margin-top:8px">cancel</button>'
    );
  }
  function openEmail() {
    sheet(
      '<p class="badge">EMAIL VERIFY</p>' +
      '<input id="fgKey" placeholder="saved email / username / user id" />' +
      '<div style="display:flex;gap:8px;margin-top:8px">' +
      '<button type="button" id="fgPass" class="btn ghost" style="flex:1">password</button>' +
      '<button type="button" id="fgUser" class="btn ghost" style="flex:1">username</button>' +
      '</div>' +
      '<button type="button" id="fgSend" class="btn ghost full" style="margin-top:8px">send otp</button>' +
      '<input id="fgCode" inputmode="numeric" placeholder="6 digit otp" style="margin-top:8px" />' +
      '<div id="fgPassBox" style="display:flex;gap:8px;margin-top:8px"><input id="fgNew" type="password" placeholder="new password" style="flex:1" /><button type="button" id="fgEye" class="btn ghost">show</button></div>' +
      '<button type="button" id="fgReset" class="btn ghost full" style="margin-top:8px">verify</button>' +
      '<button type="button" id="fgBack" class="btn ghost full" style="margin-top:8px">cancel</button>'
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
  setInterval(function () {
    document.querySelectorAll("#gate .forgot, #forgotBtn, .forgot").forEach(function (n) {
      n.onclick = function (ev) { if (ev) { ev.preventDefault(); ev.stopPropagation(); } openMenu(); };
    });
    document.querySelectorAll("body *").forEach(function (n) {
      if (n.id === "forgotSheet") return;
      if ((n.innerText || "").indexOf("chala jayega") >= 0 && n.querySelector && n.querySelector("button")) openMenu();
    });
  }, 600);
})();
