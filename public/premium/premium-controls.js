// SIDHI GYM — admin-only Premium feature controls.
(function () {
  "use strict";
  var TOKEN_KEY = "sidhi-gym-token";
  var featureList = [
    ["dailyReview", "Daily AI Check-in / Day Review"],
    ["coachAnalytics", "Gym Coach & Progress Analytics"],
    ["aiCoach", "SIDHI AI Gym Coach"],
    ["workoutBuilder", "Custom Workout Builder"],
    ["transformationTracker", "Transformation Tracker"],
    ["foodDiary", "Premium Food Diary & AI Nutrition"],
    ["nutritionRecovery", "Nutrition & Recovery Calculator"],
    ["workoutHistory", "Workout History & CSV"],
    ["restTimer", "Rest & Superset Timer"],
    ["smartReminders", "Smart Reminders"],
    ["achievements", "Achievements & Challenges"],
    ["reports", "Export & Monthly Reports"],
    ["goalPrograms", "Four-week Goal Programs"],
    ["themes", "Gold Profile & Dashboard Themes"]
  ];
  function token() { try { return localStorage.getItem(TOKEN_KEY) || ""; } catch (_) { return ""; } }
  function request(url, method, body) {
    return fetch(url, {
      method: method || "GET",
      headers: { Authorization: "Bearer " + token(), "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store"
    }).then(function (r) {
      return r.json().then(function (data) {
        if (!r.ok) throw new Error(data.error || "Request failed");
        return data;
      });
    });
  }
  function apply(flags) {
    window.SIDHI_PREMIUM_FLAGS = flags;
    window.dispatchEvent(new CustomEvent("sidhi-premium-flags-updated", { detail: flags }));
    var tab = document.querySelector('.premium-tab[data-tab="premium"]');
    if (tab) tab.style.display = flags.masterEnabled === false && !window.SIDHI_IS_ADMIN ? "none" : "";
  }
  function makePanel(flags) {
    var view = document.getElementById("view-premium");
    if (!view || document.getElementById("sidhiPremiumAdminControls")) return;
    var panel = document.createElement("section");
    panel.id = "sidhiPremiumAdminControls";
    panel.className = "glass card";
    panel.style.cssText = "margin:10px 0 16px;padding:16px;border:1px solid #f0c27a;border-radius:16px;background:#101722;color:#f6f1e8";
    panel.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap"><div><div style="font-size:10px;letter-spacing:.16em;color:#f0c27a;font-weight:900">ADMIN CONTROL CENTER</div><h2 style="margin:7px 0">Premium Feature Switches</h2><p style="font-size:12px;color:#9aa7b8;margin:0">Changes save to the server and apply to all users.</p></div><button id="sidhiPremiumSaveAll" type="button" style="padding:9px 12px;border:0;border-radius:10px;background:#f0c27a;color:#111;font-weight:900">Save settings</button></div><label style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin:16px 0;padding:13px;border:1px solid #ffffff24;border-radius:12px;font-weight:900"><span>MASTER SWITCH<br><small style="font-weight:400;color:#9aa7b8">OFF = hide the complete Premium Studio for normal users</small></span><input id="sidhiPremiumMaster" type="checkbox" style="width:22px;height:22px;accent-color:#63e2b3"></label><div id="sidhiPremiumFeatureList" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:8px"></div><div id="sidhiPremiumControlStatus" role="status" style="font-size:12px;color:#9aa7b8;margin-top:12px">Loading settings…</div>';
    view.insertBefore(panel, view.firstChild);
    var master = panel.querySelector("#sidhiPremiumMaster");
    var list = panel.querySelector("#sidhiPremiumFeatureList");
    var status = panel.querySelector("#sidhiPremiumControlStatus");
    master.checked = flags.masterEnabled !== false;
    list.innerHTML = featureList.map(function (item) {
      var enabled = !flags.features || flags.features[item[0]] !== false;
      return '<label style="display:flex;align-items:center;gap:10px;padding:11px;border:1px solid #ffffff18;border-radius:11px;background:#ffffff04;font-size:12px"><input type="checkbox" data-feature-key="' + item[0] + '" ' + (enabled ? "checked" : "") + ' style="width:18px;height:18px;accent-color:#63e2b3;flex:0 0 auto"><span>' + item[1] + '</span></label>';
    }).join("");
    function readForm() {
      var features = {};
      list.querySelectorAll("[data-feature-key]").forEach(function (el) { features[el.getAttribute("data-feature-key")] = el.checked; });
      return { masterEnabled: master.checked, features: features };
    }
    function save() {
      status.textContent = "Saving settings…";
      var body = readForm();
      request("/api/admin/premium-features", "PUT", body).then(function (saved) {
        apply(saved);
        status.textContent = "Saved ✓ · " + (saved.masterEnabled ? "Premium Studio ON" : "Premium Studio OFF") + " · Changes apply globally.";
      }).catch(function (err) { status.textContent = "Save failed: " + err.message; });
    }
    panel.querySelector("#sidhiPremiumSaveAll").onclick = save;
    master.onchange = save;
    list.querySelectorAll("[data-feature-key]").forEach(function (el) { el.onchange = save; });
    status.textContent = "Loaded ✓ · " + (flags.masterEnabled ? "Master ON" : "Master OFF");
  }
  function init() {
    var t = token();
    if (!t) return;
    request("/api/me").then(function (me) {
      window.SIDHI_IS_ADMIN = !!me.isAdmin;
      if (!me.isAdmin) return;
      return request("/api/admin/premium-features").then(function (flags) {
        apply(flags);
        makePanel(flags);
      });
    }).catch(function () {});
  }
  window.addEventListener("load", function () { setTimeout(init, 900); });
  document.addEventListener("click", function (e) {
    if (e.target && e.target.closest && e.target.closest('.tab[data-tab="premium"]')) {
      setTimeout(function () { if (window.SIDHI_IS_ADMIN && !document.getElementById("sidhiPremiumAdminControls")) init(); }, 100);
    }
  });
})();