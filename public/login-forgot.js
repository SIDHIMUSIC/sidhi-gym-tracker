(function () {
  var TG = "https://t.me/SANATANI_BACCHA";
  function uid(name) {
    var s = String(name || "").toLowerCase();
    var n = 2166136261;
    for (var i = 0; i < s.length; i++) n = Math.imul(n ^ s.charCodeAt(i), 16777619);
    return "S" + (n >>> 0).toString(16).toUpperCase().padStart(8, "0").slice(0, 8);
  }
  function closeSheet() {
    var m = document.getElementById("forgotSheet");
    if (m) m.remove();
  }
  function sheet(html) {
    closeSheet();
    var m = document.createElement("div");
    m.id = "forgotSheet";
    m.style.cssText = "position:fixed;inset:0;z-index:9999;background:rgba(2,6,14,.75);display:flex;align-items:flex-end;justify-content:center;padding:16px";
    m.innerHTML = '<div id="forgotBox" style="width:min(420px,100%);background:#121a2b;border-radius:24px;padding:18px;border:1px solid rgba(56,189,248,.28);pointer-events:auto">' + html + "</div>";
    document.body.appendChild(m);
    return m;
  }
  function sendAdmin(lines) {
    closeSheet();
    window.location.href = TG + "?text=" + encodeURIComponent(lines.join("\n"));
  }
  function openMenu() {
    sheet(
      '<p class="badge">FORGOT</p>' +
      '<button type="button" id="fgOtp" class="btn full" style="margin-top:12px">email otp</button>' +
      '<button type="button" id="fgPass" class="btn ghost full" style="margin-top:8px">password forgot</button>' +
      '<button type="button" id="fgUser" class="btn ghost full" style="margin-top:8px">username forgot</button>' +
      '<button type="button" id="fgNo" class="btn ghost full" style="margin-top:8px">cancel</button>'
    );
  }
  function openOtp() {
    sheet(
      '<p class="badge">EMAIL OTP</p>' +
      '<label>email</label><input id="fgEmail" type="email" placeholder="you@gmail.com" />' +
      '<button type="button" id="fgSend" class="btn full" style="margin-top:12px">send otp</button>' +
      '<label>6 digit</label><input id="fgCode" inputmode="numeric" />' +
      '<button type="button" id="fgCheck" class="btn full" style="margin-top:8px">verify</button>' +
      '<button type="button" id="fgBack" class="btn ghost full" style="margin-top:8px">cancel</button>'
    );
  }
  function openPass() {
    var user = ((document.getElementById("loginUser") || {}).value || "").trim().toLowerCase();
    sheet(
      '<p class="badge">FORGOT PASSWORD</p>' +
      '<p class="sub">Admin ko Telegram pe username + user id jayega.</p>' +
      '<label>username</label><input id="fgU" value="' + user + '" />' +
      '<button type="button" id="fgGo" class="btn full" style="margin-top:12px">message admin</button>' +
      '<button type="button" id="fgBack" class="btn ghost full" style="margin-top:8px">cancel</button>'
    );
  }
  document.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest("button") : e.target;
    if (!t || !t.id) return;
    if (t.id === "fgNo" || t.id === "fgBack") { e.preventDefault(); closeSheet(); }
    if (t.id === "fgOtp") { e.preventDefault(); openOtp(); }
    if (t.id === "fgPass") { e.preventDefault(); openPass(); }
    if (t.id === "fgUser") {
      e.preventDefault();
      var name = window.prompt("Apna name likho") || "";
      if (!name.trim()) return;
      sendAdmin(["SIDHI GYM \u2014 username forgot", "name: " + name.trim(), "Please send my username."]);
    }
    if (t.id === "fgGo") {
      e.preventDefault();
      var u = ((document.getElementById("fgU") || {}).value || "").trim().toLowerCase();
      if (!u) return;
      sendAdmin(["SIDHI GYM \u2014 password forgot", "username: " + u, "user id: " + uid(u), "Please reset password."]);
    }
    if (t.id === "fgSend") {
      e.preventDefault();
      var email = ((document.getElementById("fgEmail") || {}).value || "").trim();
      fetch("/api/otp/send", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: email }) })
        .then(function (r) { return r.json().then(function (d) { if (!r.ok) throw new Error(d.error || "fail"); }); })
        .then(function () { if (typeof toast === "function") toast("OTP email pe gaya"); })
        .catch(function (err) { if (typeof toast === "function") toast(err.message || "OTP fail"); });
    }
    if (t.id === "fgCheck") {
      e.preventDefault();
      var email2 = ((document.getElementById("fgEmail") || {}).value || "").trim();
      var code = ((document.getElementById("fgCode") || {}).value || "").trim();
      fetch("/api/otp/check", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: email2, code: code }) })
        .then(function (r) { return r.json().then(function (d) { if (!r.ok) throw new Error(d.error || "fail"); }); })
        .then(function () { closeSheet(); if (typeof toast === "function") toast("Email verified"); })
        .catch(function (err) { if (typeof toast === "function") toast(err.message || "OTP galat"); });
    }
  }, true);
  function hook() {
    var list = document.querySelectorAll("#gate .forgot, #forgotBtn, .forgot");
    for (var i = 0; i < list.length; i++) {
      list[i].onclick = function (e) {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        openMenu();
      };
    }
    var old = document.getElementById("otpEmail");
    if (old && old.closest) {
      var box = old.closest("div");
      if (box) box.style.display = "none";
    }
  }
  setInterval(hook, 700);
})();
