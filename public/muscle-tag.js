(function () {
  function area(name) {
    var s = String(name || "").toLowerCase();
    if (s.indexOf("wrist") >= 0) return "forearm";
    if (s.indexOf("crunch") >= 0 || s.indexOf("plank") >= 0 || s.indexOf("leg raise") >= 0) return "abs";
    if (s.indexOf("curl") >= 0 && s.indexOf("leg") < 0) return "biceps";
    if (s.indexOf("tricep") >= 0 || s.indexOf("skull") >= 0 || s.indexOf("pushdown") >= 0) return "triceps";
    if (s.indexOf("bench") >= 0 || s.indexOf("chest") >= 0 || s.indexOf("fly") >= 0 || s.indexOf("dips") >= 0 || s.indexOf("press") >= 0 && s.indexOf("shoulder") < 0 && s.indexOf("leg") < 0 && s.indexOf("single-arm db press") >= 0) return "chest";
    if (s.indexOf("single-arm db press") >= 0) return "chest";
    if (s.indexOf("pulldown") >= 0 || s.indexOf("pull-up") >= 0 || s.indexOf("pull up") >= 0 || s.indexOf("row") >= 0 || s.indexOf("face pull") >= 0) return "back";
    if (s.indexOf("shoulder") >= 0 || s.indexOf("lateral") >= 0 || s.indexOf("rear delt") >= 0 || s.indexOf("pec deck") >= 0) return "shoulders";
    if (s.indexOf("squat") >= 0 || s.indexOf("leg press") >= 0 || s.indexOf("extension") >= 0) return "quads";
    if (s.indexOf("deadlift") >= 0 || s.indexOf("leg curl") >= 0) return "hamstrings";
    if (s.indexOf("calf") >= 0) return "calves";
    if (s.indexOf("incline") >= 0 || s.indexOf("flat dumbbell") >= 0) return "chest";
    return "gym";
  }
  function tag() {
    document.querySelectorAll(".ex-card").forEach(function (card) {
      if (card.querySelector(".ex-area")) return;
      var b = card.querySelector("b");
      if (!b) return;
      var lab = document.createElement("i");
      lab.className = "ex-area";
      lab.textContent = area(b.textContent);
      b.parentNode.insertBefore(lab, b.nextSibling);
    });
  }
  if (!document.getElementById("ex-area-css")) {
    var st = document.createElement("style");
    st.id = "ex-area-css";
    st.textContent = ".ex-area{display:inline-block;margin:4px 0 0;padding:2px 8px;border-radius:999px;background:rgba(99,226,179,.16);color:#9ff3d4;font:800 10px Comfortaa,sans-serif;font-style:normal;letter-spacing:.06em;text-transform:uppercase}";
    document.head.appendChild(st);
  }
  setInterval(tag, 700);
})();
