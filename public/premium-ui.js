// Sidhi Gym Premium — dynamic price + Razorpay
(function () {
  var TOKEN = "sidhi-gym-token";

  function toast(m) {
    var t = document.getElementById("toast");
    if (!t) return;
    t.textContent = m;
    t.style.display = "block";
    setTimeout(function () { t.style.display = "none"; }, 2200);
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
    var nameEl = document.querySelector("#view-profile strong, #view-profile h1, #view-profile h2");
    if (nameEl) nameEl.appendChild(b);
  }

  function homeCard(me, priceInfo) {
    var old = document.getElementById("premiumBox");
    if (old) old.remove();
    if (!me || me.premium) return;
    var price = priceInfo.price || 99;
    var label = priceInfo.label || "year";
    var offer = priceInfo.offer || "";
    var box = document.createElement("div");
    box.id = "premiumBox";
    box.style.cssText = "margin:12px 14px 6px;padding:14px;border-radius:16px;background:linear-gradient(135deg,#111827,#1a1a2e);border:1px solid #f0c27a55;text-align:center";
    var offerHtml = offer ? '<div style="color:#fb7185;font-size:12px;font-weight:600;margin-bottom:4px">' + offer + '</div>' : '';
    box.innerHTML = offerHtml + '<div style="color:#f0c27a;font-size:17px;font-weight:700">Go Premium</div><div style="color:#fff;font-size:22px;font-weight:800;margin:4px 0">₹' + price + '<span style="font-size:13px;font-weight:500">/' + label + '</span></div><div style="font-size:12px;color:#9aa7b8;margin-bottom:10px">Unlimited history · CSV export</div><button id="premUp" style="padding:10px 28px;border-radius:12px;border:0;background:#63e2b3;color:#111;font-weight:700;font-size:15px">Pay with UPI / Card</button>';
    var home = document.getElementById("view-home");
    if (home) {
      var first = home.querySelector(".card, .glass") || home.firstElementChild;
      if (first) home.insertBefore(box, first.nextSibling);
      else home.appendChild(box);
    }
    var btn = document.getElementById("premUp");
    if (btn) btn.onclick = function () { startPay(price); };
  }

  async function startPay(price) {
    var token = localStorage.getItem(TOKEN);
    if (!token) return toast("Login first");
    toast("Opening payment...");
    await loadRazor();
    var r = await fetch("/api/premium/order", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token }
    });
    var data = await r.json();
    if (!data.ok) return toast(data.error || "Order fail");
    var options = {
      key: data.key,
      amount: data.amount,
      currency: "INR",
      name: "Sidhi Gym",
      description: "Premium",
      order_id: data.orderId,
      handler: function (response) {
        fetch("/api/premium/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
          body: JSON.stringify(response)
        }).then(function (x) { return x.json(); }).then(function (d) {
          if (d.ok) { toast("Premium activated!"); setTimeout(function () { location.reload(); }, 700); }
          else toast(d.error || "Verify fail");
        });
      },
      prefill: { name: data.username },
      theme: { color: "#63e2b3" }
    };
    var rzp = new Razorpay(options);
    rzp.open();
  }

  function run() {
    var token = localStorage.getItem(TOKEN);
    if (!token) return;
    Promise.all([
      fetch("/api/me", { headers: { Authorization: "Bearer " + token } }).then(function (r) { return r.ok ? r.json() : null; }),
      fetch("/api/premium/price").then(function (r) { return r.json(); })
    ]).then(function (res) {
      var me = res[0], price = res[1] || {};
      if (!me) return;
      badge(!!me.premium);
      homeCard(me, price);
    });
  }

  setTimeout(run, 1000);
  setTimeout(run, 2500);
})();
