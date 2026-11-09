(function () {
  var adminUsers = ["harryashu", "admin"];
  fetch("/api/public-config", { cache: "no-store" })
    .then(function (r) { return r.json(); })
    .then(function (d) {
      if (d && Array.isArray(d.adminUsers)) {
        adminUsers = d.adminUsers.map(function (x) { return String(x).toLowerCase(); });
      } else if (d && d.adminUser) {
        adminUsers = [String(d.adminUser).toLowerCase()];
      }
      injectHeader();
      injectProfile();
    })
    .catch(function () {
      injectHeader();
      injectProfile();
    });

  function isAdmin() {
    var u = (typeof username === "string" ? username : "").toLowerCase();
    if (!u) {
      try { u = String(localStorage.getItem("sidhi-gym-username") || "").toLowerCase(); } catch (e) {}
    }
    return !!u && adminUsers.indexOf(u) >= 0;
  }

  function injectHeader() {
    var existing = document.getElementById("adminDashBtn");
    if (!isAdmin()) {
      if (existing) existing.remove();
      var r = document.getElementById("adminResetBtn");
      if (r) r.remove();
      return;
    }
    var profile = document.getElementById("profileBtn");
    if (!profile) return;

    if (!document.getElementById("adminDashBtn")) {
      var button = document.createElement("button");
      button.type = "button";
      button.id = "adminDashBtn";
      button.className = "btn ghost";
      button.textContent = "⚙ admin";
      button.style.cssText = "min-height:42px;padding:8px 12px;font-size:11px;margin-right:6px";
      button.addEventListener("click", function () { window.location.href = "/admin.html"; });
      profile.parentNode.insertBefore(button, profile);
    }

    if (!document.getElementById("adminResetBtn")) {
      var resetBtn = document.createElement("button");
      resetBtn.type = "button";
      resetBtn.id = "adminResetBtn";
      resetBtn.className = "btn ghost";
      resetBtn.textContent = "🔑 reset";
      resetBtn.style.cssText = "min-height:42px;padding:8px 12px;font-size:11px;margin-right:6px";
      resetBtn.addEventListener("click", function () { window.location.href = "/reset.html"; });
      profile.parentNode.insertBefore(resetBtn, profile);
    }
  }

  function injectProfile() {
    if (!isAdmin()) {
      var old = document.getElementById("pfAdminBox");
      if (old) old.remove();
      return;
    }
    var v = document.getElementById("view-profile");
    if (!v || v.classList.contains("hidden")) return;
    if (document.getElementById("pfAdminBox")) return;

    var box = document.createElement("div");
    box.className = "glass card";
    box.id = "pfAdminBox";
    box.innerHTML =
      "<h2>admin tools</h2>" +
      "<p class=\"sub\">secret se password reset + sab users dekhna</p>" +
      "<div class=\"row\" style=\"margin-top:12px;gap:8px\">" +
      "<button type=\"button\" class=\"btn full\" id=\"pfAdminDash\" style=\"min-height:48px\">Admin panel</button>" +
      "<button type=\"button\" class=\"btn ghost full\" id=\"pfAdminReset\" style=\"min-height:48px\">Reset password</button>" +
      "</div>" +
      "<p class=\"sub\" style=\"margin-top:10px\">Reset page pe ADMIN_SECRET daalo → users list + kisi ka password reset.</p>";
    v.insertBefore(box, v.firstChild);

    document.getElementById("pfAdminDash").onclick = function () {
      window.location.href = "/admin.html";
    };
    document.getElementById("pfAdminReset").onclick = function () {
      window.location.href = "/reset.html";
    };
  }

  setInterval(function () {
    injectHeader();
    injectProfile();
  }, 800);
})();
