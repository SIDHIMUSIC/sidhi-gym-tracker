(function () {
  var IMG = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";
  var fmap = { a: "ᴀ", b: "ʙ", c: "ᴄ", d: "ᴅ", e: "ᴇ", f: "ꜰ", g: "ɢ", h: "ʜ", i: "ɪ", j: "ᴊ", k: "ᴋ", l: "ʟ", m: "ᴍ", n: "ɴ", o: "ᴏ", p: "ᴘ", q: "ǫ", r: "ʀ", s: "s", t: "ᴛ", u: "ᴜ", v: "ᴠ", w: "ᴡ", x: "x", y: "ʏ", z: "ᴢ" };
  function fancy(s) {
    return String(s).replace(/[A-Za-z]/g, function (ch) { return fmap[ch.toLowerCase()] || ch; });
  }
  function dayName() {
    var iso = typeof todayISO === "function" ? todayISO() : new Date().toISOString().slice(0, 10);
    return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date(iso + "T12:00:00").getDay()];
  }
  function keyFromLabel(label) {
    var s = String(label || "").toLowerCase();
    if (s.indexOf("day 1") >= 0) return "Monday";
    if (s.indexOf("day 2") >= 0) return "Tuesday";
    if (s.indexOf("day 3") >= 0) return "Wednesday";
    if (s.indexOf("day 4") >= 0) return "Thursday";
    if (s.indexOf("day 5") >= 0) return "Friday";
    if (s.indexOf("day 6") >= 0) return "Saturday";
    if (s.indexOf("day 7") >= 0 || s.indexOf("rest") >= 0) return "Sunday";
    return "";
  }
  function apply() {
    var me = window.__sidhiMe;
    if (!me || !me.schedule || typeof SPLIT !== "object") return;
    Object.keys(me.schedule).forEach(function (d) {
      if (me.schedule[d]) SPLIT[d] = me.schedule[d];
    });
  }
  function card(ex, i) {
    return '<a class="ex-card" href="https://www.youtube.com/watch?v=' + ex.y + '" target="_blank" rel="noopener">' +
      '<span class="ex-no">' + (i + 1) + '</span>' +
      '<span class="ex-anim"><img class="a0" alt="' + ex.n + '" src="' + IMG + ex.g + '/0.jpg"><img class="a1" alt="" src="' + IMG + ex.g + '/1.jpg"></span>' +
      '<div><b>' + fancy(ex.n) + '</b><span>' + fancy(ex.s) + ' • ' + fancy("tap video") + '</span></div></a>';
  }
  var homePick = null;
  function paint() {
    apply();
    var box = document.getElementById("exGuideHome");
    var planMap = window.SIDHI_PLAN;
    if (!box || !planMap) return;
    var today = dayName();
    var weekday = homePick || today;
    var label = (typeof SPLIT === "object" && SPLIT[weekday]) || planMap[weekday].title;
    var key = keyFromLabel(label) || weekday;
    var plan = planMap[key];
    if (!plan) return;
    var title = box.querySelector("h3");
    if (title) title.textContent = fancy(plan.title);
    var badge = box.querySelector(".badge");
    if (badge) badge.textContent = fancy((weekday === today ? "today plan" : "plan preview") + " • " + weekday);
    var list = box.querySelector(".ex-list");
    var sig = plan.title + ":" + (plan.list ? plan.list.length : 0);
    if (list && list.getAttribute("data-sig") !== sig) {
      list.setAttribute("data-sig", sig);
      list.innerHTML = (plan.list || []).map(card).join("");
    }
    var sub = box.querySelector(".sub");
    if (sub) sub.textContent = fancy((plan.list && plan.list.length ? plan.list.length + " moves. tap video." : "rest and recovery. walk optional."));
    var hs = document.getElementById("homeSplit");
    if (hs) hs.textContent = label;
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("#exGuideHome [data-day]");
    if (!b) return;
    homePick = b.getAttribute("data-day");
    setTimeout(paint, 30);
  });
  setInterval(paint, 800);
})();
