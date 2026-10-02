(function () {
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
  var homePick = null;
  function paintHomePlan() {
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
    if (title) title.textContent = plan.title;
    var badge = box.querySelector(".badge");
    if (badge) badge.textContent = (weekday === today ? "today • " : "plan • ") + weekday;
    var sub = box.querySelector(".sub");
    if (sub && plan.list) sub.textContent = plan.list.length + " moves • saved schedule";
    if (elSplit()) elSplit().textContent = label;
  }
  function elSplit() { return document.getElementById("homeSplit"); }
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("#exGuideHome [data-day]");
    if (!b) return;
    homePick = b.getAttribute("data-day");
    setTimeout(paintHomePlan, 40);
  });
  setInterval(paintHomePlan, 900);
})();
