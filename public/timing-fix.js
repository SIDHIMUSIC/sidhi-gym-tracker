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
    if (h >= 4 && h < 12) return "Good Morning, " + n + " ☀️";
    if (h >= 12 && h < 17) return "Good Afternoon, " + n + " 🌤️";
    if (h >= 17 && h < 21) return "Good Evening, " + n + " 🌆";
    return "Good Night, " + n + " 🌙";
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

  function hourOf(t) {
    if (!t) return null;
    var p = String(t).split(":");
    var h = Number(p[0]);
    return Number.isFinite(h) ? h : null;
  }
  function pickSessionEnd() {
    var row = typeof currentRow === "function" ? currentRow() : null;
    return (el("exitTime") && el("exitTime").value) ||
      (el("afterTreadmillTime") && el("afterTreadmillTime").value) ||
      (row && (row.exitTime || row.afterTreadmillTime)) ||
      (el("beforeTreadmillTime") && el("beforeTreadmillTime").value) ||
      (row && row.beforeTreadmillTime) ||
      (el("after1HourTime") && el("after1HourTime").value) ||
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
    var lab = wrap.querySelector("label");
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
    var entry = (el("entryTime") && el("entryTime").value) || "";
    var eh = hourOf(entry);
    var nh = istHour();
    if (eh != null && eh < 12 && nh >= 12) return;
    box.value = typeof nowTime === "function" ? nowTime() : new Date().toTimeString().slice(0, 5);
  }

  if (typeof fillForm === "function") {
    var _ff = fillForm;
    fillForm = function () {
      var row = typeof currentRow === "function" ? currentRow() : null;
      var keepEntry = row && row.entryTime;
      var keepEnd = row && (row.exitTime || row.afterTreadmillTime);
      _ff();
      ensureEndTime();
      if (keepEntry && el("entryTime")) el("entryTime").value = keepEntry;
      if (el("exitTime")) el("exitTime").value = keepEnd || (row && row.afterTreadmillTime) || el("exitTime").value || "";
    };
  }

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
      if (finished) stampExit();
      return mergeOld(_fb(finished));
    };
  }
  if (typeof save === "function") {
    var _save = save;
    save = async function (finished) {
      if (finished) stampExit();
      return _save(finished);
    };
  }
})();
