const DAYS_HI = {
  Sunday: "Raviwar",
  Monday: "Somwar",
  Tuesday: "Mangalwar",
  Wednesday: "Budhwar",
  Thursday: "Guruwar",
  Friday: "Shukrawar",
  Saturday: "Shaniwar"
};

const SPLIT = {
  Monday: "Chest and triceps",
  Tuesday: "Back and biceps",
  Wednesday: "Shoulders and legs",
  Thursday: "Chest and triceps",
  Friday: "Back and biceps",
  Saturday: "Shoulders and triceps",
  Sunday: "Off"
};

const $ = (id) => document.getElementById(id);
let token = sessionStorage.getItem("sidhi-gym-token") || "";
let sessions = [];

function apiBase() {
  const saved = localStorage.getItem("sidhi-gym-api") || "";
  if (saved) return saved.replace(/\/$/, "");
  if (location.port === "5500" || location.protocol === "file:") return "http://localhost:3000";
  return "";
}

function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.style.display = "block";
  setTimeout(function () { t.style.display = "none"; }, 2200);
}

function todayISO() {
  const d = new Date();
  const z = d.getTimezoneOffset() * 60000;
  return new Date(d - z).toISOString().slice(0, 10);
}

function dayFromDate(dateStr) {
  return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date(dateStr + "T12:00:00").getDay()];
}

function nowTime() {
  const d = new Date();
  return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
}

async function api(path, opt) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = "Bearer " + token;
  const res = await fetch(apiBase() + path, Object.assign({ headers: headers }, opt || {}));
  const data = await res.json().catch(function () { return {}; });
  if (!res.ok) throw new Error(data.error || "Request fail");
  return data;
}

async function login() {
  const user = $("loginUser").value.trim();
  const pass = $("loginPass").value;
  const url = $("apiUrl").value.trim();
  if (url) localStorage.setItem("sidhi-gym-api", url);
  else localStorage.removeItem("sidhi-gym-api");
  try {
    const out = await api("/api/login", { method: "POST", body: JSON.stringify({ user: user, pass: pass }) });
    token = out.token;
    sessionStorage.setItem("sidhi-gym-token", token);
    sessionStorage.setItem("sidhi-gym-user", out.user);
    openApp();
  } catch (err) {
    toast(err.message);
  }
}

async function openApp() {
  $("gate").classList.add("hidden");
  $("app").classList.remove("hidden");
  $("hello").textContent = "Namaste " + (sessionStorage.getItem("sidhi-gym-user") || "Sidhi");
  if (!$("date").value) $("date").value = todayISO();
  if (!$("entryTime").value) $("entryTime").value = nowTime();
  paintDay();
  await reload();
  fillForm();
}

function paintDay() {
  const date = $("date").value || todayISO();
  const day = dayFromDate(date);
  $("dateLine").textContent = date + "  •  " + DAYS_HI[day] + " (" + day + ")";
  $("splitLine").textContent = SPLIT[day];
  $("splitLine").classList.toggle("off", day === "Sunday");
  $("offNote").classList.toggle("hidden", day !== "Sunday");
}

function currentForm() {
  const date = $("date").value;
  const day = dayFromDate(date);
  return {
    date: date,
    day: day,
    workoutName: SPLIT[day],
    entryTime: $("entryTime").value,
    entryWeight: $("entryWeight").value,
    after1HourTime: $("after1HourTime").value,
    after1HourNote: $("after1HourNote").value,
    beforeTreadmillTime: $("beforeTreadmillTime").value,
    beforeTreadmillNote: $("beforeTreadmillNote").value,
    afterTreadmillTime: $("afterTreadmillTime").value,
    afterTreadmillNote: $("afterTreadmillNote").value,
    finished: false
  };
}

function fillForm() {
  const date = $("date").value;
  const row = sessions.find(function (s) { return s.date === date; });
  $("entryTime").value = row && row.entryTime ? row.entryTime : nowTime();
  $("entryWeight").value = row && row.entryWeight != null ? row.entryWeight : "";
  $("after1HourTime").value = (row && row.after1HourTime) || "";
  $("after1HourNote").value = (row && row.after1HourNote) || "";
  $("beforeTreadmillTime").value = (row && row.beforeTreadmillTime) || "";
  $("beforeTreadmillNote").value = (row && row.beforeTreadmillNote) || "";
  $("afterTreadmillTime").value = (row && row.afterTreadmillTime) || "";
  $("afterTreadmillNote").value = (row && row.afterTreadmillNote) || "";
  paintResult(row);
}

