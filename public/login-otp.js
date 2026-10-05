(function () {
  function token() {
    return localStorage.getItem("sidhiToken") || localStorage.getItem("token") || "";
  }
  function mount() {
    var v = document.getElementById("view-profile");
    if (!v || v.classList.contains("hidden") || document.getElementById("pfEmail")) return;
    var box = document.createElement("div");
    box.className = "glass card";
    box.innerHTML = "<h2>email</h2><label>otp email</label><input id=\"pfEmail\" type=\"email\" placeholder=\"you@gmail.com\" /><button type=\"button\" class=\"btn full\" id=\"pfEmailSave\" style=\"margin-top:10px\">save email</button>";
    v.appendChild(box);
    var t = token();
    if (t) {
      fetch("/api/profile-email", { headers: { authorization: "Bearer " + t } })
        .then(function (r) { return r.json(); })
        .then(function (d) { if (d && d.email) document.getElementById("pfEmail").value = d.email; })
        .catch(function () {});
    }
    document.getElementById("pfEmailSave").onclick = function () {
      fetch("/api/profile-email", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: "Bearer " + token() },
        body: JSON.stringify({ email: document.getElementById("pfEmail").value.trim() })
      }).then(function (r) { return r.json().then(function (d) { if (!r.ok) throw new Error(d.error || "fail"); }); })
        .then(function () { if (typeof toast === "function") toast("Email save"); })
        .catch(function (e) { if (typeof toast === "function") toast(e.message || "save fail"); });
    };
  }
  setInterval(mount, 800);
})();
