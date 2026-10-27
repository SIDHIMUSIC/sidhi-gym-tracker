// Sidhi Gym Premium — working buttons + badges
(function () {
  var TOKEN = "sidhi-gym-token";
  var me = null;
  var price = { price: 49, label: "month", offer: "Diwali Special" };

  function toast(m) {
    var t = document.getElementById("toast");
    if (!t) {
      t = document.createElement("div");
      t.id = "toast";
      t.style.cssText = "position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:#111;color:#fff;padding:10px 16px;border-radius:8px;z-index:99999;font-size:14px";
      document.body.appendChild(t);
    }
    t.textContent = m;
    t.style.display = "block";
    clearTimeout(t._t);
    t._t = setTimeout(function () { t.style.display = "none"; }, 2000);
  }

  function loadRazor() {
    if (window.Razorpay) return Promise.resolve();
    return new Promise(function (ok) {
      var s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.onload = ok;
      document.head.appendChild(s);
    });
  }

  function badge() {
    if (!me) return;
    var old = document.getElementById("premBadge");
    if (old) old.remove();
    var b = document.createElement("span");
    b.id = "premBadge";
    b.style.cssText = "display:inline-block;margin-left:8px;padding:3px 10px;border-radius:10px;font-size:11px;font-weight:800";
    if (me.isAdmin) {
      b.textContent = "ADMIN";
      b.style.background = "linear-gradient(90deg,#ff6b6b,#feca57,#48dbfb,#ff9ff3)";
      b.style.color = "#111";
    } else if (me.premium) {
      b.textContent = "PREMIUM";
      b.style.background = "linear-gradient(90deg,#f0c27a,#63e2b3)";
      b.style.color = "#111";
    } else {
      b.textContent = "NORMAL";
      b.style.background = "#333";
      b.style.color = "#aaa";
    }
    var target = null;
    var nodes = document.querySelectorAll("strong, h1, h2, h3, div, span");
    for (var i = 0; i < nodes.length; i++) {
      var txt = (nodes[i].textContent || "");
      if ((txt.indexOf("Ashutosh") > -1 || txt.indexOf("@") > -1) && nodes[i].children.length < 5) {
        target = nodes[i];
        break;
      }
    }
    if (target) target.appendChild(b);
  }

  function cards() {
    if (!me) return;
    var home = document.getElementById("view-home");
    if (!home) return;

    // Pay + Gift for non-premium
    if (!me.premium && !document.getElementById("premiumBox")) {
      var box = document.createElement("div");
      box.id = "premiumBox";
      box.style.cssText = "margin:12px 14px;padding:14px;border-radius:16px;background:#111827;border:1px solid #f0c27a66;text-align:center";
      var off = price.offer ? '<div style="color:#fb7185;font-size:12px;font-weight:600">' + price.offer + '</div>' : '';
      box.innerHTML = off +
        '<div style="color:#f0c27a;font-size:16px;font-weight:700">Go Premium</div>' +
        '<div style="color:#fff;font-size:20px;font-weight:800;margin:4px 0">₹' + price.price + '<span style="font-size:12px">/' + price.label + '</span></div>' +
        '<button id="payBtn" style="margin:8px 0;padding:10px 20px;border-radius:10px;border:0;background:#63e2b3;color:#111;font-weight:700">Pay Now</button>' +
        '<div style="font-size:12px;color:#9aa7b8;margin-top:8px">Have a gift code?</div>' +
        '<div style="display:flex;gap:6px;justify-content:center;margin-top:4px">' +
        '<input id="promoIn" placeholder="CODE" style="padding:8px;border-radius:8px;border:1px solid #444;background:#000;color:#fff;width:110px;text-transform:uppercase">' +
        '<button id="promoBtn" style="padding:8px 12px;border-radius:8px;border:0;background:#f0c27a;color:#111;font-weight:600">Apply</button></div>';
      var first = home.querySelector(".card, .glass");
      if (first) home.insertBefore(box, first.nextSibling);
      else home.insertBefore(box, home.firstChild);

      document.getElementById("payBtn").onclick = doPay;
      document.getElementById("promoBtn").onclick = doPromo;
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
      document.getElementById("genBtn").onclick = doGen;
    }
  }

  async function doPay() {
    var token = localStorage.getItem(TOKEN);
    toast("Opening payment...");
    await loadRazor();
    var r = await fetch("/api/premium/order", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + token } });
    var data = await r.json();
    if (!data.ok) return toast(data.error || "Order fail");
    new Razorpay({
      key: data.key, amount: data.amount, currency: "INR", name: "Sidhi Gym", description: "Premium", order_id: data.orderId,
      handler: function (resp) {
        fetch("/api/premium/verify", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + token }, body: JSON.stringify(resp) })
          .then(function (x) { return x.json(); }).then(function (d) {
            if (d.ok) { toast("Premium on!"); setTimeout(function () { location.reload(); }, 500); }
            else toast("Verify fail");
          });
      },
      theme: { color: "#63e2b3" }
    }).open();
  }

  function doPromo() {
    var c = (document.getElementById("promoIn").value || "").trim();
    if (!c) return toast("Code daalo");
    fetch("/api/premium/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + localStorage.getItem(TOKEN) },
      body: JSON.stringify({ code: c })
    }).then(function (r) { return r.json(); }).then(function (d) {
      if (d.ok) { toast("Applied " + d.days + " days"); setTimeout(function () { location.reload(); }, 600); }
      else toast(d.error || "Invalid code");
    });
  }

  function doGen() {
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
  }

  function boot() {
    var token = localStorage.getItem(TOKEN);
    if (!token) return;
    Promise.all([
      fetch("/api/me", { headers: { Authorization: "Bearer " + token } }).then(function (r) { return r.ok ? r.json() : null; }),
      fetch("/api/premium/price").then(function (r) { return r.json(); }).catch(function () { return {}; })
    ]).then(function (a) {
      if (!a[0]) return;
      me = a[0];
      if (a[1] && a[1].price) price = a[1];
      badge();
      cards();
    });
  }

  boot();
  setInterval(function () { badge(); cards(); }, 2000);
})();
