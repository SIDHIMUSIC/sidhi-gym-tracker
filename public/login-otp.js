(function () {
  function mount() {
    var gate = document.querySelector("#gate .glass.card");
    if (!gate || document.getElementById("otpEmail")) return;
    var box = document.createElement("div");
    box.innerHTML = '<label>email for otp</label><input id="otpEmail" type="email" placeholder="you@gmail.com" /><div class="row" style="margin-top:8px"><button type="button" class="btn ghost" id="otpSend">send otp</button><input id="otpCode" inputmode="numeric" placeholder="6 digit" style="flex:1" /></div>';
    var actions = gate.querySelector(".auth-actions") || gate.querySelector(".row");
    if (actions) gate.insertBefore(box, actions); else gate.appendChild(box);
    document.getElementById("otpSend").onclick = async function () {
      var email = document.getElementById("otpEmail").value.trim();
      try {
        var r = await fetch("/api/otp/send", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: email }) });
        var d = await r.json();
        if (!r.ok) throw new Error(d.error || "fail");
        if (typeof toast === "function") toast("OTP email pe gaya");
      } catch (e) {
        if (typeof toast === "function") toast(e.message || "OTP fail");
      }
    };
    document.getElementById("otpCode").addEventListener("change", async function () {
      var email = document.getElementById("otpEmail").value.trim();
      var code = document.getElementById("otpCode").value.trim();
      if (code.length < 6) return;
      try {
        var r = await fetch("/api/otp/check", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: email, code: code }) });
        var d = await r.json();
        if (!r.ok) throw new Error(d.error || "fail");
        if (typeof toast === "function") toast("Email verified");
      } catch (e) {
        if (typeof toast === "function") toast(e.message || "OTP galat");
      }
    });
  }
  setInterval(mount, 700);
})();
