(function () {
  function token() {
    return localStorage.getItem("sidhi-gym-token") || "";
  }
  function mount() {
    var name = document.getElementById("pfName") || document.querySelector("#view-profile input");
    if (!name || document.getElementById("pfEmail")) return;
    var card = name.closest(".card") || name.parentNode;
    var lab = document.createElement("label");
    lab.textContent = "email";
    var input = document.createElement("input");
    input.id = "pfEmail";
    input.type = "email";
    input.placeholder = "you@gmail.com";
    var gender = card.querySelector("label");
    card.insertBefore(input, name.nextSibling);
    card.insertBefore(lab, input);
    fetch("/api/profile-email", { headers: { authorization: "Bearer " + token() } })
      .then(function (r) { return r.json(); })
      .then(function (d) { if (d && d.email) input.value = d.email; })
      .catch(function () {});
    var save = card.querySelector("button");
    if (!save || save.dataset.email) return;
    save.dataset.email = "1";
    save.addEventListener("click", function () {
      fetch("/api/profile-email", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: "Bearer " + token() },
        body: JSON.stringify({ email: input.value.trim() })
      }).then(function (r) { return r.json().then(function (d) { if (!r.ok) throw new Error(d.error || "fail"); }); })
        .then(function () { if (typeof toast === "function") toast("Email save"); })
        .catch(function (e) { if (typeof toast === "function") toast(e.message || "email save fail"); });
    });
  }
  setInterval(mount, 800);
})();
