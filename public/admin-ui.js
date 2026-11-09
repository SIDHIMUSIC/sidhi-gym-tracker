(function () {
  var adminUsers = ["harryashu", "admin"];
  fetch("/api/public-config", { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (d) {
    if (d && Array.isArray(d.adminUsers)) adminUsers = d.adminUsers.map(function (x) { return String(x).toLowerCase(); });
    inject();
  }).catch(function () {});
  function isAdmin() {
    var u = (typeof username === "string" ? username : "").toLowerCase();
    return !!u && adminUsers.indexOf(u) >= 0;
  }
  function inject() {
    var existing = document.getElementById("adminDashBtn");
    if (!isAdmin()) {
      if (existing) existing.remove();
      return;
    }
    var profile = document.getElementById("profileBtn");
    if (!profile || existing) return;
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