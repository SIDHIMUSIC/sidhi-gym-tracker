// Sidhi Gym Premium — Home only card + profile badge
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
    b.style.cssText = "display:inline-block;margin-left:6px;padding:2px 7px;border-radius:9px;font-size:10px;font-weight:700;vertical-align:middle";
    if (isPrem) {
      b.textContent = "PREMIUM";
      b.style.background = "linear-gradient(90deg,#f0c27a,#63e2b3)";
      b.style.color = "#111";
    } else {
      b.textContent = "FREE";
      b.style.background = "#2a2a2a";
      b.style.color = "#888";
    }
    var nameEl = document.querySelector("#view-profile strong, #view-profile h1, #view-profile h2, .profile-name");
    if (!nameEl) {
      var p = document.getElementById("view-profile");
      if (p) nameEl = p.querySelector("strong, h1, h2, .name") || p;
    }
    if (nameEl) nameEl.appendChild(b);
  }

  function homeCard(me) {
    var old = document.getElementById("premiumBox");
    if (old) old.remove();
    if (!me || me.premium) return; // only show upgrade if not premium
    var box = document.createElement("div");
    box.id = "premiumBox";
    box.style.cssText = "margin:12px 14px 6px;padding:14px;border-radius:16px;background:linear-gradient(135deg,#111827,#1a1a2e);border:1px solid #f0c27a55;text-align:center";
    box.innerHTML = '<div style="color:#f0c27a;font-size:17px;font-weight:700">Go Premium</div><div style="color:#fff;font-size:22px;font-weight:800;margin:4px 0">₹' + PRICE + '<span style="font-size:13px;font-weight:500">/year</span></div><div style="font-size:12px;color:#9aa7b8;margin-bottom:10px">Unlimited history · CSV export · Custom splits</div><button id="premUp" style="padding:10px 28px;border-radius:12px;border:0;background:#63e2b3;color:#111;font-weight:700;font-size:15px">Upgrade Now</button>';
    // Insert in home view
    var home = document.getElementById("view-home");
    if (home) {
      var first = home.querySelector(".card, .glass") || home.firstElementChild;
      if (first) home.insertBefore(box, first.nextSibling);
      else home.appendChild(box);
    }

    var btn = document.getElementById("premUp");
    if (btn) btn.onclick = function () {
      var c = prompt("Activation code daalo:\\n(Test: SIDHI2026)");
      if (!c) return;
      fetch("/api/premium/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + localStorage.getItem(TOKEN) },
        body: JSON.stringify({ code: c.trim() })
      }).then(function (r) { return r.json(); }).then(function (d) {
        if (d.ok) { toast("Premium activated!"); setTimeout(function () { location.reload(); }, 600); }
        else toast(d.error || "Invalid code");
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
        homeCard(me);
      });
  }

  setTimeout(run, 1000);
  setTimeout(run, 2500);
})();
