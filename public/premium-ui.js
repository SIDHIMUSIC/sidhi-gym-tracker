// Sidhi Gym Premium — force visible
(function () {
  const TOKEN_KEY = "sidhi-gym-token";
  const PRICE = 99;

  function toast(msg) {
    var t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg;
    t.style.display = "block";
    setTimeout(function () { t.style.display = "none"; }, 2200);
  }

  function addCard(me) {
    if (document.getElementById("premiumBox")) return;
    var box = document.createElement("div");
    box.id = "premiumBox";
    box.style.cssText = "margin:16px 14px;padding:16px;border-radius:16px;background:linear-gradient(135deg,#1a1a2e,#16213e);border:1px solid #f0c27a;color:#fff;text-align:center;position:relative;z-index:10";
    if (me && me.premium) {
      box.innerHTML = '<div style="font-size:18px;color:#f0c27a;margin-bottom:6px">★ Premium Active</div><div style="font-size:13px;opacity:.8">Unlimited history · CSV export</div><button id="premExport" style="margin-top:12px;padding:10px 20px;border-radius:12px;border:0;background:#f0c27a;color:#111;font-weight:700">Export CSV</button>';
    } else {
      box.innerHTML = '<div style="font-size:18px;color:#f0c27a;margin-bottom:6px">Go Premium · ₹' + PRICE + '/year</div><div style="font-size:13px;opacity:.8">Unlimited history · CSV · Custom splits</div><button id="premUpgrade" style="margin-top:12px;padding:10px 24px;border-radius:12px;border:0;background:#63e2b3;color:#111;font-weight:700">Upgrade Now</button><div style="font-size:11px;opacity:.6;margin-top:8px">Free: last 14 days only</div>';
    }
    // Insert after first card or at top of main
    var main = document.querySelector(".main") || document.getElementById("app") || document.body;
    var first = main.querySelector(".card, .glass, #view-home");
    if (first && first.parentNode) first.parentNode.insertBefore(box, first.nextSibling);
    else main.insertBefore(box, main.firstChild);

    var up = document.getElementById("premUpgrade");
    if (up) up.onclick = function () {
      var code = prompt("UPI payment ke baad activation code daalo:\\n(Test code: SIDHI2026)");
      if (!code) return;
      var token = localStorage.getItem(TOKEN_KEY);
      fetch("/api/premium/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ code: code.trim() })
      }).then(function (r) { return r.json(); }).then(function (d) {
        if (d.ok) { toast("Premium on!"); setTimeout(function () { location.reload(); }, 600); }
        else toast(d.error || "Invalid");
      });
    };
    var ex = document.getElementById("premExport");
    if (ex) ex.onclick = function () {
      var token = localStorage.getItem(TOKEN_KEY);
      fetch("/api/export.csv", { headers: { Authorization: "Bearer " + token } })
        .then(function (r) {
          if (!r.ok) return r.json().then(function (e) { toast(e.error || "Fail"); });
          return r.blob().then(function (b) {
            var a = document.createElement("a");
            a.href = URL.createObjectURL(b);
            a.download = "sidhi.csv";
            a.click();
            toast("Downloaded");
          });
        });
    };
  }

  function boot() {
    var token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    fetch("/api/me", { headers: { Authorization: "Bearer " + token } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (me) { if (me) addCard(me); })
      .catch(function () {});
  }

  setTimeout(boot, 800);
  setTimeout(boot, 2500);
})();
