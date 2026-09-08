const KEY_AUTH = "sidhi-gym-auth-v1";
const KEY_DATA = "sidhi-gym-data-v1";
const KEY_SESS = "sidhi-gym-sess-v1";

const STEPS = [
  { id: "bhajan", title: "1. Bhajan + jaati walk", hint: "Gym aate hi bhajan/jaati ke saath walk." },
  { id: "workout", title: "2. Workout / weights", hint: "Sets, reps aur kitna weight uthaya." },
  { id: "ulta", title: "3. Ulta / cooldown", hint: "Workout ke baad ulta / stretch / rest." },
  { id: "circuit", title: "4. Beech ka circuit", hint: "Beech me jo extra barkat / circuit karte ho." },
  { id: "midwalk", title: "5. Aadhe ghante baad walk", hint: "30 min baad doosri walk." },
  { id: "preTM", title: "6. Treadmill se pehle", hint: "TM start se pehle kya feel / notes." },
  { id: "tm", title: "7. Treadmill", hint: "Time, speed, distance." },
  { id: "after", title: "8. TM ke baad log", hint: "Body weight aur final notes yahin daalo." }
];

const $ = (id) => document.getElementById(id);
let step = 0;
let draft = emptyDraft();

function emptyDraft() {
  return {
    id: crypto.randomUUID(),
    date: new Date().toISOString().slice(0, 10),
    partner: "",
    bhajanMin: "", bhajanNote: "",
    lifts: [{ name: "", sets: "", reps: "", kg: "" }],
    ultaNote: "",
    circuitNote: "",
    midwalkMin: "", midwalkNote: "",
    preTM: "",
    tmMin: "", tmSpeed: "", tmKm: "",
    bodyKg: "", afterNote: ""
  };
}

async function sha(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.style.display = "block";
  setTimeout(() => { t.style.display = "none"; }, 2200);
}

function loadData() {
  try { return JSON.parse(localStorage.getItem(KEY_DATA) || "[]"); }
  catch (e) { return []; }
}
function saveData(arr) {
  localStorage.setItem(KEY_DATA, JSON.stringify(arr));
}

function renderGate() {
  const has = !!localStorage.getItem(KEY_AUTH);
  $("gateHint").textContent = has
    ? "Apna ID aur password daalo."
    : "Pehli baar: naya ID aur password set karo. Public user list nahi banegi.";
}

async function setupAuth() {
  const u = $("loginUser").value.trim();
  const p = $("loginPass").value;
  if (!u || p.length < 4) return toast("ID aur 4+ letter password chahiye");
  const hash = await sha(u + ":" + p);
  localStorage.setItem(KEY_AUTH, JSON.stringify({ user: u, hash: hash }));
  sessionStorage.setItem(KEY_SESS, "1");
  openApp();
  toast("Lock set ho gaya");
}

async function login() {
  const raw = localStorage.getItem(KEY_AUTH);
  if (!raw) return setupAuth();
  const auth = JSON.parse(raw);
  const u = $("loginUser").value.trim();
  const p = $("loginPass").value;
  const hash = await sha(u + ":" + p);
  if (hash !== auth.hash) return toast("Galat ID / password");
  sessionStorage.setItem(KEY_SESS, "1");
  openApp();
}

function openApp() {
  $("gate").classList.add("hidden");
  $("app").classList.remove("hidden");
  const auth = JSON.parse(localStorage.getItem(KEY_AUTH) || "{}");
  $("hello").textContent = "Namaste " + (auth.user || "Sidhi") + " — aaj ka gym yahin likho.";
  $("date").value = draft.date;
  drawSteps();
  drawStep();
  refreshDash();
}

function drawSteps() {
  $("steps").innerHTML = STEPS.map(function (s, i) {
    return '<button class="chip ' + (i === step ? "on" : "") + '" data-i="' + i + '">' + s.title + "</button>";
  }).join("");
}

