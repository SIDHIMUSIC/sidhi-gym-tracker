(function () {
  function note(msg) {
    var n = document.getElementById("fgNote");
    if (n) n.textContent = msg;
    if (typeof toast === "function") toast(msg);
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
      '<button type="button" id="fgPass" class="btn full" style="margin-top:12px">password forgot</button>' +
      '<button type="button" id="fgUser" class="btn ghost full" style="margin-top:8px">username forgot</button>' +
      '<button type="button" id="fgNo" class="btn ghost full" style="margin-top:8px">cancel</button>'
    );
  }
  function openPass() {
    sheet(
      '<p class="badge">RESET PASSWORD</p>' +
      '<p class="sub">Username, user id, ya profile me saved email.</p>' +
      '<input id="fgKey" placeholder="harryashu / user id / email" />' +
      '<button type="button" id="fgSend" class="btn full" style="margin-top:12px">send otp</button>' +
      '<input id="fgCode" inputmode="numeric" placeholder="6 digit otp" style="margin-top:8px" />' +
      '<div style="display:flex;gap:8px;margin-top:8px"><input id="fgNew" type="password" placeholder="new password" style="flex:1" /><button type="button" id="fgEye" class="btn ghost">show</button></div>' +
      '<button type="button" id="fgReset" class="btn full" style="margin-top:8px">verify and reset</button>' +
      '<button type="button" id="fgBack" class="btn ghost full" style="margin-top:8px">cancel</button>'
    );
  }
  function openUser() {
    sheet(
      '<p class="badge">USERNAME FORGOT</p>' +
      '<input id="fgMail" type="email" placeholder="profile saved email" />' +
      '<button type="button" id="fgUserSend" class="btn full" style="margin-top:12px">send otp</button>' +
      '<input id="fgUserCode" inputmode="numeric" placeholder="6 digit" style="margin-top:8px" />' +
      '<button type="button" id="fgUserCheck" class="btn full" style="margin-top:8px">verify</button>' +
      '<button type="button" id="fgBack" class="btn ghost full" style="margin-top:8px">cancel</button>'
    );
  }
  document.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest("button") : e.target;
    if (!t) return;
    var label = (t.innerText || "").trim().toLowerCase();
    if (label === "message admin") { e.preventDefault(); e.stopPropagation(); openMenu(); return; }
    if (!t.id) return;
    if (t.id === "fgNo" || t.id === "fgBack") { e.preventDefault(); closeSheet(); }
    if (t.id === "fgEye") {
      e.preventDefault();
      var p = document.getElementById("fgNew");
      if (!p) return;
      p.type = p.type === "password" ? "text" : "password";
      t.textContent = p.type === "password" ? "show" : "hide";
    }
    if (t.id === "fgPass") { e.preventDefault(); openPass(); }
    if (t.id === "fgUser") { e.preventDefault(); openUser(); }
    if (t.id === "fgSend" || t.id === "fgUserSend") {
      e.preventDefault();
      var key = ((document.getElementById("fgKey") || document.getElementById("fgMail") || {}).value || "").trim();
      note("bhej rahe...");
      fetch("/api/otp/reset-start", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ key: key }) })
        .then(function (r) { return r.json().then(function (d) { if (!r.ok) throw new Error(d.error || "fail"); return d; }); })
        .then(function (d) { note("OTP " + (d.hint || "email") + " pe gaya. Inbox aur spam dekho."); })
        .catch(function (err) { note(err.message || "OTP fail"); });
    }
    if (t.id === "fgReset") {
      e.preventDefault();
      fetch("/api/otp/reset-finish", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          key: (document.getElementById("fgKey").value || "").trim(),
          code: (document.getElementById("fgCode").value || "").trim(),
          password: document.getElementById("fgNew").value || ""
        })
      }).then(function (r) { return r.json().then(function (d) { if (!r.ok) throw new Error(d.error || "fail"); return d; }); })
        .then(function (d) { closeSheet(); if (typeof toast === "function") toast("Password reset. Login: " + d.username); })
        .catch(function (err) { note(err.message || "reset fail"); });
    }
    if (t.id === "fgUserCheck") {
      e.preventDefault();
      fetch("/api/otp/who", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ key: (document.getElementById("fgMail").value || "").trim(), code: (document.getElementById("fgUserCode").value || "").trim() })
      }).then(function (r) { return r.json().then(function (d) { if (!r.ok) throw new Error(d.error || "fail"); return d; }); })
        .then(function (d) { note("Username: " + d.username); })
        .catch(function (err) { note(err.message || "OTP galat"); });
    }
  }, true);
  setInterval(function () {
    document.querySelectorAll("#gate .forgot, #forgotBtn, .forgot").forEach(function (n) {
      n.onclick = function (e) { if (e) { e.preventDefault(); e.stopPropagation(); } openMenu(); };
    });
  }, 700);
})();
