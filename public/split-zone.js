(function () {
  function el(id) { return document.getElementById(id); }
  function num(v) {
    var n = Number(v);
    return Number.isFinite(n) && n > 0 ? Math.round(n * 1000) / 1000 : null;
  }
  function amp(t) {
    if (!t) return "";
    var p = String(t).split(":");
    var h = Number(p[0]); var m = (p[1] || "00").slice(0, 2);
    if (!Number.isFinite(h)) return t;
    var ap = h >= 12 ? "PM" : "AM";
    var h12 = h % 12; if (!h12) h12 = 12;
    return h12 + ":" + m + " " + ap;
  }

  if (typeof api === "function" && !api._runSafe) {
    var _api = api;
    api = async function (path, opts) {
      if (path === "/api/session" && opts && opts.body) {
        var old = (typeof currentRow === "function" && currentRow()) || (typeof todayRow === "function" && todayRow()) || {};
        var b = opts.body;
        if (Array.isArray(b.runs) && b.runs.length > (old.runs || []).length) {
          if (old.entryTime) b.entryTime = old.entryTime;
          if (old.afterTreadmillTime) b.afterTreadmillTime = old.afterTreadmillTime;
          if (old.entryWeight != null) b.entryWeight = old.entryWeight;
          if (old.afterTreadmillWeight != null) b.afterTreadmillWeight = old.afterTreadmillWeight;
          if (old.beforeTreadmillTime) b.beforeTreadmillTime = old.beforeTreadmillTime;
          if (old.beforeTreadmillKm != null) b.beforeTreadmillKm = old.beforeTreadmillKm;
          if (old.beforeTreadmillMins != null) b.beforeTreadmillMins = old.beforeTreadmillMins;
          if (old.beforeTreadmillSpeed != null) b.beforeTreadmillSpeed = old.beforeTreadmillSpeed;
          if (old.after1HourNote) b.after1HourNote = old.after1HourNote;
          if (old.after1HourTime) b.after1HourTime = old.after1HourTime;
        }
      }
      return _api(path, opts);
    };
    api._runSafe = true;
  }

  function paintTodayWeight() {
    var box = el("resultText");
    var sub = el("resultSub");
    if (!box) return;
    var row = (typeof currentRow === "function" && currentRow()) || {};
    var start = num(el("entryWeight") && el("entryWeight").value) || num(row.entryWeight);
    var end = num(el("afterTreadmillWeight") && el("afterTreadmillWeight").value) || num(row.afterTreadmillWeight);
    if (start == null && end == null) {
      box.textContent = "Add gym start weight";
      if (sub) sub.textContent = "Start vs end weight.";
      return;
    }
    if (start != null && end == null) {
      box.textContent = "Start " + start + " kg";
      if (sub) sub.textContent = "End weight daalo result ke liye.";
      return;
    }
    if (start == null && end != null) {
      box.textContent = "End " + end + " kg";
      return;
    }
    var d = Math.round((end - start) * 1000) / 1000;
    if (d < 0) {
      box.className = "today-box delta down";
      box.textContent = "Down " + Math.abs(d) + " kg  →  " + end + " kg";
      if (sub) sub.textContent = "Start " + start + " kg  •  end " + end + " kg";
    } else if (d > 0) {
      box.className = "today-box delta up";
      box.textContent = "Up " + d + " kg  →  " + end + " kg";
      if (sub) sub.textContent = "Start " + start + " kg  •  end " + end + " kg";
    } else {
      box.textContent = "Same " + end + " kg";
      if (sub) sub.textContent = "Start " + start + " kg";
    }
  }
  if (typeof fillForm === "function") {
    var _ff = fillForm;
    fillForm = function () { _ff(); paintTodayWeight(); };
  }
  ["entryWeight", "afterTreadmillWeight"].forEach(function (id) {
    var n = el(id);
    if (n) n.addEventListener("input", paintTodayWeight);
  });
  paintTodayWeight();

  var runBox = el("histRun");
  if (runBox) {
    var card = runBox.closest(".hist-card") || runBox.closest(".glass");
    if (card) card.style.display = "none";
  }

  function runListHtml() {
    var list = (typeof sessions !== "undefined" && sessions) || [];
    var cards = [];
    list.forEach(function (s) {
      (s.runs || []).forEach(function (r) {
        var st = r.startedAt ? new Date(r.startedAt) : null;
        var t = st ? amp(String(st.getHours()).padStart(2, "0") + ":" + String(st.getMinutes()).padStart(2, "0")) : "";
        cards.push('<div class="hist-item"><div><b>' + (r.mode || "run") + '</b><div class="sub">' + s.date + (t ? " • " + t : "") + '</div><div class="sub">' + (Number(r.distanceKm) || 0).toFixed(2) + " km • " + Math.round((Number(r.durationSec) || 0) / 60) + " min • " + Math.round(Number(r.calories) || 0) + " kcal</div></div></div>");
      });
    });
    return cards.join("") || '<p class="sub">no morning runs yet</p>';
  }
  function paintRunHist() {
    var box = el("runOnlyHist");
    if (box) box.innerHTML = runListHtml();
  }
  function ensureRunHist() {
    var ov = el("runOv");
    if (!ov || el("runOnlyHist")) { paintRunHist(); return; }
    var wrap = ov.querySelector(".wrap") || ov;
    var card = document.createElement("div");
    card.className = "glass card";
    card.style.marginTop = "16px";
    card.innerHTML = "<h2>morning run history</h2><div class=\"hist-list\" id=\"runOnlyHist\"></div>";
    wrap.appendChild(card);
    paintRunHist();
  }
  ensureRunHist();
  if (typeof paintHist === "function") {
    var _phist = paintHist;
    paintHist = function () { _phist(); var rb = el("histRun"); if (rb) { var c = rb.closest(".glass") || rb.closest(".hist-card"); if (c) c.style.display = "none"; } paintRunHist(); };
  }
  if (typeof paintHome === "function") {
    var _ph = paintHome;
    paintHome = function () { _ph(); paintTodayWeight(); paintRunHist(); };
  }

  var bar = el("tabbar");
  if (bar && !bar.querySelector('[data-tab="run"]')) {
    var b = document.createElement("button");
    b.className = "tab"; b.type = "button"; b.dataset.tab = "run";
    b.innerHTML = '<span class="ticon">🏃</span><span class="tlab">run</span>';
    var hist = bar.querySelector('[data-tab="history"]');
    if (hist) bar.insertBefore(b, hist);
    else bar.appendChild(b);
    b.onclick = function (e) {
      e.preventDefault();
      document.querySelectorAll("#tabbar .tab").forEach(function (t) { t.classList.remove("on"); });
      b.classList.add("on");
      var ov = el("runOv");
      if (ov) { ov.classList.add("on"); ensureRunHist(); paintRunHist(); }
    };
  }
  var close = el("runCloseBtn");
  if (close) {
    close.addEventListener("click", function () {
      var t = document.querySelector('#tabbar .tab[data-tab="home"]');
      if (t && typeof showTab === "function") showTab("home");
    });
  }

  var _show = window.showProfile;
  window.showProfile = function () {
    if (typeof _show === "function") _show();
    var edit = el("pfName") && el("pfName").closest(".glass");
    if (!edit || el("pfWeight")) return;
    var box = document.createElement("div");
    var row = typeof todayRow === "function" ? todayRow() : {};
    box.innerHTML = '<label>start weight (kg)</label><input id="pfWeight" inputmode="decimal" placeholder="72.4" /><label>end weight (kg)</label><input id="pfEndW" inputmode="decimal" placeholder="73" /><label>goal weight (kg)</label><input id="pfGoal" inputmode="decimal" placeholder="70" />';
    var btn = el("pfSave");
    if (btn) edit.insertBefore(box, btn);
    if (el("pfWeight") && row && row.entryWeight != null) el("pfWeight").value = row.entryWeight;
    if (el("pfEndW") && row && row.afterTreadmillWeight != null) el("pfEndW").value = row.afterTreadmillWeight;
    if (el("pfGoal") && typeof goalWeight !== "undefined" && goalWeight != null) el("pfGoal").value = goalWeight;
    if (!btn) return;
    var old = btn.onclick;
    btn.onclick = async function () {
      if (typeof old === "function") await old();
      try {
        if (el("pfGoal") && el("pfGoal").value) {
          var data = await api("/api/me", { method: "PATCH", body: { goalWeight: Number(el("pfGoal").value) } });
          goalWeight = data.goalWeight;
        }
        if (el("date") && typeof todayISO === "function") el("date").value = todayISO();
        if (el("pfWeight") && el("entryWeight") && el("pfWeight").value) el("entryWeight").value = el("pfWeight").value;
        if (el("pfEndW") && el("afterTreadmillWeight") && el("pfEndW").value) el("afterTreadmillWeight").value = el("pfEndW").value;
        if (typeof save === "function") await save(false);
        paintTodayWeight();
        if (typeof toast === "function") toast("Weight saved");
      } catch (e) {}
    };
  };
})();
