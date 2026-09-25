(function () {
  function el(id) { return document.getElementById(id); }
  var ICO = { home: "⌂", workout: "✦", progress: "◈", history: "☰" };
  function miniAv() {
    var g = (window.__gender || "").toLowerCase();
    var fill = g === "female" ? "#ff4f8b" : "#2b6cff";
    return '<svg viewBox="0 0 32 32" width="22" height="22"><circle cx="16" cy="16" r="16" fill="#141822"/><circle cx="16" cy="13" r="6" fill="#e0b089"/><path d="M6 30c2-8 6-11 10-11s8 3 10 11" fill="' + fill + '"/></svg>';
  }
  function paintTabs() {
    document.querySelectorAll("#tabbar .tab").forEach(function (b) {
      var name = b.dataset.tab;
      if (name === "profile") {
        b.innerHTML = miniAv() + '<span class="tlab">profile</span>';
      } else if (ICO[name]) {
        b.innerHTML = "<span class=\"ticon\">" + ICO[name] + "</span><span class=\"tlab\">" + name + "</span>";
      }
    });
  }
  if (!document.getElementById("tabs-fix-css")) {
    var st = document.createElement("style");
    st.id = "tabs-fix-css";
    st.textContent = "#tabbar .tab{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;line-height:1}#tabbar .ticon{font-size:16px}#tabbar .tlab{font-size:9px;letter-spacing:.06em}";
    document.head.appendChild(st);
  }
  paintTabs();

  var _show = window.showProfile;
  if (typeof _show === "function") {
    window.showProfile = function () {
      _show();
      var card = el("view-profile") && el("view-profile").querySelector(".glass.card");
      if (!card || el("pfWeight")) {
        var edit = el("pfName") && el("pfName").closest(".glass");
        if (edit && !el("pfWeight")) {
          var box = document.createElement("div");
          box.innerHTML = '<label>current weight (kg)</label><input id="pfWeight" inputmode="decimal" placeholder="73.7" /><label>goal weight (kg)</label><input id="pfGoal" inputmode="decimal" placeholder="70" />';
          var btn = el("pfSave");
          if (btn) edit.insertBefore(box, btn);
          var row = typeof todayRow === "function" ? todayRow() : null;
          if (el("pfWeight") && row && row.entryWeight) el("pfWeight").value = row.entryWeight;
          if (el("pfGoal") && typeof goalWeight !== "undefined" && goalWeight != null) el("pfGoal").value = goalWeight;
          if (btn) {
            var old = btn.onclick;
            btn.onclick = async function () {
              if (typeof old === "function") await old();
              try {
                if (el("pfGoal") && el("pfGoal").value) {
                  var data = await api("/api/me", { method: "PATCH", body: { goalWeight: Number(el("pfGoal").value) } });
                  goalWeight = data.goalWeight;
                }
                if (el("pfWeight") && el("pfWeight").value && typeof save === "function") {
                  var d = document.getElementById("date");
                  var w = document.getElementById("entryWeight");
                  if (d && !d.value && typeof todayISO === "function") d.value = todayISO();
                  if (w) w.value = el("pfWeight").value;
                  await save(false);
                }
                if (typeof paintHome === "function") paintHome();
              } catch (e) {}
            };
          }
        }
        return;
      }
    };
  }
  if (typeof afterAuth === "function") {
    var _aa = afterAuth;
    afterAuth = async function () {
      await _aa();
      try {
        var me = await api("/api/me");
        window.__gender = me.gender || "";
        window.__displayName = me.displayName || "";
      } catch (e) {}
      paintTabs();
    };
  }
})();
