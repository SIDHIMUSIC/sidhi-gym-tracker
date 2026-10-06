(function () {
  function hourIST() {
    return Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" }).format(new Date()));
  }
  function full() {
    var n = "";
    try { if (window.__sidhiMe && window.__sidhiMe.displayName) n = window.__sidhiMe.displayName; } catch (e) {}
    if (!n) n = localStorage.getItem("sidhi-gym-name") || "";
    n = String(n || "").trim();
    return (n.split(/\s+/)[0]) || "Athlete";
  }
  function wish() {
    var h = hourIST();
    var name = full();
    if (h >= 5 && h < 12) return "Good Morning, " + name + " \ud83d\udc4b";
    if (h >= 12 && h < 17) return "Good Afternoon, " + name + " \ud83d\udc4b";
    if (h >= 17 && h < 21) return "Good Evening, " + name + " \ud83d\udc4b";
    return "Good Night, " + name + " \ud83c\udf19";
  }
  window.greetText = wish;
  function paint() {
    var el = document.getElementById("hello");
    if (el) el.textContent = wish();
  }
  paint();
})();
