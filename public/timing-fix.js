(function () {
  function el(id) { return document.getElementById(id); }
  function istHour() {
    return Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" }).format(new Date()));
  }
  function firstName() {
    var n = window.__displayName || (typeof username !== "undefined" ? username : "") || "";
    return String(n).trim().split(/\s+/)[0] || "Athlete";
  }
  function wish() {
    var h = istHour();
    var n = firstName();
    if (h >= 4 && h < 12) return "Good Morning, " + n + " \u2600\uFE0F";
    if (h >= 12 && h < 17) return "Good Afternoon, " + n + " \u26C5";
    if (h >= 17 && h < 21) return "Good Evening, " + n + " \uD83C\uDF06";
    return "Good Night, " + n + " \uD83C\uDF19";
  }
  function applyWish() {
    var h = el("hello");
    if (h) h.textContent = wish();
  }
  if (typeof paintHome === "function") {
    var _ph = paintHome;
    paintHome = function () { _ph(); applyWish(); };
  }
  applyWish();

  function nowHHMM() {
    if (typeof nowTime === "function") return nowTime();
    var d = new Date();
    return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
  }
  function savedRow() {
    return typeof currentRow === "function" ? currentRow() : null;
  }
  function hasEndKg() {
    var v = el("afterTreadmillWeight") && el("afterTreadmillWeight").value;
    var n = Number(v);
    return v !== "" && Number.isFinite(n) && n > 0;
  }
  function autoOnOpen() {
    var row = savedRow() || {};
    if (el("entryTime")) el("entryTime").value = row.entryTime || nowHHMM();
    if (el("after1HourTime")) el("after1HourTime").value = row.after1HourTime || nowHHMM();
    if (el("entryWeight")) {
      el("entryWeight").value = (row.entryWeight != null && row.entryWeight !== "") ? row.entryWeight : "";
    }
    if (el("afterTreadmillWeight")) {
      el("afterTreadmillWeight").value = (row.afterTreadmillWeight != null && row.afterTreadmillWeight !== "") ? row.afterTreadmillWeight : "";
    }
    if (el("exitTime")) {
      if (row.afterTreadmillWeight != null && (row.exitTime || row.afterTreadmillTime)) {
        el("exitTime").value = row.exitTime || row.afterTreadmillTime;
      } else if (!row.afterTreadmillWeight) {
        el("exitTime").value = "";
      }
    }
  }

  function ensureEndTime() {
    if (el("exitTime")) return;
    var w = el("afterTreadmillWeight");
    if (!w || !w.parentNode) return;
    var wrap = w.closest(".glass") || w.parentNode;
    var grid = document.createElement("div");
    grid.className = "grid";
    var a = document.createElement("div");
    a.innerHTML = '<label>end time</label><input type="time" id="exitTime" />';
    var b = document.createElement("div");
    w.parentNode.removeChild(w);
    b.innerHTML = "<label>end weight (kg)</label>";
    b.appendChild(w);
    wrap.appendChild(grid);
    grid.appendChild(a);
    grid.appendChild(b);
  }
  ensureEndTime();

  function stampExitIfWeight() {
    ensureEndTime();
    if (!hasEndKg()) return;
    var t = nowHHMM();
    if (el("exitTime")) el("exitTime").value = t;
    if (el("afterTreadmillTime")) el("afterTreadmillTime").value = t;
  }

  var wgt = el("afterTreadmillWeight");
  if (wgt && !wgt._exitBind) {
    wgt._exitBind = true;
    wgt.addEventListener("change", stampExitIfWeight);
    wgt.addEventListener("blur", stampExitIfWeight);
  }

  if (typeof fillForm === "function") {
    var _ff = fillForm;
    fillForm = function () {
      _ff();
      ensureEndTime();
      autoOnOpen();
    };
  }
  if (typeof showTab === "function" && !showTab._autoT) {
    var _st = showTab;
    showTab = function (name) {
      _st(name);
      if (name === "workout") setTimeout(autoOnOpen, 0);
    };
    showTab._autoT = true;
  }
  setTimeout(autoOnOpen, 200);

  function mergeOld(body) {
    var old = savedRow() || {};
    ["after1HourNote","beforeTreadmillTime","beforeTreadmillKm","beforeTreadmillMins","beforeTreadmillSpeed","beforeTreadmillNote","afterTreadmillKm","afterTreadmillMins","afterTreadmillSpeed","afterTreadmillNote","runs"].forEach(function (k) {
      if (body[k] == null || body[k] === "") {
        if (old[k] != null && old[k] !== "") body[k] = old[k];
      }
    });
    if (hasEndKg() && el("exitTime") && el("exitTime").value) {
      body.afterTreadmillTime = el("exitTime").value;
    }
    return body;
  }
  if (typeof formBody === "function") {
    var _fb = formBody;
    formBody = function (finished) {
      if (hasEndKg()) stampExitIfWeight();
      return mergeOld(_fb(finished));
    };
  }
  if (typeof save === "function") {
    var _save = save;
    save = async function (finished) {
      if (hasEndKg()) stampExitIfWeight();
      return _save(finished);
    };
  }
})();
