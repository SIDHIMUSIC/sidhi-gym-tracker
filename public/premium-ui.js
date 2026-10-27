// Sidhi Gym Premium — self healing
(function () {
  var TOKEN = "sidhi-gym-token";
  var done = false;

  function toast(m) {
    var t = document.getElementById("toast");
    if (!t) {
      t = document.createElement("div");
      t.id = "toast";
      t.style.cssText = "position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:#111;color:#fff;padding:10px 16px;border-radius:8px;z-index:99999";
      document.body.appendChild(t);
    }
    t.textContent = m;
    t.style.display = "block";
    clearTimeout(t._t);
    t._t = setTimeout(function () { t.style.display = "none"; }, 2000);
  }

  function inject(me, price) {
    var home = document.getElementById("view-home");
    if (!home) return;

    // Premium card
    if (!me.premium && !document.getElementById("premiumBox")) {
      var box = document.createElement("div");
      box.id = "premiumBox";
      box.style.cssText = "margin:12px 14px;padding:14px;border-radius:16px;background:#111827;border:1px solid #f0c27a66;text-align:center";
      var off = (price && price.offer) ? '<div style="color:#fb7185;font-size:12px;font-weight:600">' + price.offer + '</div>' : '';
      box.innerHTML = off +
        '<div style="color:#f0c27a;font-size:16px;font-weight:700">Go Premium</div>' +
        '<div style="color:#fff;font-size:20px;font-weight:800;margin:4px 0">₹' + ((price && price.price) || 49) + '<span style="font-size:12px">/' + ((price && price.label) || "month") + '</span></div>' +
        '<button id="payBtn" style="margin:8px 0;padding:10px 20px;border-radius:10px;border:0;background:#63e2b3;color:#111;font-weight:700">Pay Now</button>' +
        '<div style="font-size:12px;color:#9aa7b8;margin-top:6px">Gift code?</div>' +
        '<div style="display:flex;gap:6px;justify-content:center;margin-top:4px">' +
        '<input id="promoIn" placeholder="CODE" style="padding:8px;border-radius:8px;border:1px solid #444;background:#000;color:#fff;width:110px;text-transform:uppercase">' +
        '<button id="promoBtn" style="padding:8px 12px;border-radius:8px;border:0;background:#f0c27a;color:#111;font-weight:600">Apply</button></div>';
      var first = home.querySelector(".card, .glass");
      if (first) home.insertBefore(box, first.nextSibling);
      else home.insertBefore(box, home.firstChild);

      document.getElementById("payBtn").onclick = function () { toast("Payment opening..."); };
      document.getElementById("promoBtn").onclick = function () {
        var c = document.getElementById("promoIn").value.trim();
        if (!c) return toast("Code daalo");
        fetch("/api/premium/redeem", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: "Bearer " + localStorage.getItem(TOKEN) },
          body: JSON.stringify({ code: c })
        }).then(function (r) { return r.json(); }).then(function (d) {
          if (d.ok) { toast("Applied " + d.days + "d"); setTimeout(function () { location.reload(); }, 500); }
          else toast(d.error || "Invalid");
        });
      };
    }

    // Admin gift
    if (me.isAdmin && !document.getElementById("adminGiftBox")) {
      var ab = document.createElement("div");
      ab.id = "adminGiftBox";
      ab.style.cssText = "margin:8px 14px;padding:12px;border-radius:12px;background:#1a1025;border:1px solid #a78bfa55;text-align:center";
      ab.innerHTML = '<div style="color:#a78bfa;font-size:13px;font-weight:700">Admin Gift</div>' +
        '<div style="margin:8px 0;display:flex;gap:6px;justify-content:center;align-items:center">' +
        '<input id="giftDays" type="number" value="30" min="1" max="365" style="width:70px;padding:7px;border-radius:6px;border:1px solid #444;background:#000;color:#fff;text-align:center">' +
        '<span style="color:#9aa7b8;font-size:12px">days</span></div>' +
        '<button id="genBtn" style="padding:8px 16px;border-radius:8px;border:0;background:#a78bfa;color:#111;font-weight:600">Generate</button>' +
        '<div id="codeOut" style="margin-top:8px;color:#f0c27a;font-weight:700;font-size:16px"></div>';
      home.appendChild(ab);
      document.getElementById("genBtn").onclick = function () {
        var days = Number(document.getElementById("giftDays").value) || 30;
        fetch("/api/admin/promo", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: "Bearer " + localStorage.getItem(TOKEN) },
          body: JSON.stringify({ days: days })
        }).then(function (r) { return r.json(); }).then(function (d) {
          if (d.ok) {
            document.getElementById("codeOut").textContent = d.code;
            toast("Code: " + d.code);
          } else toast(d.error || "Fail");
        });
      };
    }

    // Badge — force near name
    if (!document.getElementById("premBadge")) {
      var b = document.createElement("span");
      b.id = "premBadge";
      b.style.cssText = "display:inline-block;margin-left:8px;padding:3px 10px;border-radius:10px;font-size:11px;font-weight:800;vertical-align:middle";
      if (me.isAdmin) { b.textContent = "ADMIN"; b.style.background = "linear-gradient(90deg,#ff6b6b,#feca57,#48dbfb,#ff9ff3)"; b.style.color = "#111"; }
      else if (me.premium) { b.textContent = "PREMIUM"; b.style.background = "linear-gradient(90deg,#f0c27a,#63e2b3)"; b.style.color = "#111"; }
      else { b.textContent = "FREE"; b.style.background = "#333"; b.style.color = "#aaa"; }
      // Try multiple places
      var target = document.querySelector("#view-profile strong") ||
                   document.querySelector("#view-profile h1") ||
                   document.querySelector("#view-profile h2") ||
                   document.querySelector("[id*=profile] strong") ||
                   document.querySelector(".profile-name");
      if (!target) {
        // Find element containing @username
        var all = document.querySelectorAll("div, span, p, h1, h2, h3, strong");
        for (var i = 0; i < all.length; i++) {
          if (all[i].textContent.indexOf("@harryashu") > -1 || all[i].textContent.indexOf("Ashutosh") > -1) {
            if (all[i].children.length < 3) { target = all[i]; break; }
          }
        }
      }
      if (target) target.appendChild(b);
      else document.body.appendChild(b); // fallback
    }
  }

  function boot() {
    var token = localStorage.getItem(TOKEN);
    if (!token) return;
    Promise.all([
      fetch("/api/me", { headers: { Authorization: "Bearer " + token } }).then(function (r) { return r.ok ? r.json() : null; }),
      fetch("/api/premium/price").then(function (r) { return r.json(); }).catch(function () { return {}; })
    ]).then(function (a) {
      if (a[0]) inject(a[0], a[1] || {});
    });
  }

  // Run multiple times + on visibility
  setTimeout(boot, 400);
  setTimeout(boot, 1200);
  setTimeout(boot, 2500);
  document.addEventListener("visibilitychange", function () { if (!document.hidden) setTimeout(boot, 300); });
})();
