(function () {
  var adminUser = "harryashu";
  fetch("/api/public-config").then(function (r) { return r.json(); }).then(function (d) {
    if (d && d.adminUser) adminUser = String(d.adminUser).toLowerCase();
  }).catch(function () {});
  function isAdmin() {
    var u = (typeof username === "string" ? username : "").toLowerCase();
    return u && u === adminUser;
  }
  function inject() {
    if (!isAdmin()) return;
    var v = document.getElementById("view-profile");
    if (!v || v.classList.contains("hidden")) return;
    if (document.getElementById("pfAdmin")) return;
    var box = document.createElement("div");
    box.className = "glass card";
    box.id = "pfAdmin";
    box.innerHTML =
      "<h2>admin</h2>" +
      "<p class=\"sub\">Forgot requests — reset page.</p>" +
      "<button type=\"button\" class=\"btn ok full\" id=\"pfReset\">open password reset</button>";
    var danger = document.getElementById("pfDanger");
    if (danger) v.insertBefore(box, danger);
    else v.appendChild(box);
    document.getElementById("pfReset").onclick = function () {
      window.location.href = "/reset.html";
    };
  }
  if (typeof showProfile === "function" && !showProfile._adm) {
    var _sp = showProfile;
    showProfile = function () {
      _sp();
      setTimeout(inject, 40);
    };
    showProfile._adm = true;
  }
  setInterval(inject, 1200);
})();
