(function () {
  var TOKEN_KEY = "sidhi-gym-token", busy = false;
  function daysLeft(me) {
    if (me.premiumDaysLeft != null) return Number(me.premiumDaysLeft);
    return me.premiumUntil ? Math.max(0, Math.ceil((new Date(me.premiumUntil).getTime() - Date.now()) / 86400000)) : null;
  }
  function cardFor(profile) {
    var card = document.getElementById("membershipCard");
    if (!card) {
      card = document.createElement("section");
      card.id = "membershipCard";
      card.className = "glass card";
      card.style.cssText = "margin:12px 0;border:1px solid rgba(240,194,122,.28);overflow:hidden";
      card.innerHTML = '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap"><div><div style="font-size:11px;letter-spacing:.16em;color:#9aa7b8;font-weight:800">MEMBERSHIP STATUS</div><div id="membershipTitle" style="font-size:19px;font-weight:900;margin-top:7px">Checking status…</div></div><div id="membershipPill" style="padding:7px 11px;border-radius:999px;font-size:11px;font-weight:900">CHECKING</div></div><div id="membershipDetail" style="font-size:13px;color:#b8c7d9;line-height:1.5;margin-top:10px"></div><div id="membershipDaysWrap" style="margin-top:12px;display:none"><div style="display:flex;justify-content:space-between;gap:8px;font-size:12px;color:#b8c7d9"><span>Premium time remaining</span><b id="membershipDays"></b></div><div style="height:6px;background:#ffffff14;border-radius:99px;overflow:hidden;margin-top:7px"><div id="membershipBar" style="height:100%;width:100%;border-radius:99px;background:linear-gradient(90deg,#f0c27a,#63e2b3)"></div></div></div><div id="membershipActions" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px"><button id="enablePremiumNotifications" type="button" style="padding:9px 12px;border:1px solid #64748b;border-radius:10px;background:#172033;color:#fff;font-weight:700">Enable expiry reminders</button><button id="premiumExportBtn" type="button" style="padding:9px 12px;border:0;border-radius:10px;background:linear-gradient(90deg,#f0c27a,#63e2b3);color:#111;font-weight:800">Download workout CSV</button><button id="membershipRenewBtn" type="button" style="display:none;padding:9px 12px;border:0;border-radius:10px;background:#f0c27a;color:#111;font-weight:800">Renew Premium</button><button id="premiumInsightsBtn" type="button" style="padding:9px 12px;border:1px solid #f0c27a;border-radius:10px;background:#172033;color:#f0c27a;font-weight:800">View Workout Insights</button></div><div id="premiumInsightsBox" style="display:none;margin-top:12px;padding:12px;border-radius:12px;background:#070b12;color:#dbeafe;font-size:13px;line-height:1.8"></div>';
      profile.insertBefore(card, profile.firstChild);
      var notifyBtn = card.querySelector("#enablePremiumNotifications");
      if (notifyBtn) notifyBtn.onclick = function () {
        if (!("Notification" in window)) { alert("Is browser mein notifications supported nahi hain."); return; }
        Notification.requestPermission().then(function (permission) {
          notifyBtn.textContent = permission === "granted" ? "Browser reminders enabled ✓" : "Notifications not enabled";
          if (permission === "granted") alert("Expiry reminders enabled. Reminder app open hone par dikhega.");
        });
      };
      var exportBtn = card.querySelector("#premiumExportBtn");
      if (exportBtn) exportBtn.onclick = async function () {
        var token = localStorage.getItem(TOKEN_KEY) || "";
        exportBtn.disabled = true; exportBtn.textContent = "Preparing…";
        try {
          var response = await fetch("/api/export.csv", { headers: { Authorization: "Bearer " + token }, cache: "no-store" });
          if (!response.ok) {
            var err = {}; try { err = await response.json(); } catch (e) {}
            throw new Error(err.error || "Premium required");
          }
          var blob = await response.blob(), url = URL.createObjectURL(blob), a = document.createElement("a");
          a.href = url; a.download = "sidhi-gym-export.csv"; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
          exportBtn.textContent = "CSV downloaded ✓";
        } catch (e) { alert(e.message || "Export failed"); exportBtn.textContent = "Download workout CSV"; }
        finally { exportBtn.disabled = false; }
      };
      var insightsBtn = card.querySelector("#premiumInsightsBtn");
      if (insightsBtn) insightsBtn.onclick = async function () {
        var box = card.querySelector("#premiumInsightsBox"), token = localStorage.getItem(TOKEN_KEY) || "";
        insightsBtn.disabled = true; insightsBtn.textContent = "Loading insights…";
        try {
          var response = await fetch("/api/premium/insights", { headers: { Authorization: "Bearer " + token }, cache: "no-store" });
          var data = await response.json();
          if (!response.ok || !data.ok) throw new Error(data.error || "Insights load nahi hue");
          box.style.display = "block";
          box.textContent = "Total workouts: " + data.totalWorkouts + " · Completed: " + data.completedWorkouts + " · Cardio: " + data.cardioKm + " km · Best recorded start weight: " + (data.bestRecordedWeight == null ? "—" : data.bestRecordedWeight + " kg") + " · Latest start weight: " + (data.latestWeight == null ? "—" : data.latestWeight + " kg");
          insightsBtn.textContent = "Refresh Workout Insights";
        } catch (e) { alert(e.message || "Insights load nahi hue"); insightsBtn.textContent = "View Workout Insights"; }
        finally { insightsBtn.disabled = false; }
      };
      var renewBtn = card.querySelector("#membershipRenewBtn");
      if (renewBtn) renewBtn.onclick = function () {
        var pay = document.getElementById("payBtn");
        if (pay) { pay.click(); return; }
        var homeTab = document.querySelector('.tab[data-tab="home"]');
        if (homeTab) homeTab.click();
        setTimeout(function () { var b = document.getElementById("payBtn"); if (b) b.click(); }, 350);
      };
    }
    return card;
  }
  function paint(me) {
    var profile = document.getElementById("view-profile");
    if (!profile || !me) return;
    var card = cardFor(profile), title = document.getElementById("membershipTitle"), pill = document.getElementById("membershipPill"), detail = document.getElementById("membershipDetail"), wrap = document.getElementById("membershipDaysWrap"), daysEl = document.getElementById("membershipDays"), bar = document.getElementById("membershipBar"), d = daysLeft(me);
    var actions = document.getElementById("membershipActions"), notifyBtn = document.getElementById("enablePremiumNotifications"), exportBtn = document.getElementById("premiumExportBtn"), renewBtn = document.getElementById("membershipRenewBtn"), insightsBtn = document.getElementById("premiumInsightsBtn");
    if (actions) actions.style.display = (me.premium || me.isAdmin) ? "flex" : "none";
    if (notifyBtn) notifyBtn.style.display = (me.premium && !me.isAdmin) ? "inline-block" : "none";
    if (exportBtn) exportBtn.style.display = (me.premium || me.isAdmin) ? "inline-block" : "none";
    if (insightsBtn) insightsBtn.style.display = (me.premium || me.isAdmin) ? "inline-block" : "none";
    if (me.isAdmin) {
      card.style.background = "linear-gradient(120deg,rgba(255,107,107,.14),rgba(167,139,250,.16),rgba(72,219,251,.12))";
      card.style.borderColor = "rgba(167,139,250,.7)";
      title.textContent = "ADMIN • LIFETIME PREMIUM";
      title.style.background = "linear-gradient(90deg,#ff6b6b,#feca57,#48dbfb,#ff9ff3)";
      title.style.webkitBackgroundClip = "text"; title.style.backgroundClip = "text"; title.style.color = "transparent";
      pill.textContent = "LIFETIME"; pill.style.background = "linear-gradient(90deg,#ff6b6b,#feca57,#48dbfb,#ff9ff3)"; pill.style.color = "#111";
      detail.textContent = "Admin access is active permanently. All premium features are enabled; no expiry or renewal required.";
      wrap.style.display = "none";
    } else if (me.premium) {
      card.style.background = "linear-gradient(120deg,rgba(240,194,122,.13),rgba(99,226,179,.10))";
      card.style.borderColor = "rgba(240,194,122,.6)";
      title.style.background = "none"; title.style.color = "#f0c27a"; title.textContent = "PREMIUM MEMBER";
      pill.textContent = "ACTIVE"; pill.style.background = "linear-gradient(90deg,#f0c27a,#63e2b3)"; pill.style.color = "#062014";
      detail.textContent = "Premium is active. All premium features are unlocked.";
      if (renewBtn) renewBtn.style.display = (d != null && d <= 2) ? "inline-block" : "none";
      if (d != null) {
        wrap.style.display = "block"; daysEl.textContent = d + (d === 1 ? " day left" : " days left");
        bar.style.width = Math.max(0, Math.min(100, d / 30 * 100)) + "%";
        bar.style.background = d <= 3 ? "linear-gradient(90deg,#fb7185,#f97316)" : "linear-gradient(90deg,#f0c27a,#63e2b3)";
      } else wrap.style.display = "none";
    } else {
      card.style.background = "rgba(16,24,34,.42)"; card.style.borderColor = "rgba(255,255,255,.14)";
      title.style.background = "none"; title.style.color = "#cbd5e1"; title.textContent = "NORMAL MEMBER";
      pill.textContent = "NORMAL"; pill.style.background = "#334155"; pill.style.color = "#cbd5e1";
      detail.textContent = "You are using the normal plan. Upgrade to Premium to unlock CSV workout export and member-only tools.";
      if (renewBtn) renewBtn.style.display = "none";
      wrap.style.display = "none";
    }
  }
  async function sync() {
    if (busy) return;
    var token = ""; try { token = localStorage.getItem(TOKEN_KEY) || ""; } catch (e) {}
    if (!token) return;
    busy = true;
    try {
      var r = await fetch("/api/me", { headers: { Authorization: "Bearer " + token }, cache: "no-store" });
      if (!r.ok) return;
      var me = await r.json(); if (me && me.ok) paint(me);
    } catch (e) {
      // Keep the last known status if the connection is temporarily unavailable.
    } finally { busy = false; }
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("button");
    if (b && /profile|account/i.test((b.textContent || "") + " " + (b.getAttribute("data-tab") || ""))) setTimeout(sync, 150);
  });
  window.addEventListener("focus", sync);
  setInterval(sync, 5000);
  sync();
})();