function paintResult(row) {
  const box = $("resultText");
  const sub = $("resultSub");
  if (!row || row.entryWeight == null || row.entryWeight === "") {
    box.className = "today-box";
    box.textContent = "Pehle aaj ka weight daalo";
    sub.textContent = "Kal ke weight se compare yahin aayega.";
    return;
  }
  const w = Number(row.entryWeight);
  if (row.prevWeight == null) {
    box.className = "today-box";
    box.textContent = "Aaj " + w + " kg";
    sub.textContent = "Pehla record hai. Kal se ghata/badha dikhega.";
    return;
  }
  const d = Number(row.diff) || 0;
  const abs = Math.abs(d);
  if (row.trend === "down") {
    box.className = "today-box delta down";
    box.textContent = "Aaj " + w + " kg  •  " + abs + " kg ghata";
    sub.textContent = "Kal " + row.prevWeight + " kg tha. Aaj ka workout " + (row.finished ? "khatam." : "chal raha hai.");
  } else if (row.trend === "up") {
    box.className = "today-box delta up";
    box.textContent = "Aaj " + w + " kg  •  " + abs + " kg badha";
    sub.textContent = "Kal " + row.prevWeight + " kg tha. Aaj ka workout " + (row.finished ? "khatam." : "chal raha hai.");
  } else {
    box.className = "today-box delta same";
    box.textContent = "Aaj " + w + " kg  •  same";
    sub.textContent = "Kal jaisa hi weight. " + (row.finished ? "Workout khatam." : "");
  }
}

function paintHist() {
  $("hist").innerHTML = sessions.map(function (s) {
    let delta = "-";
    if (s.trend === "down") delta = s.diff + " kg ghata";
    if (s.trend === "up") delta = "+" + s.diff + " kg badha";
    if (s.trend === "same" && s.prevWeight != null) delta = "same";
    return "<tr><td>" + s.date + "<div class=\"sub\" style=\"margin:0\">" + (DAYS_HI[s.day] || "") + " / " + (s.day || "") + "</div></td><td>" +
      (s.workoutName || "") + (s.finished ? "<div class=\"sub\" style=\"margin:0\">khatam</div>" : "") +
      "</td><td>" + (s.entryWeight != null ? s.entryWeight + " kg" : "-") +
      "<div class=\"sub\" style=\"margin:0\">" + delta + "</div></td><td>" +
      "<button class=\"btn ghost\" data-open=\"" + s.date + "\">Open</button> " +
      "<button class=\"btn danger\" data-del=\"" + s.date + "\">X</button></td></tr>";
  }).join("") || "<tr><td colspan=\"4\" class=\"sub\">Abhi Mongo me session nahi</td></tr>";
}

async function reload() {
  sessions = await api("/api/sessions");
  paintHist();
  paintResult(sessions.find(function (s) { return s.date === $("date").value; }));
}

async function save(finished) {
  try {
    const body = currentForm();
    const old = sessions.find(function (s) { return s.date === body.date; }) || {};
    body.finished = finished || !!old.finished;
    if (finished) body.finished = true;
    const out = await api("/api/sessions/" + body.date, { method: "PUT", body: JSON.stringify(body) });
    sessions = out.sessions;
    paintHist();
    paintResult(sessions.find(function (s) { return s.date === body.date; }));
    toast(finished ? "Aaj ka workout khatam. Mongo me save." : "Mongo me save ho gaya");
  } catch (err) {
    toast(err.message);
  }
}

$("loginBtn").onclick = login;
$("loginPass").addEventListener("keydown", function (e) { if (e.key === "Enter") login(); });
$("logoutBtn").onclick = function () {
  sessionStorage.removeItem("sidhi-gym-token");
  location.reload();
};
$("date").addEventListener("change", function () {
  paintDay();
  fillForm();
});
$("saveBtn").onclick = function () { save(false); };
$("finishBtn").onclick = function () { save(true); };
$("hist").addEventListener("click", async function (e) {
  const open = e.target.dataset.open;
  const del = e.target.dataset.del;
  if (open) {
    $("date").value = open;
    paintDay();
    fillForm();
  }
  if (del) {
    if (!confirm(del + " mitaye?")) return;
    sessions = await api("/api/sessions/" + del, { method: "DELETE" });
    paintHist();
    fillForm();
  }
});

$("apiUrl").value = localStorage.getItem("sidhi-gym-api") || "";
if (token) openApp().catch(function () {
  sessionStorage.removeItem("sidhi-gym-token");
});
