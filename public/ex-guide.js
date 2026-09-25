(function () {
  function fancy(s) {
    const m = { a: "ᴀ", b: "ʙ", c: "ᴄ", d: "ᴅ", e: "ᴇ", f: "ꜰ", g: "ɢ", h: "ʜ", i: "ɪ", j: "ᴊ", k: "ᴋ", l: "ʟ", m: "ᴍ", n: "ɴ", o: "ᴏ", p: "ᴘ", q: "ǫ", r: "ʀ", s: "s", t: "ᴛ", u: "ᴜ", v: "ᴠ", w: "ᴡ", x: "x", y: "ʏ", z: "ᴢ" };
    return String(s).replace(/[A-Za-z]/g, function (ch) { return m[ch.toLowerCase()] || ch; });
  }
  function el(id) { return document.getElementById(id); }
  const IMG = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";
  function X(n, s, y, g) { return { n: n, s: s, y: y, g: g }; }

  const KEYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const WEEKDAY = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const ABSA = [
    X("Cable Crunch / Crunch", "3 × 12–20", "Xyd_fa5zoEU", "Cable_Crunch"),
    X("Leg Raise", "3 × 10–15", "JB2oyawG9KI", "Flat_Bench_Lying_Leg_Raise"),
    X("Plank", "3 × 30–60 sec", "ASdvN_XEl_c", "Plank")
  ];
  const ABSB = [
    X("Reverse Crunch", "3 × 12–15", "uwjvDIdCqic", "Reverse_Crunch"),
    X("Hanging Leg Raise", "3 × 8–15", "Pr1ieGZ5atk", "Hanging_Leg_Raise"),
    X("Plank", "3 × 30–60 sec", "ASdvN_XEl_c", "Plank")
  ];
  const ABSC = [
    X("Bicycle Crunch", "3 × 15–20", "9FGilxCbdz8", "Air_Bike"),
    X("Cable Crunch", "3 × 12–20", "Xyd_fa5zoEU", "Cable_Crunch"),
    X("Side Plank", "3 × 30–45 sec/side", "K2VljzNwWOI", "Side_Bridge")
  ];

  const D1 = [
    X("Barbell Bench Press", "3 × 6–10", "rT7DgCr-3pg", "Barbell_Bench_Press_-_Medium_Grip"),
    X("Incline Dumbbell Press", "3 × 8–12", "8iPEnn-ltC8", "Incline_Dumbbell_Press"),
    X("Cable / Machine Chest Fly", "3 × 10–15", "Iwe6AmxVf7o", "Butterfly"),
    X("Rope Triceps Pushdown", "3 × 10–15", "2-LAMcrL1Ko", "Triceps_Pushdown"),
    X("Overhead Triceps Extension", "3 × 10–15", "Yb3jIHsLoMA", "Standing_Dumbbell_Triceps_Extension"),
    X("Skull Crushers", "2 × 10–12", "d_K6VPHiAOE", "EZ-Bar_Skullcrusher")
  ].concat(ABSA);
  const D2 = [
    X("Pull-Ups / Lat Pulldown", "3 × 6–12", "CAwf7n6Luuc", "Wide-Grip_Lat_Pulldown"),
    X("Barbell Bent-Over Row", "3 × 6–10", "kBWAon7ItEc", "Bent_Over_Barbell_Row"),
    X("Seated Cable Row", "3 × 8–12", "GZbfZ033f74", "Seated_Cable_Rows"),
    X("Face Pull", "2 × 12–15", "rep-xVEkqas", "Face_Pull"),
    X("Barbell Curl", "3 × 8–12", "kwG2ipFRgfo", "Barbell_Curl"),
    X("Dumbbell Hammer Curl", "3 × 10–12", "zC3nLlEvin4", "Hammer_Curls")
  ].concat(ABSB);
  const D3 = [
    X("Dumbbell Shoulder Press", "3 × 8–12", "qEwKCR5JCog", "Dumbbell_Shoulder_Press"),
    X("Dumbbell Lateral Raise", "3 × 12–15", "3VcKaXpzqRo", "Side_Lateral_Raise"),
    X("Rear Delt Fly", "3 × 12–15", "nlkFXl2LPGY", "Seated_Bent-Over_Rear_Delt_Raise"),
    X("Barbell Back Squat", "3 × 6–10", "ultWZbUMPL8", "Barbell_Full_Squat"),
    X("Leg Press", "3 × 10–12", "IZqWIMhr9yM", "Leg_Press"),
    X("Romanian Deadlift", "3 × 8–12", "2SHsk9AzdjA", "Romanian_Deadlift"),
    X("Leg Extension", "2 × 12–15", "YyvSfVjQeL0", "Leg_Extensions"),
    X("Lying / Seated Leg Curl", "2 × 10–15", "1Tq3QMfoSdU", "Lying_Leg_Curls"),
    X("Standing / Seated Calf Raise", "3 × 12–20", "gwLzBJYoNlA", "Standing_Calf_Raises")
  ].concat(ABSC);
  const D4 = [
    X("Incline Barbell / DB Press", "3 × 8–12", "8iPEnn-ltC8", "Incline_Dumbbell_Press"),
    X("Flat Dumbbell Press", "3 × 8–12", "VmB1G1K7vJU", "Dumbbell_Bench_Press"),
    X("Chest Dips", "3 × 8–12", "2z8JmcrW-As", "Dips_-_Chest_Version"),
    X("Cable Fly", "2 × 12–15", "Iwe6AmxVf7o", "Cable_Crossover"),
    X("Triceps Rope Pushdown", "3 × 10–15", "2-LAMcrL1Ko", "Triceps_Pushdown"),
    X("Overhead Triceps Extension", "3 × 10–15", "Yb3jIHsLoMA", "Standing_Dumbbell_Triceps_Extension")
  ].concat(ABSA);
  const D5 = [
    X("Lat Pulldown / Pull-Ups", "3 × 8–12", "CAwf7n6Luuc", "Wide-Grip_Lat_Pulldown"),
    X("Chest-Supported Row", "3 × 8–12", "0GHzTIekh3k", "Bent_Over_Two-Dumbbell_Row"),
    X("Seated Cable Row", "3 × 10–12", "GZbfZ033f74", "Seated_Cable_Rows"),
    X("Straight-Arm Pulldown", "2 × 12–15", "wcDX9kU77V0", "Straight-Arm_Pulldown"),
    X("Preacher Curl", "3 × 10–12", "fPDF-a58XsA", "Preacher_Curl"),
    X("Hammer Curl", "3 × 10–12", "zC3nLlEvin4", "Hammer_Curls")
  ].concat(ABSB);
  const D6 = [
    X("Dumbbell Shoulder Press", "3 × 8–12", "qEwKCR5JCog", "Dumbbell_Shoulder_Press"),
    X("Cable / DB Lateral Raise", "3 × 12–15", "3VcKaXpzqRo", "Side_Lateral_Raise"),
    X("Reverse Pec Deck / Rear Delt", "3 × 12–15", "nlkFXl2LPGY", "Seated_Bent-Over_Rear_Delt_Raise"),
    X("Hack Squat / Back Squat", "3 × 8–12", "rYyoWFXtNak", "Hack_Squat"),
    X("Leg Press", "3 × 10–15", "IZqWIMhr9yM", "Leg_Press"),
    X("Romanian Deadlift", "3 × 8–12", "2SHsk9AzdjA", "Romanian_Deadlift"),
    X("Leg Curl", "3 × 10–15", "1Tq3QMfoSdU", "Lying_Leg_Curls"),
    X("Leg Extension", "2 × 12–15", "YyvSfVjQeL0", "Leg_Extensions"),
    X("Calf Raise", "3 × 12–20", "gwLzBJYoNlA", "Standing_Calf_Raises")
  ].concat(ABSC);

  const PLAN = {
    Monday: { title: "Day 1 — Chest + Triceps + Abs A", list: D1 },
    Tuesday: { title: "Day 2 — Back + Biceps + Abs B", list: D2 },
    Wednesday: { title: "Day 3 — Shoulders + Legs + Abs C", list: D3 },
    Thursday: { title: "Day 4 — Chest + Triceps + Abs A", list: D4 },
    Friday: { title: "Day 5 — Back + Biceps + Abs B", list: D5 },
    Saturday: { title: "Day 6 — Shoulders + Legs + Abs C", list: D6 },
    Sunday: { title: "Day 7 — Rest / Recovery", list: [] }
  };
  window.SIDHI_PLAN = PLAN;
  window.SIDHI_DAY_OPTIONS = KEYS.map(function (k) { return PLAN[k].title; });

  if (typeof SPLIT === "object") {
    KEYS.forEach(function (k) { SPLIT[k] = PLAN[k].title; });
  }

  let pick = null;
  function todayKey() {
    const iso = typeof todayISO === "function" ? todayISO() : new Date().toISOString().slice(0, 10);
    return WEEKDAY[new Date(iso + "T12:00:00").getDay()];
  }
  function dateKey(dateStr) {
    if (!dateStr) return todayKey();
    return WEEKDAY[new Date(dateStr + "T12:00:00").getDay()];
  }
  function planFromLabel(label, fallback) {
    const s = String(label || "").toLowerCase();
    if (s.indexOf("day 1") >= 0) return PLAN.Monday;
    if (s.indexOf("day 2") >= 0) return PLAN.Tuesday;
    if (s.indexOf("day 3") >= 0) return PLAN.Wednesday;
    if (s.indexOf("day 4") >= 0) return PLAN.Thursday;
    if (s.indexOf("day 5") >= 0) return PLAN.Friday;
    if (s.indexOf("day 6") >= 0) return PLAN.Saturday;
    if (s.indexOf("day 7") >= 0 || s.indexOf("rest") >= 0) return PLAN.Sunday;
    return PLAN[fallback] || PLAN.Sunday;
  }
  function watch(id) { return "https://www.youtube.com/watch?v=" + id; }
  function pic(g, i) { return IMG + g + "/" + i + ".jpg"; }
  function pills(active) {
    return '<div class="ex-days">' + KEYS.map(function (k, i) {
      return '<button type="button" class="ex-day' + (k === active ? " on" : "") + '" data-day="' + k + '">D' + (i + 1) + '</button>';
    }).join("") + "</div>";
  }
  function cardHtml(ex, i) {
    return '<a class="ex-card" href="' + watch(ex.y) + '" target="_blank" rel="noopener">' +
      '<span class="ex-no">' + (i + 1) + "</span>" +
      '<span class="ex-anim"><img class="a0" src="' + pic(ex.g, 0) + '" alt="' + ex.n + '"><img class="a1" src="' + pic(ex.g, 1) + '" alt=""></span>' +
      '<div><b>' + fancy(ex.n) + '</b><span>' + fancy(ex.s) + ' • ' + fancy("tap video") + '</span></div></a>';
  }
  function renderBox(box, weekday) {
    if (!box) return;
    const label = (typeof SPLIT === "object" && SPLIT[weekday]) || "";
    const plan = pick ? PLAN[pick] : planFromLabel(label, weekday);
    const key = pick || weekday;
    const today = todayKey();
    const head = '<p class="badge">' + fancy(key === today && !pick ? "today plan" : "plan preview") + ' • ' + fancy(key) + '</p>' + pills(key) + '<h3>' + fancy(plan.title) + '</h3>';
    if (!plan.list.length) {
      box.innerHTML = head + '<p class="sub">' + fancy("rest and recovery. walk optional.") + '</p>';
      bindDays(box); return;
    }
    box.innerHTML = head + '<p class="sub">' + fancy(plan.list.length + " moves. last 3 are abs. tap video.") + '</p>' +
      '<div class="ex-list">' + plan.list.map(cardHtml).join("") + "</div>" +
      '<button class="btn ok full" type="button" data-exfill style="margin-top:12px">' + fancy("put list in notes") + '</button>';
    bindDays(box);
    const fill = box.querySelector("[data-exfill]");
    if (fill) fill.onclick = function () {
      const text = plan.title + "\n" + plan.list.map(function (e, i) { return (i + 1) + ". " + e.n + "  " + e.s; }).join("\n");
      const ta = el("after1HourNote");
      if (!ta) {
        if (typeof showTab === "function") showTab("workout");
        setTimeout(function () { const t2 = el("after1HourNote"); if (t2) t2.value = text; }, 80);
        return;
      }
      ta.value = text;
      if (typeof toast === "function") toast(fancy("exercises added"));
    };
  }
  function bindDays(box) {
    box.querySelectorAll("[data-day]").forEach(function (b) {
      b.onclick = function () { pick = b.getAttribute("data-day"); paintGuide(); };
    });
  }
  function paintGuide() {
    const date = el("date") && el("date").value ? el("date").value : "";
    renderBox(el("exGuideHome"), todayKey());
    renderBox(el("exGuideWork"), dateKey(date));
    if (el("homeSplit") && PLAN[todayKey()]) el("homeSplit").textContent = (typeof SPLIT === "object" && SPLIT[todayKey()]) || PLAN[todayKey()].title;
    if (el("splitLine")) el("splitLine").textContent = (typeof SPLIT === "object" && SPLIT[dateKey(date)]) || PLAN[dateKey(date)].title;
  }
  if (!document.getElementById("ex-guide-css")) {
    const st = document.createElement("style");
    st.id = "ex-guide-css";
    st.textContent = ".ex-box h3{margin:8px 0;font:800 16px Syne,sans-serif;color:#ffe4b5}.ex-days{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0 4px}.ex-day{min-height:36px;padding:6px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.06);color:#fff;font:800 11px Comfortaa,sans-serif}.ex-day.on{background:linear-gradient(135deg,#ff9a9e,#f0c27a);color:#120d06;border:0}.ex-list{display:flex;flex-direction:column;gap:10px;margin-top:10px}.ex-card{display:flex;gap:10px;align-items:center;padding:8px;border-radius:18px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);color:inherit;text-decoration:none}.ex-no{width:22px;height:22px;border-radius:50%;display:grid;place-items:center;font:800 11px Syne,sans-serif;background:#f0c27a;color:#120d06;flex:0 0 22px}.ex-anim{position:relative;width:104px;height:80px;flex:0 0 104px;border-radius:14px;overflow:hidden;background:#111}.ex-anim img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.ex-anim .a0{animation:exSwap 1.4s steps(1) infinite}.ex-anim .a1{opacity:0;animation:exSwap2 1.4s steps(1) infinite}@keyframes exSwap{0%,49%{opacity:1}50%,100%{opacity:0}}@keyframes exSwap2{0%,49%{opacity:0}50%,100%{opacity:1}}.ex-card b{display:block;font-size:13px}.ex-card span{display:block;margin-top:3px;font-size:11px;color:#9aa7b8}";
    document.head.appendChild(st);
  }
  function ensureBox(afterId, boxId) {
    if (el(boxId)) return;
    const after = el(afterId);
    if (!after || !after.parentNode) return;
    const box = document.createElement("div");
    box.className = "glass card ex-box"; box.id = boxId;
    after.parentNode.insertBefore(box, after.nextSibling);
  }
  ensureBox("homeFinish", "exGuideHome");
  const note = el("after1HourNote");
  if (note && note.parentNode && !el("exGuideWork")) {
    const box = document.createElement("div");
    box.className = "glass card ex-box"; box.id = "exGuideWork";
    note.parentNode.insertBefore(box, note.nextSibling);
  }
  if (typeof paintHome === "function") { const _ph = paintHome; paintHome = function () { _ph(); paintGuide(); }; }
  if (typeof fillForm === "function") { const _ff = fillForm; fillForm = function () { _ff(); paintGuide(); }; }
  paintGuide();
})();
