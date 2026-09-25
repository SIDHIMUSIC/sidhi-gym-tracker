(function () {
  function fancy(s) {
    const m = { a: "ᴀ", b: "ʙ", c: "ᴄ", d: "ᴅ", e: "ᴇ", f: "ꜰ", g: "ɢ", h: "ʜ", i: "ɪ", j: "ᴊ", k: "ᴋ", l: "ʟ", m: "ᴍ", n: "ɴ", o: "ᴏ", p: "ᴘ", q: "ǫ", r: "ʀ", s: "s", t: "ᴛ", u: "ᴜ", v: "ᴠ", w: "ᴡ", x: "x", y: "ʏ", z: "ᴢ" };
    return String(s).replace(/[A-Za-z]/g, function (ch) { return m[ch.toLowerCase()] || ch; });
  }
  function el(id) { return document.getElementById(id); }
  const IMG = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";
  function X(n, s, y, g) { return { n: n, s: s, y: y, g: g }; }

  const DAY1 = [
    X("Bench press", "3 x 10-12", "rT7DgCr-3pg", "Barbell_Bench_Press_-_Medium_Grip"),
    X("Incline press", "3 x 10-12", "j9wMfLwGeKs", "Barbell_Incline_Bench_Press_-_Medium_Grip"),
    X("Flyes machine or cable", "3 x 10-12", "Iwe6AmxVf7o", "Butterfly"),
    X("Triceps rope pushdown", "3 x 10-12", "2-LAMcrL1Ko", "Triceps_Pushdown"),
    X("Overhead triceps extension", "3 x 10-12", "Yb3jIHsLoMA", "Standing_Dumbbell_Triceps_Extension"),
    X("Skull crushers", "3 x 10-12", "d_K6VPHiAOE", "EZ-Bar_Skullcrusher")
  ];
  const DAY2 = [
    X("Pull ups", "3 x 10-12", "eGo4IYlbE5g", "Pullups"),
    X("Barbell bent over row", "3 x 10-12", "kBWAon7ItEc", "Bent_Over_Barbell_Row"),
    X("Seated cable row", "3 x 10-12", "GZbfZ033f74", "Seated_Cable_Rows"),
    X("Barbell curl", "3 x 10-12", "kwG2ipFRgfo", "Barbell_Curl"),
    X("Dumbbell hammer curl", "3 x 10-12", "zC3nLlEvin4", "Hammer_Curls"),
    X("Preacher curl", "3 x 10-12", "fPDF-a58XsA", "Preacher_Curl"),
    X("Hanging leg raises", "3 x 15", "Pr1ieGZ5atk", "Hanging_Leg_Raise"),
    X("Russian twists", "3 x 20", "wkD8rjkodUI", "Russian_Twist")
  ];
  const DAY3 = [
    X("Dumbbell shoulder press", "3 x 10-12", "qEwKCR5JCog", "Dumbbell_Shoulder_Press"),
    X("Lateral raises", "3 x 10-12", "3VcKaXpzqRo", "Side_Lateral_Raise"),
    X("Rear delt fly", "3 x 10-12", "nlkFXl2LPGY", "Seated_Bent-Over_Rear_Delt_Raise"),
    X("Barbell squats", "3 x 10-12", "ultWZbUMPL8", "Barbell_Full_Squat"),
    X("Leg press", "3 x 10-12", "IZqWIMhr9yM", "Leg_Press"),
    X("Leg extension", "3 x 10-12", "YyvSfVjQeL0", "Leg_Extensions"),
    X("Crunches", "3 x 20", "Xyd_fa5zoEU", "Crunches"),
    X("Leg raises", "3 x 15", "JB2oyawG9KI", "Flat_Bench_Lying_Leg_Raise"),
    X("Plank", "3 x 30 sec", "ASdvN_XEl_c", "Plank")
  ];
  const DAY4 = [
    X("Barbell bench press", "3 x 10-12", "rT7DgCr-3pg", "Barbell_Bench_Press_-_Medium_Grip"),
    X("Incline dumbbell press", "3 x 10-12", "8iPEnn-ltC8", "Incline_Dumbbell_Press"),
    X("Chest dips", "3 x 10-12", "2z8JmcrW-As", "Dips_-_Chest_Version"),
    X("Triceps pushdown", "3 x 10-12", "2-LAMcrL1Ko", "Triceps_Pushdown"),
    X("Overhead triceps extension", "3 x 10-12", "Yb3jIHsLoMA", "Standing_Dumbbell_Triceps_Extension"),
    X("Triceps kickbacks", "3 x 10-12", "6SS6K3lAwJA", "Tricep_Dumbbell_Kickback"),
    X("Reverse crunches", "3 x 15", "uwjvDIdCqic", "Reverse_Crunch"),
    X("Bicycle crunches", "3 x 20", "9FGilxCbdz8", "Air_Bike"),
    X("Plank", "3 x 30 sec", "ASdvN_XEl_c", "Plank")
  ];
  const DAY5 = [
    X("Pull ups", "3 x 10-12", "eGo4IYlbE5g", "Pullups"),
    X("Barbell bent over row", "3 x 10-12", "kBWAon7ItEc", "Bent_Over_Barbell_Row"),
    X("Seated cable row", "3 x 10-12", "GZbfZ033f74", "Seated_Cable_Rows"),
    X("Barbell curl", "3 x 10-12", "kwG2ipFRgfo", "Barbell_Curl"),
    X("Dumbbell hammer curl", "3 x 10-12", "zC3nLlEvin4", "Hammer_Curls"),
    X("Preacher curl", "3 x 10-12", "fPDF-a58XsA", "Preacher_Curl"),
    X("Crunches", "3 x 20", "Xyd_fa5zoEU", "Crunches"),
    X("Leg raises", "3 x 15", "JB2oyawG9KI", "Flat_Bench_Lying_Leg_Raise"),
    X("Plank", "3 x 30 sec", "ASdvN_XEl_c", "Plank")
  ];
  const DAY6 = [
    X("Dumbbell shoulder press", "3 x 10-12", "qEwKCR5JCog", "Dumbbell_Shoulder_Press"),
    X("Dumbbell lateral raise", "3 x 12-15", "3VcKaXpzqRo", "Side_Lateral_Raise"),
    X("Rear delt fly", "3 x 12-15", "nlkFXl2LPGY", "Seated_Bent-Over_Rear_Delt_Raise"),
    X("Barbell back squat", "3 x 8-12", "ultWZbUMPL8", "Barbell_Full_Squat"),
    X("Dumbbell walking lunge", "3 x 10-12 each", "D7Ka5PKM7b8", "Dumbbell_Lunges"),
    X("Romanian deadlift", "3 x 8-12", "2SHsk9AzdjA", "Romanian_Deadlift")
  ];

  const PLAN = {
    Monday: { title: "Day 1 — Chest & Triceps", list: DAY1 },
    Tuesday: { title: "Day 2 — Back & Biceps + Abs 2", list: DAY2 },
    Wednesday: { title: "Day 3 — Shoulders & Legs + Abs 1", list: DAY3 },
    Thursday: { title: "Day 4 — Chest & Triceps + Abs 2", list: DAY4 },
    Friday: { title: "Day 5 — Back & Biceps + Abs 1", list: DAY5 },
    Saturday: { title: "Day 6 — Shoulders & Legs", list: DAY6 },
    Sunday: { title: "Rest day", list: [] }
  };

  if (typeof SPLIT === "object") {
    SPLIT.Monday = "Day 1 Chest & Triceps";
    SPLIT.Tuesday = "Day 2 Back & Biceps";
    SPLIT.Wednesday = "Day 3 Shoulders & Legs";
    SPLIT.Thursday = "Day 4 Chest & Triceps";
    SPLIT.Friday = "Day 5 Back & Biceps";
    SPLIT.Saturday = "Day 6 Shoulders & Legs";
    SPLIT.Sunday = "Off";
  }

  function dayName(dateStr) {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const iso = dateStr || (typeof todayISO === "function" ? todayISO() : new Date().toISOString().slice(0, 10));
    return days[new Date(iso + "T12:00:00").getDay()];
  }
  function watch(id) { return "https://www.youtube.com/watch?v=" + id; }
  function pic(g, i) { return IMG + g + "/" + i + ".jpg"; }
  function cardHtml(ex) {
    return '<a class="ex-card" href="' + watch(ex.y) + '" target="_blank" rel="noopener">' +
      '<span class="ex-anim"><img class="a0" src="' + pic(ex.g, 0) + '" alt="' + ex.n + '"><img class="a1" src="' + pic(ex.g, 1) + '" alt=""></span>' +
      '<div><b>' + fancy(ex.n) + '</b><span>' + fancy(ex.s) + ' • ' + fancy("tap video") + '</span></div></a>';
  }
  function renderBox(box, dateStr) {
    if (!box) return;
    const day = dayName(dateStr);
    const plan = PLAN[day] || PLAN.Sunday;
    if (day === "Sunday") {
      box.innerHTML = '<p class="badge">' + fancy("today plan") + '</p><h3>' + fancy("sunday rest") + '</h3><p class="sub">' + fancy("walk optional. gym off.") + '</p>';
      return;
    }
    box.innerHTML =
      '<p class="badge">' + fancy("your gym plan") + ' • ' + fancy(day) + '</p>' +
      '<h3>' + fancy(plan.title) + '</h3>' +
      '<p class="sub">' + fancy("same exercises. animated photo. tap for video.") + '</p>' +
      '<div class="ex-list">' + plan.list.map(cardHtml).join('') + '</div>' +
      '<button class="btn ok full" type="button" data-exfill style="margin-top:12px">' + fancy("put list in notes") + '</button>';
    const fill = box.querySelector("[data-exfill]");
    if (fill) fill.onclick = function () {
      const text = plan.list.map(function (e) { return e.n + " " + e.s; }).join("\n");
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
  function paintGuide() {
    const date = el("date") && el("date").value ? el("date").value : (typeof todayISO === "function" ? todayISO() : "");
    renderBox(el("exGuideHome"), typeof todayISO === "function" ? todayISO() : date);
    renderBox(el("exGuideWork"), date);
    const day = dayName(typeof todayISO === "function" ? todayISO() : date);
    if (el("homeSplit") && PLAN[day]) el("homeSplit").textContent = PLAN[day].title;
    if (el("splitLine") && el("date") && PLAN[dayName(el("date").value)]) el("splitLine").textContent = PLAN[dayName(el("date").value)].title;
  }
  if (!document.getElementById("ex-guide-css")) {
    const st = document.createElement("style");
    st.id = "ex-guide-css";
    st.textContent = ".ex-box h3{margin:4px 0 8px;font:800 17px Syne,sans-serif;color:#ffe4b5}.ex-list{display:flex;flex-direction:column;gap:10px;margin-top:10px}.ex-card{display:flex;gap:12px;align-items:center;padding:8px;border-radius:18px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);color:inherit;text-decoration:none}.ex-anim{position:relative;width:110px;height:86px;flex:0 0 110px;border-radius:14px;overflow:hidden;background:#111}.ex-anim img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.ex-anim .a0{animation:exSwap 1.4s steps(1) infinite}.ex-anim .a1{opacity:0;animation:exSwap2 1.4s steps(1) infinite}@keyframes exSwap{0%,49%{opacity:1}50%,100%{opacity:0}}@keyframes exSwap2{0%,49%{opacity:0}50%,100%{opacity:1}}.ex-card b{display:block;font-size:14px}.ex-card span{display:block;margin-top:3px;font-size:11px;color:#9aa7b8}";
    document.head.appendChild(st);
  }
  function ensureBox(afterId, boxId) {
    if (el(boxId)) return;
    const after = el(afterId);
    if (!after || !after.parentNode) return;
    const box = document.createElement("div");
    box.className = "glass card ex-box";
    box.id = boxId;
    after.parentNode.insertBefore(box, after.nextSibling);
  }
  ensureBox("homeFinish", "exGuideHome");
  const note = el("after1HourNote");
  if (note && note.parentNode && !el("exGuideWork")) {
    const box = document.createElement("div");
    box.className = "glass card ex-box";
    box.id = "exGuideWork";
    note.parentNode.insertBefore(box, note.nextSibling);
  }
  if (typeof paintHome === "function") { const _ph = paintHome; paintHome = function () { _ph(); paintGuide(); }; }
  if (typeof fillForm === "function") { const _ff = fillForm; fillForm = function () { _ff(); paintGuide(); }; }
  paintGuide();
})();
