(function () {
  function closeSheet() {
    var m = document.getElementById("forgotSheet");
    if (m) m.remove();
  }
  function sheet(html) {
    closeSheet();
    var m = document.createElement("div");
    m.id = "forgotSheet";
    m.style.cssText = "position:fixed;inset:0;z-index:9999;background:rgba(2,6,14,.75);display:flex;align-items:flex-end;justify-content:center;padding:16px";
    m.innerHTML = '<div style="width:min(420px,100%);background:#121a2b;border-radius:24px;padding:18px;border:1px solid rgba(56,189,248,.28)">' + html + "</div>";
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
      '<p class="sub">Username, user id, ya saved email.</p>' +
      '<input id="fgKey" placeholder="username / user id / email" />' +
      '<button type="button" id="fgSend" class="btn full" style="margin-top:12px">send otp</button>' +
      '<input id="fgCode" inputmode="numeric" placeholder="6 digit otp" style="margin-top:8px" />' +
      '<input id="fgNew" type="password" placeholder="new password" style="margin-top:8px" />' +
      '<button type="button" id="fgReset" class="btn full" style="margin-top:8px">verify and reset</button>' +
      '<button type="button" id="fgBack" class="btn ghost full" style="margin-top:8px">cancel</button>'
    );
  }
  function openUser() {
    sheet(
      '<p class="badge">USERNAME FORGOT</p>' +
      '<p class="sub">Saved email pe OTP. Verify ke baad username dikhega.</p>' +
      '<input id="fgMail" type="email" placeholder="saved email" />' +
      '<button type="button" id="fgUserSend" class="btn full" style="margin-top:12px">send otp</button>' +
      '<input id="fgUserCode" inputmode="numeric" placeholder="6 digit" style="margin-top:8px" />' +
      '<button type="button" id="fgUserCheck" class="btn full" style="margin-top:8px">verify</button>' +
      '<button type="button" id="fgBack" class="btn ghost full" style="margin-top:8px">cancel</button>'
    );
  }
  document.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest("button") : e.target;
    if (!t || !t.id) return;
    if (t.id === "fgNo" || t.id === "fgBack") { e.preventDefault(); closeSheet(); }
    if (t.id === "fgPass") { e.preventDefault(); openPass(); }
    if (t.id === "fgUser") { e.preventDefault(); openUser(); }
    if (t.id === "fgSend" || t.id === "fgUserSend") {
      e.preventDefault();
      var key = ((document.getElementById("fgKey") || document.getElementById("fgMail") || {}).value || "").trim();
      fetch("/api/otp/reset-start", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ key: key }) })
        .then(function (r) { return r.json().then(function (d) { if (!r.ok) throw new Error(d.error || "fail"); return d; }); })
        .then(function (d) { if (typeof toast === "function") toast("OTP " + (d.hint || "email") + " pe gaya"); })
        .catch(function (err) { if (typeof toast === "function") toast(err.message || "OTP fail"); });
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
        .catch(function (err) { if (typeof toast === "function") toast(err.message || "reset fail"); });
    }
    if (t.id === "fgUserCheck") {
      e.preventDefault();
      fetch("/api/otp/who", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ key: (document.getElementById("fgMail").value || "").trim(), code: (document.getElementById("fgUserCode").value || "").trim() })
      }).then(function (r) { return r.json().then(function (d) { if (!r.ok) throw new Error(d.error || "fail"); return d; }); })
        .then(function (d) { closeSheet(); if (typeof toast === "function") toast("Username: " + d.username); })
        .catch(function (err) { if (typeof toast === "function") toast(err.message || "OTP galat"); });
    }
  }, true);
  function hook() {
    document.querySelectorAll("#gate .forgot, #forgotBtn, .forgot").forEach(function (n) {
      n.onclick = function (e) { if (e) e.preventDefault(); openMenu(); };
    });
  }
  setInterval(hook, 700);
})();
