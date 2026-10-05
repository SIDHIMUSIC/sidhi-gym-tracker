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
    if (n) {
      try { localStorage.setItem("sidhi-gym-name", n); } catch (e) {}
      return n;
    }
    return clean(localStorage.getItem("sidhi-gym-user")) || clean(window.username) || "";
  }
  function wish() {
    var h = hourIST();
    var who = name();
    var head = h >= 5 && h < 12 ? "Good Morning" : h >= 12 && h < 17 ? "Good Afternoon" : h >= 17 && h < 21 ? "Good Evening" : "Good Night";
    return who ? head + ", " + who : head;
  }
  function lockHello() {
    var el = document.getElementById("hello");
    if (!el) return;
    var text = wish();
    if (el.textContent !== text) el.textContent = text;
  }
  function lockFoot() {
    var foot = document.getElementById("sidhiFoot");
    if (foot && foot.parentNode !== document.body) document.body.appendChild(foot);
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
  function pullName() {
    var token = localStorage.getItem("sidhi-gym-token");
    if (!token || window.__greetPulled) return;
    window.__greetPulled = 1;
    fetch("/api/me", { headers: { Authorization: "Bearer " + token } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (me) {
        if (!me) return;
        window.__sidhiMe = me;
        if (me.displayName) localStorage.setItem("sidhi-gym-name", me.displayName);
        if (me.username) localStorage.setItem("sidhi-gym-user", me.username);
        lockHello();
      })
      .catch(function () { window.__greetPulled = 0; });
  }
  stay();
  pullName();
  lockHello();
  lockFoot();
  setInterval(function () { stay(); lockHello(); lockFoot(); }, 600);
})();
