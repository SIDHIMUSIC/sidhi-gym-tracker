// Sidhi Gym Premium — profile only + badge
(function () {
  var TOKEN = "sidhi-gym-token";
  var PRICE = 99;

  function toast(m) {
    var t = document.getElementById("toast");
    if (!t) return;
    t.textContent = m;
    t.style.display = "block";
    setTimeout(function () { t.style.display = "none"; }, 2000);
  }

  function badge(isPrem) {
    var old = document.getElementById("premBadge");
    if (old) old.remove();
    var b = document.createElement("span");
    b.id = "premBadge";
    b.style.cssText = "display:inline-block;margin-left:8px;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:700;vertical-align:middle";
    if (isPrem) {
      b.textContent = "PREMIUM";
      b.style.background = "linear-gradient(90deg,#f0c27a,#63e2b3)";
      b.style.color = "#111";
    } else {
      b.textContent = "FREE";
      b.style.background = "#333";
      b.style.color = "#aaa";
    }
    // Attach near profile name
    var name = document.querySelector("#view-profile h1, #view-profile .name, .profile-name, [data-name]");
    if (!name) {
      var views = document.querySelectorAll("[id^=view-]");
      for (var i = 0; i < views.length; i++) {
        if (views[i].textContent.indexOf("@") > -1 || views[i].textContent.indexOf("PROFILE") > -1) {
          name = views[i].querySelector("h1, h2, strong, .name") || views[i];
          break;
        }
      }
    }
    if (name) name.appendChild(b);
  }

  function card(me) {
    var old = document.getElementById("premiumBox");
    if (old) old.remove();
    if (!me) return;
    var box = document.createElement("div");
    box.id = "premiumBox";
    box.style.cssText = "margin:14px 0;padding:14px;border-radius:14px;background:#111827;border:1px solid #f0c27a44;text-align:center";
    if (me.premium) {
      box.innerHTML = '<div style="color:#f0c27a;font-weight:700">Premium Active</div><div style="font-size:12px;color:#9aa7b8;margin:4px 0 10px">Unlimited · Export · Custom</div><button id="premExp" style="padding:8px 16px;border-radius:10px;border:0;background:#f0c27a;color:#111;font-weight:600">Export CSV</button>';
    } else {
      box.innerHTML = '<div style="color:#f0c27a;font-weight:700">Go Premium · ₹' + PRICE + '/yr</div><div style="font-size:12px;color:#9aa7b8;margin:4px 0 10px">Unlimited history & CSV export</div><button id="premUp" style="padding:8px 18px;border-radius:10px;border:0;background:#63e2b3;color:#111;font-weight:600">Upgrade</button>';
    }
    // Only inside profile view
    var prof = document.getElementById("view-profile") || document.querySelector("[data-tab='profile']");
    if (!prof) {
      var all = document.querySelectorAll("div");
      for (var i = 0; i < all.length; i++) {
        if (all[i].textContent.indexOf("edit profile") > -1 || all[i].textContent.indexOf("member since") > -1) {
          prof = all[i];
          break;
        }
      }
    }
    if (prof) prof.appendChild(box);
    else return;

    var u = document.getElementById("premUp");
    if (u) u.onclick = function () {
      var c = prompt("Activation code (test: SIDHI2026):");
      if (!c) return;
      fetch("/api/premium/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + localStorage.getItem(TOKEN) },
        body: JSON.stringify({ code: c.trim() })
      }).then(function (r) { return r.json(); }).then(function (d) {
        if (d.ok) { toast("Premium on"); setTimeout(function () { location.reload(); }, 500); }
        else toast(d.error || "Invalid");
      });
    };
    var e = document.getElementById("premExp");
    if (e) e.onclick = function () {
      fetch("/api/export.csv", { headers: { Authorization: "Bearer " + localStorage.getItem(TOKEN) } })
        .then(function (r) {
          if (!r.ok) return r.json().then(function (x) { toast(x.error || "Fail"); });
          return r.blob().then(function (b) {
            var a = document.createElement("a");
            a.href = URL.createObjectURL(b);
            a.download = "sidhi.csv";
            a.click();
            toast("CSV ok");
          });
        });
    };
  }

  function run() {
    var token = localStorage.getItem(TOKEN);
    if (!token) return;
    fetch("/api/me", { headers: { Authorization: "Bearer " + token } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (me) {
        if (!me) return;
        badge(!!me.premium);
        card(me);
      });
  }

  setTimeout(run, 1200);
  setTimeout(run, 3000);
})();
