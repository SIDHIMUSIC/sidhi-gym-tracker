(function () {
  function hourIST() {
    return Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" }).format(new Date()));
  }
  function first() {
    var n = "";
    try {
      if (window.__sidhiMe && window.__sidhiMe.displayName) n = window.__sidhiMe.displayName;
    } catch (e) {}
    if (!n && typeof username === "string") n = username;
    n = String(n || "").trim().split(/\s+/)[0] || "Athlete";
    return n;
  }
  function wish() {
    var h = hourIST();
    var name = first();
    if (h >= 5 && h < 12) return "Good Morning, " + name + " 👋";
    if (h >= 12 && h < 16) return "Good Afternoon, " + name + " 👋";
    if (h >= 16 && h < 20) return "Good Evening, " + name + " 👋";
    return "Good Night, " + name + " 🌙";
  }
  window.greetText = wish;
  if (typeof greet === "function") {
    greet = function () {
      var h = hourIST();
      if (h >= 5 && h < 12) return "Good morning";
      if (h >= 12 && h < 16) return "Good afternoon";
      if (h >= 16 && h < 20) return "Good evening";
      return "Good night";
    };
  }
  function paint() {
    var el = document.getElementById("hello");
    if (el) el.textContent = wish();
  }
  paint();
  setInterval(paint, 30000);
  if (typeof paintHome === "function" && !paintHome._greet) {
    var _ph = paintHome;
    paintHome = function () { _ph(); paint(); };
    paintHome._greet = true;
  }
})();
