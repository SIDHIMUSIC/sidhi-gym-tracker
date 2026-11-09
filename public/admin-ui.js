(function () {
  var adminUser = "harryashu";
  fetch("/api/public-config", { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (d) {
    if (d && d.adminUser) adminUser = String(d.adminUser).toLowerCase();
    inject();
  }).catch(function () {});
  function isAdmin() {
    var u = (typeof username === "string" ? username : "").toLowerCase();
    return u && u === adminUser;
  }
  function inject() {
    if (!isAdmin()) return;
    var profile = document.getElementById("profileBtn");
    if (!profile || document.getElementById("adminDashBtn")) return;
    var button = document.createElement("button");
    button.type = "button";
    button.id = "adminDashBtn";
    button.className = "btn ghost";
    button.textContent = "⚙ admin";
    button.style.cssText = "min-height:42px;padding:8px 12px;font-size:11px;margin-right:6px";
    button.addEventListener("click", function () { window.location.href = "/admin.html"; });
    profile.parentNode.insertBefore(button, profile);
  }
  setInterval(inject, 800);
})();