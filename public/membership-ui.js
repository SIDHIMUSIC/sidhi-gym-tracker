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
      card.innerHTML = '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap"><div><div style="font-size:11px;letter-spacing:.16em;color:#9aa7b8;font-weight:800">MEMBERSHIP STATUS</div><div id="membershipTitle" style="font-size:19px;font-weight:900;margin-top:7px">Checking status…</div></div><div id="membershipPill" style="padding:7px 11px;border-radius:999px;font-size:11px;font-weight:900">CHECKING</div></div><div id="membershipDetail" style="font-size:13px;color:#b8c7d9;line-height:1.5;margin-top:10px"></div><div id="membershipDaysWrap" style="margin-top:12px;display:none"><div style="display:flex;justify-content:space-between;gap:8px;font-size:12px;color:#b8c7d9"><span>Premium time remaining</span><b id="membershipDays"></b></div><div style="height:6px;background:#ffffff14;border-radius:99px;overflow:hidden;margin-top:7px"><div id="membershipBar" style="height:100%;width:100%;border-radius:99px;background:linear-gradient(90deg,#f0c27a,#63e2b3)"></div></div></div>';
      profile.insertBefore(card, profile.firstChild);
    }
    return card;
  }
  function paint(me) {
    var profile = document.getElementById("view-profile");
    if (!profile || !me) return;
    var card = cardFor(profile), title = document.getElementById("membershipTitle"), pill = document.getElementById("membershipPill"), detail = document.getElementById("membershipDetail"), wrap = document.getElementById("membershipDaysWrap"), daysEl = document.getElementById("membershipDays"), bar = document.getElementById("membershipBar"), d = daysLeft(me);
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
      if (d != null) {
        wrap.style.display = "block"; daysEl.textContent = d + (d === 1 ? " day left" : " days left");
        bar.style.width = Math.max(0, Math.min(100, d / 30 * 100)) + "%";
        bar.style.background = d <= 3 ? "linear-gradient(90deg,#fb7185,#f97316)" : "linear-gradient(90deg,#f0c27a,#63e2b3)";
      } else wrap.style.display = "none";
    } else {
      card.style.background = "rgba(16,24,34,.42)"; card.style.borderColor = "rgba(255,255,255,.14)";
      title.style.background = "none"; title.style.color = "#cbd5e1"; title.textContent = "NORMAL MEMBER";
      pill.textContent = "NORMAL"; pill.style.background = "#334155"; pill.style.color = "#cbd5e1";
      detail.textContent = "You are using the normal plan. Upgrade to Premium to unlock premium-only features.";
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