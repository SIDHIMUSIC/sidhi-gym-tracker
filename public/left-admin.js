(function () {
  var IMG = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";
  function X(n, s, y, g) { return { n: n, s: s, y: y, g: g }; }
  var press = X("LEFT Single-Arm DB Press", "2 × 8–10, left first", "VmB1G1K7vJU", "One_Arm_Dumbbell_Bench_Press");
  var row = X("LEFT Single-Arm DB Row", "2 × 8–10, left first", "pYcpY20QaE8", "One-Arm_Dumbbell_Row");
  var lat = X("LEFT Single-Arm Lateral Raise", "2 × 12, left first", "3VcKaXpzqRo", "Side_Lateral_Raise");
  var wu = X("LEFT Wrist Curl Palms Up", "2 × 12, light, left first", "3qX6sX2e2d", "Seated_One-Arm_Dumbbell_Palms-Up_Wrist_Curl");
  var wd = X("LEFT Wrist Curl Palms Down", "2 × 12, light, left first", "3qX6sX2e2d", "Seated_One-Arm_Dumbbell_Palms-Down_Wrist_Curl");
  var extra = {
    Monday: [press, wu, wd],
    Thursday: [press, wu, wd],
    Tuesday: [row, wu, wd],
    Friday: [row, wu, wd],
    Wednesday: [lat, wu, wd],
    Saturday: [lat, wu, wd]
  };
  var adminUser = "harryashu";
  var applied = false;
  function isAdmin() {
    var u = (typeof username === "string" ? username : "").toLowerCase();
    return u && u === adminUser;
  }
  function apply() {
    if (!isAdmin() || applied || !window.SIDHI_PLAN) return;
    Object.keys(extra).forEach(function (day) {
      var plan = window.SIDHI_PLAN[day];
      if (!plan || !plan.list || !plan.list.length) return;
      if (plan.list.some(function (e) { return String(e.n).indexOf("LEFT ") === 0; })) return;
      var abs = plan.list.splice(-3);
      plan.list = plan.list.concat(extra[day]).concat(abs);
    });
    applied = true;
    if (typeof paintGuide === "function") paintGuide();
  }
  fetch("/api/public-config").then(function (r) { return r.json(); }).then(function (d) {
    if (d && d.adminUser) adminUser = String(d.adminUser).toLowerCase();
    apply();
  }).catch(function () { apply(); });
  setInterval(apply, 1500);
  window.SIDHI_IMG = IMG;
})();
