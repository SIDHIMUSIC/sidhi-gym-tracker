(function () {
  function hourIST() {
    return Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" }).format(new Date()));
  }
  function name() {
    var n = "";
    try { if (window.__sidhiMe && window.__sidhiMe.displayName) n = window.__sidhiMe.displayName; } catch (e) {}
    if (!n) n = localStorage.getItem("sidhi-gym-name") || "";
    n = String(n || "").trim();
    return n || "Athlete";
  }
  function wish() {
    var h = hourIST();
    var who = name();
    if (h >= 5 && h < 12) return "Good Morning, " + who + " \ud83d\udc4b";
    if (h >= 12 && h < 17) return "Good Afternoon, " + who + " \ud83d\udc4b";
    if (h >= 17 && h < 21) return "Good Evening, " + who + " \ud83d\udc4b";
    return "Good Night, " + who + " \ud83c\udf19";
  }
  function lockHello() {
    var el = document.getElementById("hello");
    if (!el) return;
    var text = wish();
    if (el.textContent !== text) el.textContent = text;
  }
  function lockFoot() {
    var foot = document.getElementById("sidhiFoot");
    if (!foot) return;
    if (foot.parentNode !== document.body) document.body.appendChild(foot);
  }
  function stay() {
    if (!localStorage.getItem("sidhi-gym-token")) return;
    var g = document.getElementById("gate");
    var a = document.getElementById("app");
    var t = document.getElementById("tabbar");
    if (g) g.classList.add("hidden");
    if (a) a.classList.remove("hidden");
    if (t) t.classList.remove("hidden");
  }
  stay();
  lockHello();
  lockFoot();
  setInterval(function () { stay(); lockHello(); lockFoot(); }, 800);
})();
