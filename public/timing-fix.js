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
  function hourOf(t) {
    if (!t) return null;
    var h = Number(String(t).split(":")[0]);
    return Number.isFinite(h) ? h : null;
  }
  function stampIfEmpty(id) {
    var n = el(id);
    if (n && !n.value) n.value = nowHHMM();
  }
  function autoGymTimes() {
    var row = typeof currentRow === "function" ? currentRow() : null;
    if (!(row && row.entryTime)) stampIfEmpty("entryTime");
    else if (el("entryTime") && !el("entryTime").value) el("entryTime").value = row.entryTime;
    if (!(row && row.after1HourTime)) stampIfEmpty("after1HourTime");
  }

  function pickSessionEnd() {
    var row = typeof currentRow === "function" ? currentRow() : null;
    return (el("exitTime") && el("exitTime").value) ||
      (el("afterTreadmillTime") && el("afterTreadmillTime").value) ||
      (row && (row.exitTime || row.afterTreadmillTime)) ||
      "";
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

  function stampExit() {
    ensureEndTime();
    var box = el("exitTime");
    if (!box) return;
    if (box.value) return;
    var keep = pickSessionEnd();
    if (keep) { box.value = keep; return; }
    box.value = nowHHMM();
    if (el("afterTreadmillTime") && !el("afterTreadmillTime").value) {
      el("afterTreadmillTime").value = box.value;
    }
  }

  if (typeof fillForm === "function") {
    var _ff = fillForm;
    fillForm = function () {
      var row = typeof currentRow === "function" ? currentRow() : null;
      var keepEntry = row && row.entryTime;
      var keepEnd = row && (row.exitTime || row.afterTreadmillTime);
      var keepWork = row && row.after1HourTime;
      _ff();
      ensureEndTime();
      if (keepEntry && el("entryTime")) el("entryTime").value = keepEntry;
      if (keepWork && el("after1HourTime")) el("after1HourTime").value = keepWork;
      if (el("exitTime")) el("exitTime").value = keepEnd || el("exitTime").value || "";
      autoGymTimes();
    };
  }

  if (typeof showTab === "function" && !showTab._autoT) {
    var _st = showTab;
    showTab = function (name) {
      _st(name);
      if (name === "workout") setTimeout(autoGymTimes, 0);
    };
    showTab._autoT = true;
  }
  setTimeout(autoGymTimes, 200);

  function mergeOld(body) {
    var old = (typeof currentRow === "function" && currentRow()) || {};
    ["entryTime","entryWeight","after1HourTime","after1HourNote","beforeTreadmillTime","beforeTreadmillKm","beforeTreadmillMins","beforeTreadmillSpeed","beforeTreadmillNote","afterTreadmillTime","afterTreadmillWeight","afterTreadmillKm","afterTreadmillMins","afterTreadmillSpeed","afterTreadmillNote","runs"].forEach(function (k) {
      if (body[k] == null || body[k] === "") {
        if (old[k] != null && old[k] !== "") body[k] = old[k];
      }
    });
    var t = el("exitTime") && el("exitTime").value;
    if (t) body.afterTreadmillTime = t;
    else if (old.afterTreadmillTime) body.afterTreadmillTime = old.afterTreadmillTime;
    return body;
  }

  if (typeof formBody === "function") {
    var _fb = formBody;
    formBody = function (finished) {
      autoGymTimes();
      if (finished) stampExit();
      return mergeOld(_fb(finished));
    };
  }
  if (typeof save === "function") {
    var _save = save;
    save = async function (finished) {
      autoGymTimes();
      if (finished) stampExit();
      return _save(finished);
    };
  }
})();
