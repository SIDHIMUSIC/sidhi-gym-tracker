(function () {
  function token() { return localStorage.getItem("sidhi-gym-token") || ""; }
  function auth() { return { authorization: "Bearer " + token(), "content-type": "application/json" }; }
  function weightRow() {
    var view = document.getElementById("view-profile");
    if (!view) return null;
    var hit = null;
    view.querySelectorAll(".card div, .card p").forEach(function (n) {
      var t = (n.innerText || "").trim().toLowerCase();
      if (t.indexOf("weight") === 0 || t.indexOf("weight\n") === 0) hit = n;
    });
    return hit;
  }
  function paint(email, kg) {
    var row = weightRow();
    if (!row) return;
    if (kg) {
      var bits = row.querySelectorAll("span, b, strong");
      if (bits.length > 1) bits[bits.length - 1].textContent = kg + " kg";
      else row.innerHTML = "<span>weight</span><b>" + kg + " kg</b>";
    }
    var line = document.getElementById("pfEmailLine");
    if (!line) {
      line = document.createElement("div");
      line.id = "pfEmailLine";
      line.style.cssText = "display:flex;justify-content:space-between;gap:8px;padding:10px 0;border-top:1px solid rgba(255,255,255,.08)";
      row.parentNode.insertBefore(line, row.nextSibling);
    }
    if (email) line.innerHTML = "<span>email</span><b>" + email + "</b>";
  }
  function load() {
    fetch("/api/profile-email", { headers: { authorization: "Bearer " + token() } })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        var input = document.getElementById("pfEmail");
        if (input && d && d.email && !input.value) input.value = d.email;
        paint(d && d.email, "");
      }).catch(function () {});
    fetch("/api/me", { headers: { authorization: "Bearer " + token() } })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d && d.currentWeight) {
          var w = document.getElementById("pfWeightNow");
          if (w && !w.value) w.value = d.currentWeight;
          paint("", d.currentWeight);
        }
      }).catch(function () {});
  }
  function saveExtra() {
    var email = document.getElementById("pfEmail");
    var weight = document.getElementById("pfWeightNow");
    if (!email) return;
    var kg = weight && weight.value ? Number(weight.value) : null;
    fetch("/api/profile-email", { method: "POST", headers: auth(), body: JSON.stringify({ email: email.value.trim() }) })
      .then(function (r) { return r.json().then(function (d) { if (!r.ok) throw new Error(d.error || "email fail"); return d; }); })
      .then(function (d) {
        if (kg) return fetch("/api/me", { method: "PATCH", headers: auth(), body: JSON.stringify({ currentWeight: kg }) }).then(function () { return d; });
        return d;
      })
      .then(function (d) {
        paint(d.email, kg || "");
        if (typeof toast === "function") toast("Email aur weight save");
      })
      .catch(function (e) { if (typeof toast === "function") toast(e.message || "save fail"); });
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("button");
    if (!b) return;
    if ((b.innerText || "").toLowerCase().indexOf("save changes") < 0) return;
    if (!b.closest("#view-profile")) return;
    setTimeout(saveExtra, 200);
  }, true);
  setInterval(function () {
    if (!document.getElementById("view-profile")) return;
    if (!document.getElementById("pfEmail")) {
      var name = document.querySelector("#view-profile input");
      if (!name) return;
      var card = name.closest(".card") || name.parentNode;
      var emailLab = document.createElement("label"); emailLab.textContent = "email";
      var email = document.createElement("input"); email.id = "pfEmail"; email.type = "email"; email.placeholder = "you@gmail.com";
      var wLab = document.createElement("label"); wLab.textContent = "weight kg";
      var weight = document.createElement("input"); weight.id = "pfWeightNow"; weight.inputMode = "decimal";
      card.insertBefore(weight, name.nextSibling);
      card.insertBefore(wLab, weight);
      card.insertBefore(email, name.nextSibling);
      card.insertBefore(emailLab, email);
    }
    load();
  }, 1200);
})();
