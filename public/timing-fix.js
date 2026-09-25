(function () {
  function istHour() {
    return Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" }).format(new Date()));
  }
  function firstName() {
    var n = "";
    try {
      var hello = document.getElementById("hello");
      if (window.__displayName) n = window.__displayName;
      else if (typeof username !== "undefined") n = username;
    } catch (e) {}
    n = String(n || "").trim();
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
    paintHome = function () { _ph(); applyWish(); };
  }
  applyWish();
  setInterval(applyWish, 30000);

  function stampExit() {
    var box = document.getElementById("afterTreadmillTime");
    if (box) box.value = typeof nowTime === "function" ? nowTime() : new Date().toTimeString().slice(0, 5);
  }
  if (typeof save === "function") {
    var _save = save;
    save = async function (finished) {
      if (finished) stampExit();
      return _save(finished);
    };
  }
  var fin = document.getElementById("finishBtn");
  if (fin) fin.addEventListener("click", function () { stampExit(); }, true);
})();
