(function () {
  var IMG = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";
  var fmap = { a: "ᴀ", b: "ʙ", c: "ᴄ", d: "ᴅ", e: "ᴇ", f: "ꜰ", g: "ɢ", h: "ʜ", i: "ɪ", j: "ᴊ", k: "ᴋ", l: "ʟ", m: "ᴍ", n: "ɴ", o: "ᴏ", p: "ᴘ", q: "ǫ", r: "ʀ", s: "s", t: "ᴛ", u: "ᴜ", v: "ᴠ", w: "ᴡ", x: "x", y: "ʏ", z: "ᴢ" };
  function fancy(s) { return String(s).replace(/[A-Za-z]/g, function (ch) { return fmap[ch.toLowerCase()] || ch; }); }
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
  function isAdmin() {
    var u = (typeof username === "string" ? username : "").toLowerCase();
    return u && u === adminUser;
  }
  function card(ex, i) {
    return '<a class="ex-card" href="https://www.youtube.com/watch?v=' + ex.y + '" target="_blank" rel="noopener">' +
      '<span class="ex-no">' + (i + 1) + '</span>' +
      '<span class="ex-anim"><img class="a0" alt="' + ex.n + '" src="' + IMG + ex.g + '/0.jpg"><img class="a1" alt="" src="' + IMG + ex.g + '/1.jpg"></span>' +
      '<div><b>' + fancy(ex.n) + '</b><span>' + fancy(ex.s) + ' • ' + fancy("tap video") + '</span></div></a>';
  }
  function injectLists() {
    if (!isAdmin() || !window.SIDHI_PLAN) return;
    Object.keys(extra).forEach(function (day) {
      var plan = window.SIDHI_PLAN[day];
      if (!plan || !plan.list || !plan.list.length) return;
      plan.list = plan.list.filter(function (e) { return String(e.n).indexOf("LEFT ") !== 0; });
      var abs = plan.list.splice(-3);
      plan.list = plan.list.concat(extra[day]).concat(abs);
    });
  }
  function paintBoxes() {
    if (!isAdmin() || !window.SIDHI_PLAN) return;
    document.querySelectorAll(".ex-box").forEach(function (box) {
      var on = box.querySelector(".ex-day.on");
      var day = on ? on.getAttribute("data-day") : "";
      var plan = window.SIDHI_PLAN[day];
      if (!plan || !plan.list) return;
      var list = box.querySelector(".ex-list");
      if (!list) return;
      var sig = plan.list.map(function (e) { return e.n; }).join("|");
      if (list.getAttribute("data-left") === sig) return;
      list.setAttribute("data-left", sig);
      list.innerHTML = plan.list.map(card).join("");
    });
  }
  fetch("/api/public-config").then(function (r) { return r.json(); }).then(function (d) {
    if (d && d.adminUser) adminUser = String(d.adminUser).toLowerCase();
    injectLists();
  }).catch(function () {});
  setInterval(function () { injectLists(); paintBoxes(); }, 1000);
})();
