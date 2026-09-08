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

function paintResult(row) {
  const box = $("resultText");
  const sub = $("resultSub");
  const tm = $("tmResult");
  if (tm) tm.textContent = "";
  if (!row || row.entryWeight == null || row.entryWeight === "") {
    box.className = "today-box";
    box.textContent = "Pehle aaj ka weight daalo";
    sub.textContent = "Kal ke weight se compare yahin aayega.";
  } else {
    const w = Number(row.entryWeight);
    if (row.prevWeight == null) {
      box.className = "today-box";
      box.textContent = "Aaj " + w + " kg";
      sub.textContent = "Pehla record. Kal se ghata/badha dikhega.";
    } else {
      const abs = Math.abs(Number(row.diff) || 0);
      if (row.trend === "down") {
        box.className = "today-box delta down";
        box.textContent = "Aaj " + w + " kg  •  " + abs + " kg ghata";
        sub.textContent = "Kal " + row.prevWeight + " kg tha. " + (row.finished ? "Workout khatam." : "Workout chal raha hai.");
      } else if (row.trend === "up") {
        box.className = "today-box delta up";
        box.textContent = "Aaj " + w + " kg  •  " + abs + " kg badha";
        sub.textContent = "Kal " + row.prevWeight + " kg tha. " + (row.finished ? "Workout khatam." : "Workout chal raha hai.");
      } else {
        box.className = "today-box delta same";
        box.textContent = "Aaj " + w + " kg  •  same";
        sub.textContent = "Kal jaisa hi weight.";
      }
    }
  }
  const before = Number(row && row.beforeTreadmillWeight);
  const after = Number(row && row.afterTreadmillWeight);
  if (tm && Number.isFinite(before) && Number.isFinite(after)) {
    const d = Math.round((after - before) * 10) / 10;
    const abs = Math.abs(d);
    tm.textContent = d < 0
      ? "Treadmill: " + before + " → " + after + " kg  •  " + abs + " kg ghata"
      : d > 0
        ? "Treadmill: " + before + " → " + after + " kg  •  " + abs + " kg badha"
        : "Treadmill: " + before + " → " + after + " kg  •  same";
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
    let delta = "-";
    if (s.trend === "down") delta = s.diff + " kg ghata";
    if (s.trend === "up") delta = "+" + s.diff + " kg badha";
    if (s.trend === "same" && s.prevWeight != null) delta = "same";
    return "<tr><td>" + s.date + "<div class=\"sub\" style=\"margin:0\">" + (DAYS_HI[s.day] || "") + " / " + (s.day || "") + "</div></td><td>" +
      (s.workoutName || "") + (s.finished ? "<div class=\"sub\" style=\"margin:0\">khatam</div>" : "") +
      "</td><td>" + (s.entryWeight != null ? s.entryWeight + " kg" : "-") +
      (s.beforeTreadmillWeight != null || s.afterTreadmillWeight != null
        ? "<div class=\"sub\" style=\"margin:0\">TM " + (s.beforeTreadmillWeight != null ? s.beforeTreadmillWeight : "-") + " → " + (s.afterTreadmillWeight != null ? s.afterTreadmillWeight : "-") + "</div>"
        : "") +
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