function liftRows() {
  return draft.lifts.map(function (l, i) {
    return '<div class="row" style="margin-bottom:8px">' +
      '<div><label>Exercise</label><input data-k="name" data-i="' + i + '" value="' + esc(l.name) + '" placeholder="Bench / Squat" /></div>' +
      '<div><label>Sets</label><input data-k="sets" data-i="' + i + '" value="' + esc(l.sets) + '" /></div>' +
      '<div><label>Reps</label><input data-k="reps" data-i="' + i + '" value="' + esc(l.reps) + '" /></div>' +
      '<div><label>Kg</label><input data-k="kg" data-i="' + i + '" value="' + esc(l.kg) + '" /></div>' +
      "</div>";
  }).join("") + '<button class="btn ghost" id="addLift">+ exercise</button>';
}

function drawStep() {
  const s = STEPS[step];
  const map = {
    bhajan: '<label>Walk minutes</label><input id="f_bhajanMin" value="' + esc(draft.bhajanMin) + '" /><label>Note</label><textarea id="f_bhajanNote">' + esc(draft.bhajanNote) + "</textarea>",
    workout: liftRows(),
    ulta: '<label>Ulta / cooldown note</label><textarea id="f_ultaNote">' + esc(draft.ultaNote) + "</textarea>",
    circuit: '<label>Beech ka circuit / barkat</label><textarea id="f_circuitNote">' + esc(draft.circuitNote) + "</textarea>",
    midwalk: '<label>Doosri walk minutes</label><input id="f_midwalkMin" value="' + esc(draft.midwalkMin) + '" /><label>Note</label><textarea id="f_midwalkNote">' + esc(draft.midwalkNote) + "</textarea>",
    preTM: '<label>Treadmill se pehle</label><textarea id="f_preTM">' + esc(draft.preTM) + "</textarea>",
    tm: '<div class="grid"><div><label>Minutes</label><input id="f_tmMin" value="' + esc(draft.tmMin) + '" /></div><div><label>Speed</label><input id="f_tmSpeed" value="' + esc(draft.tmSpeed) + '" /></div></div><label>Distance (km)</label><input id="f_tmKm" value="' + esc(draft.tmKm) + '" />',
    after: '<label>Body weight (kg)</label><input id="f_bodyKg" value="' + esc(draft.bodyKg) + '" placeholder="jaise 72.4" /><label>TM ke baad note</label><textarea id="f_afterNote">' + esc(draft.afterNote) + "</textarea>"
  };
  $("stepBox").innerHTML = '<h3 style="margin:8px 0 4px">' + s.title + '</h3><p class="muted">' + s.hint + "</p>" + map[s.id];
}

function collect() {
  draft.date = $("date").value || draft.date;
  draft.partner = $("partner").value;
  function grab(id, key) { const el = $(id); if (el) draft[key] = el.value; }
  grab("f_bhajanMin", "bhajanMin"); grab("f_bhajanNote", "bhajanNote");
  grab("f_ultaNote", "ultaNote"); grab("f_circuitNote", "circuitNote");
  grab("f_midwalkMin", "midwalkMin"); grab("f_midwalkNote", "midwalkNote");
  grab("f_preTM", "preTM"); grab("f_tmMin", "tmMin"); grab("f_tmSpeed", "tmSpeed");
  grab("f_tmKm", "tmKm"); grab("f_bodyKg", "bodyKg"); grab("f_afterNote", "afterNote");
  $("stepBox").querySelectorAll("[data-k]").forEach(function (el) {
    const i = +el.dataset.i;
    draft.lifts[i][el.dataset.k] = el.value;
  });
}

function saveSession() {
  collect();
  const all = loadData().filter(function (x) { return x.date !== draft.date; });
  all.push(Object.assign({}, draft, { savedAt: Date.now() }));
  all.sort(function (a, b) { return b.date.localeCompare(a.date); });
  saveData(all);
  toast("Session save ho gaya");
  refreshDash();
}

function refreshDash() {
  const all = loadData();
  $("sCount").textContent = all.length;
  const last = all[0];
  $("sWeight").textContent = last && last.bodyKg ? last.bodyKg + " kg" : "-";
  $("sDate").textContent = last ? last.date : "-";
  $("hist").innerHTML = all.map(function (s) {
    return "<tr><td>" + s.date + (s.partner ? '<div class="muted">' + esc(s.partner) + "</div>" : "") +
      "</td><td>" + (s.bodyKg || "-") + "</td><td>" + (s.bhajanMin || "-") + " / " + (s.midwalkMin || "-") +
      "</td><td>" + (s.tmMin || "-") + ' min</td><td><button class="btn ghost" data-open="' + s.id +
      '">Open</button> <button class="btn danger" data-del="' + s.id + '">X</button></td></tr>';
  }).join("") || '<tr><td colspan="5" class="muted">Abhi koi session nahi</td></tr>';
  drawChart(all);
}

