(function () {
  function muscleOf(name) {
    var s = String(name || "").toLowerCase();
    if (/plank|crunch|leg raise|bicycle|abs/.test(s)) return "Abs";
    if (/calf/.test(s)) return "Calf";
    if (/squat|leg press|rdl|deadlift|lunge|leg curl|leg extension|hack/.test(s)) return "Legs";
    if (/shoulder|ohp|lateral|rear delt|arnold/.test(s)) return "Shoulders";
    if (/curl|hammer|preacher|bicep/.test(s)) return "Biceps";
    if (/row|pulldown|pull-up|pull up|face pull|lat/.test(s)) return "Back";
    if (/tricep|skull|pushdown|overhead/.test(s)) return "Triceps";
    if (/bench|chest|fly|dip|press/.test(s)) return "Chest";
    return "Exercise";
  }
  function applySaved(sched) {
    if (!sched || typeof SPLIT !== "object") return;
    ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].forEach(function (d) {
      if (sched[d]) SPLIT[d] = sched[d];
    });
  }
  function tagCards() {
    document.querySelectorAll(".ex-card").forEach(function (a) {
      if (a.querySelector(".ex-mus")) return;
      var b = a.querySelector("b");
      var name = b ? b.textContent : "";
      var m = muscleOf(name);
      var tag = document.createElement("i");
      tag.className = "ex-mus";
      tag.textContent = m;
      var wrap = a.querySelector("div");
      if (wrap) wrap.appendChild(tag);
      else a.appendChild(tag);
    });
  }
  if (!document.getElementById("plan-bind-css")) {
    var st = document.createElement("style");
    st.id = "plan-bind-css";
    st.textContent = ".ex-mus{display:inline-block!important;margin-top:6px;padding:3px 8px;border-radius:999px;font:700 10px Comfortaa,sans-serif;font-style:normal;letter-spacing:.06em;background:rgba(240,194,122,.18);color:#f0c27a}";
    document.head.appendChild(st);
  }
  if (typeof afterAuth === "function" && !afterAuth._plan) {
    var _aa = afterAuth;
    afterAuth = async function () {
      await _aa();
      try {
        var me = await api("/api/me");
        window.__sidhiMe = me;
        applySaved(me.schedule);
      } catch (e) {}
      if (typeof paintHome === "function") paintHome();
      if (typeof fillForm === "function") fillForm();
      setTimeout(tagCards, 50);
    };
    afterAuth._plan = true;
  }
  if (typeof paintHome === "function" && !paintHome._plan) {
    var _ph = paintHome;
    paintHome = function () {
      if (window.__sidhiMe && window.__sidhiMe.schedule) applySaved(window.__sidhiMe.schedule);
      _ph();
      setTimeout(tagCards, 0);
    };
    paintHome._plan = true;
  }
  var tryBind = setInterval(function () {
    var btn = document.getElementById("pfSched");
    if (!btn || btn._plan) return;
    btn._plan = true;
    var old = btn.onclick;
    btn.onclick = async function () {
      if (typeof old === "function") await old();
      try {
        var me = await api("/api/me");
        window.__sidhiMe = me;
        applySaved(me.schedule);
      } catch (e) {}
      if (typeof paintHome === "function") paintHome();
      if (typeof toast === "function") toast("Plan preview updated");
    };
  }, 800);
  setTimeout(tagCards, 400);
  setInterval(tagCards, 2000);
})();
