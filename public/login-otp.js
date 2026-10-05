(function () {
  function token() { return localStorage.getItem("sidhi-gym-token") || ""; }
  function paint(email) {
    var view = document.getElementById("view-profile");
    if (!view || !email) return;
    var line = document.getElementById("pfEmailLine");
    if (!line) {
      line = document.createElement("div");
      line.id = "pfEmailLine";
      line.style.cssText = "display:flex;justify-content:space-between;gap:8px;padding:10px 0;border-top:1px solid rgba(255,255,255,.08)";
      var rows = view.querySelectorAll(".card div, .card p, .stat, .row");
      var weightRow = null;
      rows.forEach(function (n) {
        if ((n.innerText || "").toLowerCase().indexOf("weight") >= 0 && (n.innerText || "").indexOf("kg") >= 0) weightRow = n;
      });
      if (weightRow && weightRow.parentNode) weightRow.parentNode.insertBefore(line, weightRow.nextSibling);
      else {
        var card = view.querySelector(".card");
        if (card) card.appendChild(line);
      }
    }
    line.innerHTML = "<span>email</span><b>" + email + "</b>";
    var input = document.getElementById("pfEmail");
    if (input && !input.value) input.value = email;
  }
  function load() {
    if (!document.getElementById("view-profile")) return;
    fetch("/api/profile-email", { headers: { authorization: "Bearer " + token() } })
      .then(function (r) { return r.json(); })
      .then(function (d) { if (d && d.email) paint(d.email); })
      .catch(function () {});
  }
  function mount() {
    var name = document.querySelector("#view-profile input");
    if (!name || document.getElementById("pfEmail")) { load(); return; }
    var card = name.closest(".card") || name.parentNode;
    var emailLab = document.createElement("label");
    emailLab.textContent = "email";
    var email = document.createElement("input");
    email.id = "pfEmail";
    email.type = "email";
    email.placeholder = "you@gmail.com";
    var wLab = document.createElement("label");
    wLab.textContent = "weight kg";
    var weight = document.createElement("input");
    weight.id = "pfWeightNow";
    weight.inputMode = "decimal";
    card.insertBefore(weight, name.nextSibling);
    card.insertBefore(wLab, weight);
    card.insertBefore(email, name.nextSibling);
    card.insertBefore(emailLab, email);
    var save = card.querySelector("button");
    if (save && !save.dataset.extra) {
      save.dataset.extra = "1";
      save.addEventListener("click", function () {
        var auth = { authorization: "Bearer " + token(), "content-type": "application/json" };
        fetch("/api/profile-email", { method: "POST", headers: auth, body: JSON.stringify({ email: email.value.trim() }) })
          .then(function (r) { return r.json().then(function (d) { if (!r.ok) throw new Error(d.error || "email fail"); return d; }); })
          .then(function (d) { paint(d.email); if (typeof toast === "function") toast("Email added"); })
          .catch(function (e) { if (typeof toast === "function") toast(e.message || "save fail"); });
      });
    }
    load();
  }
  setInterval(mount, 900);
})();
