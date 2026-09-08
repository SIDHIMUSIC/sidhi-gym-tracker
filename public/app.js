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
  Sunday: "Raviwar",
  Monday: "Somwar",
  Tuesday: "Mangalwar",
  Wednesday: "Budhwar",
  Thursday: "Guruwar",
  Friday: "Shukrawar",
  Saturday: "Shaniwar"
};
const $ = (id) => document.getElementById(id);
const TOKEN_KEY = "sidhi-gym-token";
const USER_KEY = "sidhi-gym-username";

let token = localStorage.getItem(TOKEN_KEY) || "";
let username = localStorage.getItem(USER_KEY) || "";
let sessions = [];

function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.style.display = "block";
  setTimeout(function () { t.style.display = "none"; }, 2400);
}

function todayISO() {
  const d = new Date();
  const z = d.getTimezoneOffset() * 60000;
  return new Date(d - z).toISOString().slice(0, 10);
}

function nowTime() {
  const d = new Date();
  return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
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
  const date = $("date").value;
  return sessions.find(function (s) { return s.date === date; });
}

function paintDay(row) {
  const date = $("date").value || todayISO();
  const day = (row && row.day) || ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date(date + "T12:00:00").getDay()];
  $("dateLine").textContent = date + "  •  " + (DAYS_HI[day] || "") + " (" + day + ")";
  $("splitLine").textContent = (row && row.workoutName) || SPLIT[day] || "";
  $("splitLine").classList.toggle("off", day === "Sunday");
  $("offNote").classList.toggle("hidden", day !== "Sunday");
}

function kg(v) {
  if (v == null || v === "") return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n * 1000) / 1000;
}

function paintResult(row) {
  const box = $("resultText");
  const sub = $("resultSub");
  const tm = $("tmResult");
  if (tm) tm.textContent = "";
  const start = kg(row && row.entryWeight);
  const end = kg(row && row.afterTreadmillWeight);
  if (start == null) {
    box.className = "today-box";
    box.textContent = "Pehle gym start wala weight daalo";
    sub.textContent = "Shuruat (entry) se last (treadmill ke baad) tak ghata/badha dikhega.";
    return;
  }
  if (end == null) {
    box.className = "today-box";
    box.textContent = "Shuruat me " + start + " kg";
    sub.textContent = "Treadmill ke baad wala weight daalo, phir ghata/badha dikhega.";
    return;
  }
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
    sub.textContent = "Shuruat me " + start + " kg  •  same";
  }
}

function fillForm() {
  const row = currentRow();
  paintDay(row);
  $("entryTime").value = row && row.entryTime ? row.entryTime : nowTime();
  $("entryWeight").value = row && row.entryWeight != null ? row.entryWeight : "";
  $("after1HourTime").value = (row && row.after1HourTime) || "";
  $("after1HourNote").value = (row && row.after1HourNote) || "";
  $("beforeTreadmillTime").value = (row && row.beforeTreadmillTime) || "";
  $("beforeTreadmillWeight").value = row && row.beforeTreadmillWeight != null ? row.beforeTreadmillWeight : "";
  $("beforeTreadmillNote").value = (row && row.beforeTreadmillNote) || "";
  $("afterTreadmillTime").value = (row && row.afterTreadmillTime) || "";
  $("afterTreadmillWeight").value = row && row.afterTreadmillWeight != null ? row.afterTreadmillWeight : "";
  $("afterTreadmillNote").value = (row && row.afterTreadmillNote) || "";
  paintResult(row);
}

