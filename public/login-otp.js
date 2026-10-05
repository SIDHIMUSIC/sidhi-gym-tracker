(function () {
  function token() { return localStorage.getItem("sidhi-gym-token") || ""; }
  function show(email) {
    var head = document.querySelector("#view-profile .card");
    if (!head || !email) return;
    var line = document.getElementById("pfEmailLine");
    if (!line) {
      line = document.createElement("p");
      line.id = "pfEmailLine";
      line.style.cssText = "text-align:center;color:#9ad7ff;margin:4px 0 0";
      head.appendChild(line);
    }
    line.textContent = email;
  }
  function mount() {
    var old = document.getElementById("pfEmailSave");
    if (old) { var c = old.closest(".card"); if (c) c.remove(); }
    var name = document.querySelector("#view-profile input");
    if (!name || document.getElementById("pfEmail")) return;
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
    fetch("/api/profile-email", { headers: { authorization: "Bearer " + token() } })
      .then(function (r) { return r.json(); })
      .then(function (d) { if (d && d.email) { email.value = d.email; show(d.email); } })
      .catch(function () {});
    var save = card.querySelector("button");
    if (!save || save.dataset.extra) return;
    save.dataset.extra = "1";
    save.addEventListener("click", function () {
      var auth = { authorization: "Bearer " + token(), "content-type": "application/json" };
      fetch("/api/profile-email", { method: "POST", headers: auth, body: JSON.stringify({ email: email.value.trim() }) })
        .then(function (r) { return r.json().then(function (d) { if (!r.ok) throw new Error(d.error || "email fail"); return d; }); })
        .then(function (d) {
          show(d.email);
          return fetch("/api/me", { method: "PATCH", headers: auth, body: JSON.stringify({ currentWeight: Number(weight.value) }) });
        })
        .then(function () { if (typeof toast === "function") toast("Profile save"); })
        .catch(function (e) { if (typeof toast === "function") toast(e.message || "save fail"); });
    });
  }
  setInterval(mount, 800);
})();
