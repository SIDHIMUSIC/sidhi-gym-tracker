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

  function nowHM() {
    return typeof nowTime === "function" ? nowTime() : new Date().toTimeString().slice(0, 5);
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
    var lab = wrap.querySelector('label');
    b.appendChild(lab && lab.parentNode === wrap ? lab : document.createElement("label"));
    if (!b.querySelector("label").textContent) b.querySelector("label").textContent = "end weight (kg)";
    b.appendChild(w);
    wrap.appendChild(grid);
    grid.appendChild(a);
    grid.appendChild(b);
  }
  ensureEndTime();

  function stampExit() {
    ensureEndTime();
    var box = el("exitTime") || el("afterTreadmillTime");
    if (box && !box.value) box.value = nowHM();
    if (el("exitTime") && el("afterTreadmillTime") && !el("afterTreadmillTime").value) {
      el("afterTreadmillTime").value = el("exitTime").value;
    }
  }
  if (typeof fillForm === "function") {
    var _ff = fillForm;
    fillForm = function () {
      _ff();
      ensureEndTime();
      var row = typeof currentRow === "function" ? currentRow() : null;
      if (el("exitTime") && row) el("exitTime").value = row.exitTime || row.afterTreadmillTime || "";
    };
  }
  if (typeof formBody === "function") {
    var _fb = formBody;
    formBody = function (finished) {
      if (finished) stampExit();
      var body = _fb(finished);
      var t = el("exitTime") && el("exitTime").value;
      if (t) body.afterTreadmillTime = t;
      return body;
    };
  }
  if (typeof save === "function") {
    var _save = save;
    save = async function (finished) {
      if (finished) stampExit();
      if (el("exitTime") && el("afterTreadmillTime") && el("exitTime").value) {
        el("afterTreadmillTime").value = el("exitTime").value;
      }
      return _save(finished);
    };
  }
  var fin = el("finishBtn");
  if (fin) fin.addEventListener("click", function () { stampExit(); }, true);
})();