function paintHist() {
  $("hist").innerHTML = sessions.map(function (s) {
    const start = kg(s.entryWeight);
    const end = kg(s.afterTreadmillWeight);
    let delta = "-";
    let line = start != null ? start + " kg start" : "-";
    if (start != null && end != null) {
      const d = Math.round((end - start) * 1000) / 1000;
      const abs = Math.abs(d);
      line = start + " → " + end + " kg";
      if (d < 0) delta = abs + " kg ghata";
      else if (d > 0) delta = abs + " kg badha";
      else delta = "same";
    }
    return "<tr><td>" + s.date + "<div class=\"sub\" style=\"margin:0\">" + (DAYS_HI[s.day] || "") + " / " + (s.day || "") + "</div></td><td>" +
      (s.workoutName || "") + (s.finished ? "<div class=\"sub\" style=\"margin:0\">khatam</div>" : "") +
      "</td><td>" + line +
      "<div class=\"sub\" style=\"margin:0\">" + delta + "</div></td><td>" +
      "<button class=\"btn ghost\" data-open=\"" + s.date + "\">Open</button> " +
      "<button class=\"btn danger\" data-del=\"" + s.date + "\">X</button></td></tr>";
  }).join("") || "<tr><td colspan=\"4\" class=\"sub\">Abhi koi session nahi</td></tr>";
}

function openApp() {
  $("gate").classList.add("hidden");
  $("app").classList.remove("hidden");
  $("hello").textContent = "Namaste " + username;
  if (!$("date").value) $("date").value = todayISO();
  fillForm();
  paintHist();
}

async function loadSessions() {
  const data = await api("/api/sessions");
  sessions = data.sessions || [];
}

function setAuth(data) {
  token = data.token;
  username = data.username;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, username);
}

async function register() {
  const user = $("loginUser").value.trim().toLowerCase();
  const pass = $("loginPass").value;
  if (user.length < 2) return toast("Username chhota hai");
  if (pass.length < 4) return toast("Password kam se kam 4 character");
  try {
    const data = await api("/api/register", { method: "POST", body: { username: user, password: pass } });
    setAuth(data);
    sessions = [];
    toast("Account ban gaya. Mongo me save ho gaya.");
    openApp();
  } catch (err) { toast(err.message); }
}

async function login() {
  const user = $("loginUser").value.trim().toLowerCase();
  const pass = $("loginPass").value;
  if (pass.length < 4) return toast("Password kam se kam 4 character");
  try {
    const data = await api("/api/login", { method: "POST", body: { username: user, password: pass } });
    setAuth(data);
    await loadSessions();
    toast("Login ok");
    openApp();
  } catch (err) { toast(err.message); }
}

function formBody(finished) {
  const old = currentRow() || {};
  return {
    date: $("date").value,
    entryTime: $("entryTime").value,
    entryWeight: $("entryWeight").value === "" ? null : Number($("entryWeight").value),
    after1HourTime: $("after1HourTime").value,
    after1HourNote: $("after1HourNote").value,
    beforeTreadmillTime: $("beforeTreadmillTime").value,
    beforeTreadmillWeight: $("beforeTreadmillWeight").value === "" ? null : Number($("beforeTreadmillWeight").value),
    beforeTreadmillNote: $("beforeTreadmillNote").value,
    afterTreadmillTime: $("afterTreadmillTime").value,
    afterTreadmillWeight: $("afterTreadmillWeight").value === "" ? null : Number($("afterTreadmillWeight").value),
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
    toast(finished ? "Aaj ka workout khatam" : "Mongo me save ho gaya");
  } catch (err) { toast(err.message); }
}

$("loginBtn").onclick = login;
$("setupBtn").onclick = register;
$("loginPass").addEventListener("keydown", function (e) { if (e.key === "Enter") login(); });
$("logoutBtn").onclick = function () {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  location.reload();
};
$("date").addEventListener("change", fillForm);
$("saveBtn").onclick = function () { save(false); };
$("finishBtn").onclick = function () { save(true); };
$("hist").addEventListener("click", async function (e) {
  const open = e.target.dataset.open;
  const del = e.target.dataset.del;
  if (open) { $("date").value = open; fillForm(); }
  if (del) {
    if (!confirm(del + " mitaye?")) return;
    try {
      const data = await api("/api/session/" + del, { method: "DELETE" });
      sessions = data.sessions || [];
      fillForm();
      paintHist();
    } catch (err) { toast(err.message); }
  }
});

(async function boot() {
  if (!token) return;
  try {
    await api("/api/me");
    await loadSessions();
    openApp();
  } catch (e) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    token = "";
    username = "";
  }
})();
