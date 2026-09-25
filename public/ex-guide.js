(function () {
  function fancy(s) {
    const m = { a: "ᴀ", b: "ʙ", c: "ᴄ", d: "ᴅ", e: "ᴇ", f: "ꜰ", g: "ɢ", h: "ʜ", i: "ɪ", j: "ᴊ", k: "ᴋ", l: "ʟ", m: "ᴍ", n: "ɴ", o: "ᴏ", p: "ᴘ", q: "ǫ", r: "ʀ", s: "s", t: "ᴛ", u: "ᴜ", v: "ᴠ", w: "ᴡ", x: "x", y: "ʏ", z: "ᴢ" };
    return String(s).replace(/[A-Za-z]/g, function (ch) { return m[ch.toLowerCase()] || ch; });
  }
  function el(id) { return document.getElementById(id); }

  const CHEST = [
    { n: "Bench press", s: "4 x 8-10", y: "rT7DgCr-3pg" },
    { n: "Incline dumbbell press", s: "3 x 10", y: "8iPEnn-ltC8" },
    { n: "Cable chest fly", s: "3 x 12", y: "Iwe6AmxVf7o" },
    { n: "Push ups", s: "3 x 12", y: "IODxDxX7oi4" }
  ];
  const TRI = [
    { n: "Tricep pushdown", s: "3 x 12", y: "2-LAMcrL1Ko" },
    { n: "Overhead tricep extension", s: "3 x 10", y: "Yb3jIHsLoMA" },
    { n: "Bench dips", s: "3 x 12", y: "0326dy_-CzM" }
  ];
  const BACK = [
    { n: "Lat pulldown", s: "4 x 10", y: "CAwf7n6Luuc" },
    { n: "Seated cable row", s: "3 x 10", y: "GZbfZ033f74" },
    { n: "Dumbbell row", s: "3 x 10", y: "roCP6wCXPqo" },
    { n: "Face pull", s: "3 x 15", y: "rep-xVEkqas" }
  ];
  const BI = [
    { n: "Barbell curl", s: "3 x 10", y: "kwG2ipFRgfo" },
    { n: "Hammer curl", s: "3 x 12", y: "zC3nLlEvin4" }
  ];
  const SHO = [
    { n: "Overhead press", s: "4 x 8", y: "2yjwXTZQDDI" },
    { n: "Lateral raise", s: "3 x 12", y: "3VcKaXpzqRo" },
    { n: "Rear delt fly", s: "3 x 12", y: "nlkFXl2LPGY" }
  ];
  const LEG = [
    { n: "Squat", s: "4 x 8", y: "ultWZbUMPL8" },
    { n: "Romanian deadlift", s: "3 x 10", y: "2SHsk9AzdjA" },
    { n: "Leg press", s: "3 x 12", y: "IZqWIMhr9yM" },
    { n: "Calf raise", s: "3 x 15", y: "gwLzBJYoNlA" }
  ];

  const PLAN = {
    Monday: { title: "Chest and triceps", list: CHEST.concat(TRI) },
    Tuesday: { title: "Back and biceps", list: BACK.concat(BI) },
    Wednesday: { title: "Shoulders and legs", list: SHO.concat(LEG) },
    Thursday: { title: "Chest and triceps", list: CHEST.concat(TRI) },
    Friday: { title: "Back and biceps", list: BACK.concat(BI) },
    Saturday: { title: "Shoulders and triceps", list: SHO.concat(TRI) },
    Sunday: { title: "Rest day", list: [] }
  };

  function dayName(dateStr) {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const iso = dateStr || (typeof todayISO === "function" ? todayISO() : new Date().toISOString().slice(0, 10));
    return days[new Date(iso + "T12:00:00").getDay()];
  }
  function thumb(id) { return "https://img.youtube.com/vi/" + id + "/hqdefault.jpg"; }
  function watch(id) { return "https://www.youtube.com/watch?v=" + id; }
  function cardHtml(ex) {
    return '<a class="ex-card" href="' + watch(ex.y) + '" target="_blank" rel="noopener">' +
      '<img src="' + thumb(ex.y) + '" alt="' + ex.n + '">' +
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
      '<p class="badge">' + fancy("today plan") + ' • ' + fancy(day) + '</p>' +
      '<h3>' + fancy(plan.title) + '</h3>' +
      '<p class="sub">' + fancy("photo + youtube form video. tap to watch.") + '</p>' +
      '<div class="ex-list">' + plan.list.map(cardHtml).join('') + '</div>' +
      '<button class="btn ok full" type="button" id="exFillBtn" style="margin-top:12px">' + fancy("put list in notes") + '</button>';
    const fill = box.querySelector("#exFillBtn");
    if (fill) fill.onclick = function () {
      const ta = el("after1HourNote");
      const text = plan.list.map(function (e) { return e.n + " " + e.s; }).join("\n");
      if (!ta) {
        if (typeof showTab === "function") showTab("workout");
        setTimeout(function () { const t2 = el("after1HourNote"); if (t2) t2.value = text; }, 50);
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
  }
  if (!document.getElementById("ex-guide-css")) {
    const st = document.createElement("style");
    st.id = "ex-guide-css";
    st.textContent = ".ex-box h3{margin:4px 0 8px;font:800 18px Syne,sans-serif;color:#ffe4b5}.ex-list{display:flex;flex-direction:column;gap:10px;margin-top:10px}.ex-card{display:flex;gap:10px;align-items:center;padding:8px;border-radius:16px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);color:inherit;text-decoration:none}.ex-card img{width:92px;height:62px;object-fit:cover;border-radius:12px;background:#111}.ex-card b{display:block;font-size:14px}.ex-card span{display:block;margin-top:3px;font-size:11px;color:#9aa7b8}";
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
  if (typeof paintHome === "function") {
    const _ph = paintHome;
    paintHome = function () { _ph(); paintGuide(); };
  }
  if (typeof fillForm === "function") {
    const _ff = fillForm;
    fillForm = function () { _ff(); paintGuide(); };
  }
  paintGuide();
})();
