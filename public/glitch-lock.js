(function () {
  function hourIST() {
    return Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" }).format(new Date()));
  }
  function clean(v) {
    v = String(v || "").replace(/[\u{1F300}-\u{1FAFF}]/gu, "").trim();
    if (!v || v === "Athlete" || v === "you@gmail.com") return "";
    return v;
  }
  function name() {
    var n = "";
    var pf = document.getElementById("pfName");
    if (pf) n = clean(pf.value);
    if (!n) {
      try { n = clean(window.__sidhiMe && window.__sidhiMe.displayName); } catch (e) {}
    }
    if (!n) n = clean(window.__displayName);
    if (!n) n = clean(localStorage.getItem("sidhi-gym-name"));
    if (!n) n = clean(localStorage.getItem("sidhi-gym-user")) || clean(localStorage.getItem("sidhi-gym-username")) || "";
    return n ? n.split(/\s+/)[0] : "";
  }
  function wish() {
    var h = hourIST();
    var who = name();
    var head = h >= 5 && h < 12 ? "Good Morning" : h >= 12 && h < 17 ? "Good Afternoon" : h >= 17 && h < 21 ? "Good Evening" : "Good Night";
    return who ? head + ", " + who : head;
  }
  function lockHello() {
    var el = document.getElementById("hello");
    var app = document.getElementById("app");
    if (!el || !app || app.classList.contains("hidden")) return;
    var text = wish();
    if (text && el.textContent !== text) el.textContent = text;
  }
  setInterval(lockHello, 700);
})();
