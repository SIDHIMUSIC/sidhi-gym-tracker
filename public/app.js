const SPLIT = {
  Monday: "Chest and triceps",
  Tuesday: "Back and biceps",
  Wednesday: "Shoulders and legs",
  Thursday: "Chest and triceps",
  Friday: "Back and biceps",
  Saturday: "Shoulders and triceps",
  Sunday: "Off"
};
const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
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
  return DAYS[new Date(dateStr + "T12:00:00").getDay()];
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
function fillVal(id, v) { $(id).value = v != null && v !== "" ? v : ""; }
function paintDay() {
  const date = $("date").value || todayISO();
  const day = dayFromDate(date);
  $("dateLine").textContent = date + "  •  " + day;
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
    box.textContent = "Add gym start weight";
    sub.textContent = "Start vs end weight.";
  } else if (end == null) {
    box.className = "today-box";
    box.textContent = "Start " + start + " kg";
    sub.textContent = "Add end weight after workout.";
  } else {
    const d = Math.round((end - start) * 1000) / 1000;
    const abs = Math.abs(d);
    if (d < 0) {
      box.className = "today-box delta down";
      box.textContent = "Down to " + end + " kg";
      sub.textContent = "Started at " + start + " kg  •  " + abs + " kg less";
    } else if (d > 0) {
      box.className = "today-box delta up";
      box.textContent = "Up to " + end + " kg";
      sub.textContent = "Started at " + start + " kg  •  " + abs + " kg more";
    } else {
      box.className = "today-box delta same";
      box.textContent = "Still " + end + " kg";
      sub.textContent = "Started at " + start + " kg";
    }
  }
  const bits = [];
  if (row && (row.beforeTreadmillKm || row.beforeTreadmillMins || row.beforeTreadmillSpeed)) {
    bits.push("Normal: " +
      (row.beforeTreadmillKm != null ? row.beforeTreadmillKm + " km" : "") +
      (row.beforeTreadmillMins != null ? " • " + row.beforeTreadmillMins + " min" : "") +
      (row.beforeTreadmillSpeed != null ? " • " + row.beforeTreadmillSpeed + " km/h" : ""));
  }
  tm.textContent = bits.join("  |  ");
}
function fillForm() {
  const row = currentRow() || {};
  paintDay();
  $("entryTime").value = row.entryTime || "";
  fillVal("entryWeight", row.entryWeight);
  fillVal("after1HourTime", row.after1HourTime);
  fillVal("after1HourNote", row.after1HourNote);
  fillVal("beforeTreadmillTime", row.beforeTreadmillTime);
  fillVal("beforeTreadmillKm", row.beforeTreadmillKm);
  fillVal("beforeTreadmillMins", row.beforeTreadmillMins);
  fillVal("beforeTreadmillSpeed", row.beforeTreadmillSpeed);
  fillVal("beforeTreadmillNote", row.beforeTreadmillNote);
  fillVal("afterTreadmillTime", row.afterTreadmillTime);
  fillVal("afterTreadmillWeight", row.afterTreadmillWeight);
  fillVal("afterTreadmillKm", row.afterTreadmillKm);
  fillVal("afterTreadmillMins", row.afterTreadmillMins);
  fillVal("afterTreadmillSpeed", row.afterTreadmillSpeed);
  fillVal("afterTreadmillIncline", row.afterTreadmillIncline);
  fillVal("afterTreadmillNote", row.afterTreadmillNote);
  paintResult(row);
}
function paintHist() {
  $("hist").innerHTML = sessions.map(function (s) {
    const start = kg(s.entryWeight);
    const end = kg(s.afterTreadmillWeight);
    let line = start != null ? start + " kg" : "-";
    if (start != null && end != null) line = start + " → " + end;
    return "<tr><td>" + s.date + "</td><td>" + (s.workoutName || "") + "</td><td>" + line + "</td><td></td></tr>";
  }).join("") || "";
}
function durationText(row) {
  if (!row || !row.entryTime || !row.afterTreadmillTime) {
    const m = (Number(row && row.beforeTreadmillMins) || 0) + (Number(row && row.afterTreadmillMins) || 0);
    return m ? m + " min" : "—";
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
    if (day === 0) n++;
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
  const old = withW.filter(function (s) { return s.date <= from.toISOString().slice(0, 10); }).pop();
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
    ctx.fillStyle = "#9aa7b8"; ctx.font = "22px Comfortaa"; ctx.fillText("Save weight to see graph", 24, h / 2);
    return;
  }
  const ys = pts.map(function (p) { return kg(p.entryWeight); });
  const min = Math.min.apply(null, ys) - 0.4;
  const max = Math.max.apply(null, ys) + 0.4;
  ctx.beginPath();
  pts.forEach(function (p, i) {
    const x = 24 + i * ((w - 50) / Math.max(pts.length - 1, 1));
    const y = h - 20 - ((kg(p.entryWeight) - min) / (max - min || 1)) * (h - 40);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = "#f0c27a"; ctx.lineWidth = 3; ctx.stroke();
}
function paintHome() {
  const row = todayRow();
  const wd = weekDelta();
  const latest = kg(row && (row.afterTreadmillWeight || row.entryWeight)) || (wd && wd.last);
  $("hello").textContent = greet() + ", " + username + "!";
  $("homeKg").textContent = latest != null ? latest + " kg" : "— kg";
  $("homeWeek").textContent = "this week";
  $("stStreak").textContent = streakCount();
  $("stWorkouts").textContent = sessions.filter(function (s) { return s.finished; }).length;
  $("stGoal").textContent = "—";
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
  $("cal").innerHTML = "";
}
function showTab(name) {
  ["home", "workout", "progress", "history"].forEach(function (t) {
    const v = $("view-" + t); if (v) v.classList.toggle("hidden", t !== name);
    const tab = document.querySelector('.tab[data-tab="' + t + '"]');
    if (tab) tab.classList.toggle("on", t === name);
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
    beforeTreadmillType: "normal",
    beforeTreadmillKm: nOrNull("beforeTreadmillKm"),
    beforeTreadmillMins: nOrNull("beforeTreadmillMins"),
    beforeTreadmillSpeed: nOrNull("beforeTreadmillSpeed"),
    beforeTreadmillNote: $("beforeTreadmillNote").value,
    afterTreadmillTime: $("afterTreadmillTime").value,
    afterTreadmillType: "incline",
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
    toast(finished ? "Workout done" : "Saved");
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
async function login() {
  const user = $("loginUser").value.trim().toLowerCase();
  const pass = $("loginPass").value;
  if (!user || !pass) return toast("Enter username and password");
  try {
    setAuth(await api("/api/login", { method: "POST", body: { username: user, password: pass } }));
    toast("Login ok");
    await afterAuth();
  } catch (err) { toast(err.message); }
}
$("loginBtn").onclick = login;
$("setupBtn").onclick = function () {};
$("loginPass").addEventListener("keydown", function (e) { if (e.key === "Enter") login(); });
$("logoutBtn").onclick = function () {
  token = ""; username = ""; sessions = [];
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  $("app").classList.add("hidden");
  $("tabbar").classList.add("hidden");
  $("gate").classList.remove("hidden");
  toast("Logged out");
};
$("date").addEventListener("change", fillForm);
$("saveBtn").onclick = function () { save(false); };
$("finishBtn").onclick = function () { save(true); };
$("homeFinish").onclick = function () { showTab("workout"); };
document.querySelectorAll(".tab").forEach(function (b) {
  b.onclick = function () { showTab(b.dataset.tab); };
});
$("calPrev").onclick = function () { calCursor.setMonth(calCursor.getMonth() - 1); paintCal(); };
$("calNext").onclick = function () { calCursor.setMonth(calCursor.getMonth() + 1); paintCal(); };
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
  catch (e) { toast("Reconnect ho raha hai"); }
})();
