(function () {
  function istHour() {
    return Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" }).format(new Date()));
  }
  function firstName() {
    var n = (window.__pfName || (typeof username !== "undefined" ? username : "") || "").trim();
    return n.split(/\s+/)[0] || "Athlete";
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
    var h = document.getElementById("hello");
    if (h) h.textContent = wish();
  }
  if (typeof paintHome === "function") {
    var _ph = paintHome;
    paintHome = function () {
      _ph();
      applyWish();
    };
  }
  applyWish();
  setInterval(applyWish, 60000);

  function stampExit() {
    var box = document.getElementById("afterTreadmillTime");
    if (box) box.value = typeof nowTime === "function" ? nowTime() : new Date().toTimeString().slice(0, 5);
  }
  var fin = document.getElementById("finishBtn");
  if (fin) {
    fin.addEventListener("click", function () { stampExit(); }, true);
  }
  var hf = document.getElementById("homeFinish");
  if (hf) {
    hf.addEventListener("click", function () {
      stampExit();
    }, true);
  }
  if (typeof save === "function") {
    var _save = save;
    save = async function (finished) {
      if (finished) stampExit();
      return _save(finished);
    };
  }

  function gymTime(s) {
    var a = s.entryTime || "";
    var b = s.exitTime || s.afterTreadmillTime || "";
    if (a && b) return a + " → " + b;
    if (a) return "in " + a;
    return "";
  }
  function enhanceHist() {
    var box = document.getElementById("histGym");
    if (!box || typeof sessions === "undefined") return;
    var items = box.querySelectorAll(".hist-item");
    if (!items.length) return;
    sessions.forEach(function (s, i) {
      var it = items[i];
      if (!it) return;
      var t = gymTime(s);
      if (!t) return;
      var sub = it.querySelectorAll(".sub")[0];
      if (sub && sub.textContent.indexOf(→) < 0 && sub.textContent.indexOf(":") < 0) {
        sub.textContent = (sub.textContent || "") + " • " + t;
      }
    });
  }
  if (typeof paintHist === "function") {
    var _phist = paintHist;
    paintHist = function () {
      _phist();
      enhanceHist();
    };
  }
  var origMap = null;
  if (typeof sessions !== "undefined") enhanceHist();
})();
