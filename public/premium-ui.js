// Sidhi Gym Premium — sticky badge
(function () {
  var TOKEN = "sidhi-gym-token";
  var meData = null;

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
    t._t = setTimeout(function () { t.style.display = "none"; }, 1800);
  }

  function stickBadge() {
    if (!meData) return;
    var existing = document.getElementById("premBadge");
    if (existing) return;
    var b = document.createElement("span");
    b.id = "premBadge";
    b.style.cssText = "display:inline-block;margin-left:8px;padding:3px 10px;border-radius:10px;font-size:11px;font-weight:800;vertical-align:middle";
    if (meData.isAdmin) {
      b.textContent = "ADMIN";
      b.style.background = "linear-gradient(90deg,#ff6b6b,#feca57,#48dbfb,#ff9ff3)";
      b.style.color = "#111";
    } else if (meData.premium) {
      b.textContent = "PREMIUM";
      b.style.background = "linear-gradient(90deg,#f0c27a,#63e2b3)";
      b.style.color = "#111";
    } else {
      b.textContent = "FREE";
      b.style.background = "#333";
      b.style.color = "#aaa";
    }
    // Find name
    var target = null;
    var nodes = document.querySelectorAll("strong, h1, h2, h3, div, span");
    for (var i = 0; i < nodes.length; i++) {
      var txt = nodes[i].textContent || "";
      if ((txt.indexOf("Ashutosh") > -1 || txt.indexOf("@harryashu") > -1) && nodes[i].children.length < 4) {
        target = nodes[i];
        break;
      }
    }
    if (target) target.appendChild(b);
  }

  function injectCards() {
    if (!meData) return;
    var home = document.getElementById("view-home");
    if (!home) return;
    if (!meData.premium && !document.getElementById("premiumBox")) {
      var box = document.createElement("div");
      box.id = "premiumBox";
      box.style.cssText = "margin:12px 14px;padding:14px;border-radius:16px;background:#111827;border:1px solid #f0c27a66;text-align:center";
      box.innerHTML = '<div style="color:#f0c27a;font-weight:700">Go Premium</div><div style="color:#fff;font-size:18px;font-weight:800">₹49/month</div><button id="payBtn" style="margin-top:8px;padding:8px 16px;border-radius:8px;border:0;background:#63e2b3;color:#111;font-weight:700">Pay</button>';
      home.insertBefore(box, home.firstChild);
    }
    if (meData.isAdmin && !document.getElementById("adminGiftBox")) {
      var ab = document.createElement("div");
      ab.id = "adminGiftBox";
      ab.style.cssText = "margin:8px 14px;padding:12px;border-radius:12px;background:#1a1025;border:1px solid #a78bfa55;text-align:center";
      ab.innerHTML = '<div style="color:#a78bfa;font-weight:700">Admin Gift</div><input id="giftDays" type="number" value="30" style="width:60px;margin:6px;padding:6px;border-radius:6px;background:#000;color:#fff;border:1px solid #444"><button id="genBtn" style="padding:6px 12px;border-radius:6px;border:0;background:#a78bfa;color:#111;font-weight:600">Generate</button><div id="codeOut" style="margin-top:6px;color:#f0c27a;font-weight:700"></div>';
      home.appendChild(ab);
      document.getElementById("genBtn").onclick = function () {
        var d = Number(document.getElementById("giftDays").value) || 30;
        fetch("/api/admin/promo", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + localStorage.getItem(TOKEN) }, body: JSON.stringify({ days: d }) })
          .then(function (r) { return r.json(); }).then(function (x) { if (x.ok) document.getElementById("codeOut").textContent = x.code; });
      };
    }
  }

  function boot() {
    var token = localStorage.getItem(TOKEN);
    if (!token) return;
    fetch("/api/me", { headers: { Authorization: "Bearer " + token } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (me) {
        if (!me) return;
        meData = me;
        stickBadge();
        injectCards();
      });
  }

  boot();
  setInterval(function () { stickBadge(); injectCards(); }, 1500);
})();
