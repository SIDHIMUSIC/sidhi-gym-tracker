(function () {
  var TG = "https://t.me/SANATANI_BACCHA";
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
  function closeSheet() {
    var old = document.getElementById("forgotSheet");
    if (old) old.remove();
  }
  function sheet(html) {
    closeSheet();
    var m = document.createElement("div");
    m.id = "forgotSheet";
    m.style.cssText = "position:fixed;inset:0;z-index:99999;background:rgba(2,6,14,.78);display:flex;align-items:flex-end;justify-content:center;padding:16px";
    m.innerHTML = '<div style="width:min(420px,100%);background:#121a2b;border-radius:24px;padding:18px;border:1px solid rgba(56,189,248,.28)">' + html + '<p id="fgNote" class="sub" style="margin-top:8px;color:#ffd27a"></p></div>';
    document.body.appendChild(m);
  }
  function openMenu() {
    sheet(
      '<p class="badge">FORGOT</p>' +
      '<p class="sub">Admin ko message, ya email se verify.</p>' +
      '<div style="display:flex;gap:8px;margin-top:12px">' +
      '<button type="button" id="fgAdmin" class="btn" style="flex:1">message admin</button>' +
      '<button type="button" id="fgMailBtn" class="btn" style="flex:1">email verify</button>' +
      '</div>' +
      '<button type="button" id="fgNo" class="btn ghost full" style="margin-top:8px">cancel</button>'
    );
  }
  function openEmail() {
    sheet(
      '<p class="badge">EMAIL VERIFY</p>' +
      '<input id="fgKey" placeholder="saved email / username / user id" />' +
      '<div style="display:flex;gap:8px;margin-top:8px">' +
      '<button type="button" id="fgPass" class="btn" style="flex:1">password</button>' +
      '<button type="button" id="fgUser" class="btn ghost" style="flex:1">username</button>' +
      '</div>' +
      '<button type="button" id="fgSend" class="btn full" style="margin-top:8px">send otp</button>' +
      '<input id="fgCode" inputmode="numeric" placeholder="6 digit otp" style="margin-top:8px" />' +
      '<div style="display:flex;gap:8px;margin-top:8px"><input id="fgNew" type="password" placeholder="new password" style="flex:1" /><button type="button" id="fgEye" class="btn ghost">show</button></div>' +
      '<button type="button" id="fgReset" class="btn full" style="margin-top:8px">verify</button>' +
      '<button type="button" id="fgBack" class="btn ghost full" style="margin-top:8px">cancel</button>'
    );
  }
  function sendAdmin() {
    var user = ((document.getElementById("loginUser") || {}).value || "harry").trim().toLowerCase();
    closeSheet();
    window.location.href = TG + "?text=" + encodeURIComponent(["SIDHI GYM \u2014 forgot", "username: " + user, "user id: " + uid(user), "Please reset."].join("\n"));
  }
  var mode = "pass";
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
    if (t.id === "fgPass") { e.preventDefault(); mode = "pass"; note("password reset"); }
    if (t.id === "fgUser") { e.preventDefault(); mode = "user"; note("username dhundho"); }
    if (t.id === "fgEye") {
      e.preventDefault();
      var p = document.getElementById("fgNew");
      if (!p) return;
      p.type = p.type === "password" ? "text" : "password";
      t.textContent = p.type === "password" ? "show" : "hide";
    }
    if (t.id === "fgSend") {
      e.preventDefault();
      note("bhej rahe...");
      fetch("/api/otp/reset-start", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ key: (document.getElementById("fgKey").value || "").trim() }) })
        .then(function (r) { return r.json().then(function (d) { if (!r.ok) throw new Error(d.error || "fail"); return d; }); })
        .then(function (d) { note("OTP " + (d.hint || "email") + " pe gaya"); })
        .catch(function (err) { note(err.message || "OTP fail"); });
    }
    if (t.id === "fgReset") {
      e.preventDefault();
      var key = (document.getElementById("fgKey").value || "").trim();
      var code = (document.getElementById("fgCode").value || "").trim();
      if (mode === "user") {
        fetch("/api/otp/who", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ key: key, code: code }) })
          .then(function (r) { return r.json().then(function (d) { if (!r.ok) throw new Error(d.error || "fail"); return d; }); })
          .then(function (d) { note("Username: " + d.username); })
          .catch(function (err) { note(err.message || "OTP galat"); });
        return;
      }
      fetch("/api/otp/reset-finish", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ key: key, code: code, password: document.getElementById("fgNew").value || "" }) })
        .then(function (r) { return r.json().then(function (d) { if (!r.ok) throw new Error(d.error || "fail"); return d; }); })
        .then(function (d) { closeSheet(); if (typeof toast === "function") toast("Password reset. Login: " + d.username); })
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