function drawChart(all) {
  const c = $("chart");
  const ctx = c.getContext("2d");
  const w = c.width = c.clientWidth * 2;
  const h = c.height = 320;
  ctx.clearRect(0, 0, w, h);
  const pts = all.slice().reverse().filter(function (x) { return Number(x.bodyKg); });
  if (pts.length < 2) {
    ctx.fillStyle = "#9aa8b6";
    ctx.font = "28px Hind";
    ctx.fillText("2+ body-weight entries ke baad graph dikhega", 24, h / 2);
    return;
  }
  const ys = pts.map(function (p) { return Number(p.bodyKg); });
  const min = Math.min.apply(null, ys) - 1;
  const max = Math.max.apply(null, ys) + 1;
  ctx.strokeStyle = "#e8b86d";
  ctx.lineWidth = 4;
  ctx.beginPath();
  pts.forEach(function (p, i) {
    const x = 30 + i * ((w - 60) / (pts.length - 1));
    const y = h - 30 - ((Number(p.bodyKg) - min) / (max - min)) * (h - 60);
    if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
  });
  ctx.stroke();
}

function esc(v) {
  return String(v == null ? "" : v)
    .replace(/&/g, String.fromCharCode(38) + "amp;")
    .replace(/</g, String.fromCharCode(38) + "lt;")
    .replace(/>/g, String.fromCharCode(38) + "gt;")
    .replace(/"/g, String.fromCharCode(38) + "quot;");
}

$("setupBtn").onclick = setupAuth;
$("loginBtn").onclick = login;
$("loginPass").addEventListener("keydown", function (e) { if (e.key === "Enter") login(); });
$("logoutBtn").onclick = function () { sessionStorage.removeItem(KEY_SESS); location.reload(); };
$("steps").addEventListener("click", function (e) {
  const i = e.target.dataset.i;
  if (i == null) return;
  collect();
  step = +i;
  drawSteps();
  drawStep();
});
$("stepBox").addEventListener("click", function (e) {
  if (e.target.id === "addLift") {
    collect();
    draft.lifts.push({ name: "", sets: "", reps: "", kg: "" });
    drawStep();
  }
});
$("saveBtn").onclick = saveSession;
$("resetBtn").onclick = function () {
  draft = emptyDraft();
  $("date").value = draft.date;
  $("partner").value = "";
  drawStep();
  toast("Form clear");
};
$("hist").addEventListener("click", function (e) {
  const open = e.target.dataset.open;
  const del = e.target.dataset.del;
  if (open) {
    const found = loadData().find(function (x) { return x.id === open; });
    if (!found) return;
    draft = Object.assign(emptyDraft(), found, { lifts: found.lifts && found.lifts.length ? found.lifts : emptyDraft().lifts });
    $("date").value = draft.date;
    $("partner").value = draft.partner || "";
    step = 0;
    drawSteps();
    drawStep();
    toast("Session khol diya");
  }
  if (del) {
    saveData(loadData().filter(function (x) { return x.id !== del; }));
    refreshDash();
  }
});
$("exportBtn").onclick = function () {
  const blob = new Blob([JSON.stringify({ sessions: loadData() }, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "sidhi-gym-backup.json";
  a.click();
};
$("importBtn").onclick = function () { $("file").click(); };
$("file").onchange = async function (e) {
  const f = e.target.files[0];
  if (!f) return;
  try {
    const json = JSON.parse(await f.text());
    const sessions = json.sessions || json;
    if (!Array.isArray(sessions)) throw new Error("bad");
    saveData(sessions);
    refreshDash();
    toast("Import ho gaya");
  } catch (err) { toast("JSON theek nahi hai"); }
};
$("wipeBtn").onclick = function () {
  if (confirm("Saara gym data mit jayega?")) { saveData([]); refreshDash(); }
};

renderGate();
if (sessionStorage.getItem(KEY_SESS) && localStorage.getItem(KEY_AUTH)) openApp();
