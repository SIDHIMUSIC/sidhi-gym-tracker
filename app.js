const SPLIT = {
  Monday: "Chest and triceps",
  Tuesday: "Back and biceps",
  Wednesday: "Shoulders and legs",
  Thursday: "Chest and triceps",
  Friday: "Back and biceps",
  Saturday: "Shoulders and triceps",
  Sunday: "Off"
};
const DAYS_HI = {
  Sunday: "Raviwar", Monday: "Somwar", Tuesday: "Mangalwar", Wednesday: "Budhwar",
  Thursday: "Guruwar", Friday: "Shukrawar", Saturday: "Shaniwar"
};
const TM_IDS = ["Time","Weight","Km","Mins","Speed","Incline","Note"];
const $ = (id) => document.getElementById(id);
const TOKEN_KEY = "sidhi-gym-token";
const USER_KEY = "sidhi-gym-username";

let token = localStorage.getItem(TOKEN_KEY) || "";
let username = localStorage.getItem(USER_KEY) || "";
let sessions = [];
let goalWeight = null;
let calCursor = new Date();

function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.style.display = "block";
  setTimeout(function () { t.style.display = "none"; }, 2400);
}
function todayISO() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}
function nowTime() {
  const d = new Date();
  return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
}
function kg(v) {
  if (v == null || v === "") return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n * 1000) / 1000;
}
function nOrNull(id) {
  const v = $(id).value;
  return v === "" ? null : Number(v);
}
function dayFromDate(dateStr) {
  return ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][new Date(dateStr + "T12:00:00").getDay()];
}
function greet() {
  const h = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" }).format(new Date()));
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

async function api(path, opts) {
  opts = opts || {};
  const headers = Object.assign({ "Content-Type": "application/json" }, opts.headers || {});
  if (token) headers.Authorization = "Bearer " + token;
  const res = await fetch(path, {
    method: opts.method || "GET",
    headers: headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined
  });
  let data = {};
  try { data = await res.json(); } catch (e) {}
  if (!res.ok) throw new Error(data.error || ("Error " + res.status));
  return data;
}

function currentRow() {
  return sessions.find(function (s) { return s.date === $("date").value; });
}
function todayRow() {
  return sessions.find(function (s) { return s.date === todayISO(); });
}

function setSeg(id, v) {
  document.querySelectorAll("#" + id + " button").forEach(function (b) {
    b.classList.toggle("on", b.dataset.v === (v || "walk"));
  });
}
function getSeg(id) {
  const on = document.querySelector("#" + id + " button.on");
  return on ? on.dataset.v : "walk";
}

function paintDay() {
  const date = $("date").value || todayISO();
  const day = dayFromDate(date);
  $("dateLine").textContent = date + "  •  " + DAYS_HI[day];
  $("splitLine").textContent = SPLIT[day];
  $("splitLine").classList.toggle("off", day === "Sunday");
  $("offNote").classList.toggle("hidden", day !== "Sunday");
}

function paintResult(row) {
  const box = $("resultText");
  const sub = $("resultSub");
  const tm = $("tmResult");
  const start = kg(row && row.entryWeight);
  const end = kg(row && row.afterTreadmillWeight);
  if (start == null) {
    box.className = "today-box";
    box.textContent = "Pehle gym start wala weight daalo";
    sub.textContent = "Shuruat se last (treadmill 2) tak ghata/badha.";
  } else if (end == null) {
    box.className = "today-box";
    box.textContent = "Shuruat me " + start + " kg";
    sub.textContent = "Treadmill 2 ke baad wala weight daalo.";
  } else {
    const d = Math.round((end - start) * 1000) / 1000;
    const abs = Math.abs(d);
    if (d < 0) {
      box.className = "today-box delta down";
      box.textContent = "Ghat ke " + end + " kg aaya";
      sub.textContent = "Shuruat me " + start + " kg tha  •  " + abs + " kg kam";
    } else if (d > 0) {
      box.className = "today-box delta up";
      box.textContent = "Badh ke " + end + " kg aaya";
      sub.textContent = "Shuruat me " + start + " kg tha  •  " + abs + " kg zyada";
    } else {
      box.className = "today-box delta same";
      box.textContent = "Khatam bhi " + end + " kg";
      sub.textContent = "Shuruat me " + start + " kg";
    }
  }
  const bits = [];
  [["1", row && row.beforeTreadmillType, row && row.beforeTreadmillKm, row && row.beforeTreadmillMins, row && row.beforeTreadmillSpeed, row && row.beforeTreadmillIncline],
   ["2", row && row.afterTreadmillType, row && row.afterTreadmillKm, row && row.afterTreadmillMins, row && row.afterTreadmillSpeed, row && row.afterTreadmillIncline]
  ].forEach(function (t) {
    if (t[2] || t[3] || t[4]) {
      bits.push("TM " + t[0] + " " + (t[1] === "run" ? "Run" : "Walk") + ": " +
        (t[2] != null ? t[2] + " km" : "") +
        (t[3] != null ? " • " + t[3] + " min" : "") +
        (t[4] != null ? " • " + t[4] + " km/h" : "") +
        (t[5] != null ? " • " + t[5] + "%" : ""));
    }
  });
  tm.textContent = bits.join("  |  ");
}

function fillVal(id, v) { $(id).value = v != null && v !== "" ? v : ""; }

function fillForm() {
  const row = currentRow() || {};
  paintDay();
  $("entryTime").value = row.entryTime || nowTime();
  fillVal("entryWeight", row.entryWeight);
  fillVal("after1HourTime", row.after1HourTime);
  fillVal("after1HourNote", row.after1HourNote);
  fillVal("beforeTreadmillTime", row.beforeTreadmillTime);
  fillVal("beforeTreadmillWeight", row.beforeTreadmillWeight);
  fillVal("beforeTreadmillKm", row.beforeTreadmillKm);
  fillVal("beforeTreadmillMins", row.beforeTreadmillMins);
  fillVal("beforeTreadmillSpeed", row.beforeTreadmillSpeed);
  fillVal("beforeTreadmillIncline", row.beforeTreadmillIncline);
  fillVal("beforeTreadmillNote", row.beforeTreadmillNote);
  fillVal("afterTreadmillTime", row.afterTreadmillTime);
  fillVal("afterTreadmillWeight", row.afterTreadmillWeight);
  fillVal("afterTreadmillKm", row.afterTreadmillKm);
  fillVal("afterTreadmillMins", row.afterTreadmillMins);
  fillVal("afterTreadmillSpeed", row.afterTreadmillSpeed);
  fillVal("afterTreadmillIncline", row.afterTreadmillIncline);
  fillVal("afterTreadmillNote", row.afterTreadmillNote);
  setSeg("beforeTreadmillType", row.beforeTreadmillType || "walk");
  setSeg("afterTreadmillType", row.afterTreadmillType || "run");
  paintResult(row);
}

function paintHist() {
  $("hist").innerHTML = sessions.map(function (s) {
    const start = kg(s.entryWeight);
    const end = kg(s.afterTreadmillWeight);
    let line = start != null ? start + " kg" : "-";
    let delta = "-";
    if (start != null && end != null) {
      const d = Math.round((end - start) * 1000) / 1000;
      line = start + " → " + end;
      delta = d < 0 ? Math.abs(d) + " kg ghata" : d > 0 ? d + " kg badha" : "same";
    }
    const km = (Number(s.beforeTreadmillKm) || 0) + (Number(s.afterTreadmillKm) || 0);
    return "<tr><td>" + s.date + "<div class=\"sub\" style=\"margin:0\">" + (DAYS_HI[s.day] || "") + "</div></td><td>" +
      (s.workoutName || "") + (s.finished ? "<div class=\"sub\" style=\"margin:0\">khatam</div>" : "") +
      "</td><td>" + line + "<div class=\"sub\" style=\"margin:0\">" + delta + (km ? " • " + km + " km" : "") + "</div></td><td>" +
      "<button class=\"btn ghost\" data-open=\"" + s.date + "\">Open</button> " +
      "<button class=\"btn danger\" data-del=\"" + s.date + "\">X</button></td></tr>";
  }).join("") || "<tr><td colspan=\"4\" class=\"sub\">Abhi koi session nahi</td></tr>";
}

function durationText(row) {
  if (!row || !row.entryTime || !row.afterTreadmillTime) {
    const m = (Number(row && row.beforeTreadmillMins) || 0) + (Number(row && row.afterTreadmillMins) || 0);
    if (!m) return "—";
    return m + " min";
  }
  const a = row.entryTime.split(":").map(Number);
  const b = row.afterTreadmillTime.split(":").map(Number);
  let mins = (b[0] * 60 + b[1]) - (a[0] * 60 + a[1]);
  if (mins < 0) mins += 24 * 60;
  return Math.floor(mins / 60) + "h " + (mins % 60) + "m";
}

function streakCount() {
  const map = {};
  sessions.forEach(function (s) { map[s.date] = s; });
  let n = 0;
  const d = new Date(todayISO() + "T12:00:00");
  for (let i = 0; i < 400; i++) {
    const iso = d.toISOString().slice(0, 10);
    const day = d.getDay();
    const row = map[iso];
    if (day === 0) { n++; }
    else if (row && row.finished) n++;
    else break;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

function weekDelta() {
  const withW = sessions.filter(function (s) { return kg(s.entryWeight) != null; }).slice().sort(function (a, b) { return a.date.localeCompare(b.date); });
  if (!withW.length) return null;
  const last = kg(withW[withW.length - 1].entryWeight);
  const from = new Date(todayISO() + "T12:00:00");
  from.setDate(from.getDate() - 7);
  const iso = from.toISOString().slice(0, 10);
  const old = withW.filter(function (s) { return s.date <= iso; }).pop();
  if (!old) return { last: last, diff: null };
  return { last: last, diff: Math.round((last - kg(old.entryWeight)) * 1000) / 1000 };
}

function drawChart(canvas, rows) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  const pts = rows.filter(function (s) { return kg(s.entryWeight) != null; }).slice().sort(function (a, b) { return a.date.localeCompare(b.date); }).slice(-14);
  if (pts.length < 1) {
    ctx.fillStyle = "#9aa7b8"; ctx.font = "22px Hind"; ctx.fillText("Weight save karo, graph yahin aayega", 24, h / 2);
    return;
  }
  const ys = pts.map(function (p) { return kg(p.entryWeight); });
  const min = Math.min.apply(null, ys) - 0.4;
  const max = Math.max.apply(null, ys) + 0.4;
  ctx.strokeStyle = "rgba(255,255,255,.08)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    const y = 20 + i * (h - 40) / 3;
    ctx.beginPath(); ctx.moveTo(20, y); ctx.lineTo(w - 10, y); ctx.stroke();
  }
  ctx.beginPath();
  pts.forEach(function (p, i) {
    const x = 24 + i * ((w - 50) / Math.max(pts.length - 1, 1));
    const y = h - 20 - ((kg(p.entryWeight) - min) / (max - min || 1)) * (h - 40);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = "#f0c27a"; ctx.lineWidth = 3; ctx.stroke();
  pts.forEach(function (p, i) {
    const x = 24 + i * ((w - 50) / Math.max(pts.length - 1, 1));
    const y = h - 20 - ((kg(p.entryWeight) - min) / (max - min || 1)) * (h - 40);
    ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#63e2b3"; ctx.fill();
  });
}

function paintHome() {
  const row = todayRow();
  const wd = weekDelta();
  const latest = kg(row && (row.afterTreadmillWeight || row.entryWeight)) || (wd && wd.last);
  $("hello").textContent = greet() + ", " + username + "!";
  $("homeKg").textContent = latest != null ? latest + " kg" : "— kg";
  if (wd && wd.diff != null) {
    $("homeWeek").textContent = (wd.diff < 0 ? "↓ " + Math.abs(wd.diff) : wd.diff > 0 ? "↑ " + wd.diff : "same") + " kg this week";
    $("homeWeek").className = "sub " + (wd.diff < 0 ? "delta down" : wd.diff > 0 ? "delta up" : "");
  } else $("homeWeek").textContent = "Is hafte ka change yahin";
  $("stStreak").textContent = streakCount();
  $("stWorkouts").textContent = sessions.filter(function (s) { return s.finished; }).length;
  if (goalWeight && latest != null) {
    const left = Math.round((latest - goalWeight) * 10) / 10;
    $("stGoal").textContent = (left > 0 ? left + " kg" : "Done");
  } else $("stGoal").textContent = "—";
  $("homeSplit").textContent = SPLIT[dayFromDate(todayISO())];
  $("homeW").textContent = latest != null ? latest + " kg" : "—";
  $("homeDur").textContent = durationText(row);
  const km = (Number(row && row.beforeTreadmillKm) || 0) + (Number(row && row.afterTreadmillKm) || 0);
  $("homeTm").textContent = km ? km + " km" : "—";
  drawChart($("homeChart"), sessions);
}

function paintCal() {
  const y = calCursor.getFullYear(), m = calCursor.getMonth();
  $("calTitle").textContent = calCursor.toLocaleString("en-IN", { month: "long", year: "numeric" });
  const first = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();
  const map = {};
  sessions.forEach(function (s) { map[s.date] = s; });
  const today = todayISO();
  let html = "SMTWTFS".split("").map(function (d) { return "<div class=\"d\">" + d + "</div>"; }).join("");
  for (let i = 0; i < first; i++) html += "<div></div>";
  for (let d = 1; d <= days; d++) {
    const iso = y + "-" + String(m + 1).padStart(2, "0") + "-" + String(d).padStart(2, "0");
    const day = new Date(iso + "T12:00:00").getDay();
    const row = map[iso];
    let cls = "c";
    if (row && row.finished) cls += " done";
    else if (day === 0 || (row && row.workoutName === "Off")) cls += " rest";
    if (iso === today) cls += " today";
    html += "<div class=\"" + cls + "\" data-day=\"" + iso + "\">" + d + "</div>";
  }
  $("cal").innerHTML = html;
}

function showTab(name) {
  ["home", "workout", "progress", "history"].forEach(function (t) {
    $("view-" + t).classList.toggle("hidden", t !== name);
    document.querySelector('.tab[data-tab="' + t + '"]').classList.toggle("on", t === name);
  });
  if (name === "home") paintHome();
  if (name === "workout") fillForm();
  if (name === "progress") { paintCal(); drawChart($("progChart"), sessions); if (goalWeight) $("goalWeight").value = goalWeight; }
  if (name === "history") paintHist();
}

function formBody(finished) {
  const old = currentRow() || {};
  return {
    date: $("date").value,
    entryTime: $("entryTime").value,
    entryWeight: nOrNull("entryWeight"),
    after1HourTime: $("after1HourTime").value,
    after1HourNote: $("after1HourNote").value,
    beforeTreadmillTime: $("beforeTreadmillTime").value,
    beforeTreadmillType: getSeg("beforeTreadmillType"),
    beforeTreadmillWeight: nOrNull("beforeTreadmillWeight"),
    beforeTreadmillKm: nOrNull("beforeTreadmillKm"),
    beforeTreadmillMins: nOrNull("beforeTreadmillMins"),
    beforeTreadmillSpeed: nOrNull("beforeTreadmillSpeed"),
    beforeTreadmillIncline: nOrNull("beforeTreadmillIncline"),
    beforeTreadmillNote: $("beforeTreadmillNote").value,
    afterTreadmillTime: $("afterTreadmillTime").value,
    afterTreadmillType: getSeg("afterTreadmillType"),
    afterTreadmillWeight: nOrNull("afterTreadmillWeight"),
    afterTreadmillKm: nOrNull("afterTreadmillKm"),
    afterTreadmillMins: nOrNull("afterTreadmillMins"),
    afterTreadmillSpeed: nOrNull("afterTreadmillSpeed"),
    afterTreadmillIncline: nOrNull("afterTreadmillIncline"),
    afterTreadmillNote: $("afterTreadmillNote").value,
    finished: finished || !!old.finished
  };
}

async function save(finished) {
  try {
    const data = await api("/api/session", { method: "PUT", body: formBody(finished) });
    sessions = data.sessions || [];
    fillForm();
    paintHist();
    paintHome();
    toast(finished ? "Workout khatam" : "Mongo me save");
  } catch (err) { toast(err.message); }
}

function openApp() {
  $("gate").classList.add("hidden");
  $("app").classList.remove("hidden");
  $("tabbar").classList.remove("hidden");
  if (!$("date").value) $("date").value = todayISO();
  showTab("home");
}

function setAuth(data) {
  token = data.token;
  username = data.username;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, username);
}

async function afterAuth() {
  const me = await api("/api/me");
  goalWeight = me.goalWeight;
  const data = await api("/api/sessions");
  sessions = data.sessions || [];
  openApp();
}

async function register() {
  const user = $("loginUser").value.trim().toLowerCase();
  const pass = $("loginPass").value;
  if (user.length < 2) return toast("Username chhota hai");
  if (pass.length < 4) return toast("Password min 4");
  try {
    setAuth(await api("/api/register", { method: "POST", body: { username: user, password: pass } }));
    sessions = [];
    toast("Account ban gaya");
    await afterAuth();
  } catch (err) { toast(err.message); }
}
async function login() {
  const user = $("loginUser").value.trim().toLowerCase();
  const pass = $("loginPass").value;
  if (pass.length < 4) return toast("Password min 4");
  try {
    setAuth(await api("/api/login", { method: "POST", body: { username: user, password: pass } }));
    toast("Login ok");
    await afterAuth();
  } catch (err) { toast(err.message); }
}

$("loginBtn").onclick = login;
$("setupBtn").onclick = register;
$("loginPass").addEventListener("keydown", function (e) { if (e.key === "Enter") login(); });
$("logoutBtn").onclick = function () {
  localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); location.reload();
};
$("date").addEventListener("change", fillForm);
$("saveBtn").onclick = function () { save(false); };
$("finishBtn").onclick = function () { save(true); };
$("homeFinish").onclick = function () { showTab("workout"); };
document.querySelectorAll(".tab").forEach(function (b) {
  b.onclick = function () { showTab(b.dataset.tab); };
});
document.querySelectorAll(".seg").forEach(function (seg) {
  seg.addEventListener("click", function (e) {
    const b = e.target.closest("button");
    if (!b) return;
    seg.querySelectorAll("button").forEach(function (x) { x.classList.remove("on"); });
    b.classList.add("on");
  });
});
$("hist").addEventListener("click", async function (e) {
  const open = e.target.dataset.open;
  const del = e.target.dataset.del;
  if (open) { $("date").value = open; showTab("workout"); }
  if (del) {
    if (!confirm(del + " mitaye?")) return;
    try {
      const data = await api("/api/session/" + del, { method: "DELETE" });
      sessions = data.sessions || [];
      paintHist(); paintHome();
    } catch (err) { toast(err.message); }
  }
});
$("calPrev").onclick = function () { calCursor.setMonth(calCursor.getMonth() - 1); paintCal(); };
$("calNext").onclick = function () { calCursor.setMonth(calCursor.getMonth() + 1); paintCal(); };
$("cal").addEventListener("click", function (e) {
  const d = e.target.dataset.day;
  if (!d) return;
  $("date").value = d;
  showTab("workout");
});
$("goalBtn").onclick = async function () {
  try {
    const data = await api("/api/me", { method: "PATCH", body: { goalWeight: nOrNull("goalWeight") } });
    goalWeight = data.goalWeight;
    toast("Goal save");
    paintHome();
  } catch (err) { toast(err.message); }
};

(async function boot() {
  if (!token) return;
  try { await afterAuth(); }
  catch (e) {
    localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY);
    token = ""; username = "";
  }
})();
