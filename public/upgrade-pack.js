(function () {
  function el(id) { return document.getElementById(id); }
  var CATALOG = {
    Chest: ["Bench Press", "Incline Press", "Chest Fly", "Push Up", "Cable Crossover", "Dumbbell Press"],
    Triceps: ["Tricep Pushdown", "Skull Crusher", "Overhead Extension", "Close Grip Bench", "Dips"],
    Back: ["Lat Pulldown", "Seated Row", "Barbell Row", "Deadlift", "Pull Up", "Face Pull"],
    Biceps: ["Barbell Curl", "Hammer Curl", "Preacher Curl", "Incline Curl"],
    Shoulders: ["OHP", "Lateral Raise", "Front Raise", "Rear Delt Fly", "Arnold Press"],
    Legs: ["Squat", "Leg Press", "RDL", "Lunges", "Leg Curl", "Leg Extension", "Calf Raise"],
    Abs: ["Cable Crunch", "Leg Raise", "Plank", "Reverse Crunch", "Hanging Leg Raise", "Bicycle Crunch", "Side Plank"]
  };
  function groupsFor(name) {
    var s = String(name || "").toLowerCase();
    var g = [];
    if (s.indexOf("chest") >= 0) g.push("Chest");
    if (s.indexOf("tricep") >= 0) g.push("Triceps");
    if (s.indexOf("back") >= 0) g.push("Back");
    if (s.indexOf("bicep") >= 0) g.push("Biceps");
    if (s.indexOf("shoulder") >= 0) g.push("Shoulders");
    if (s.indexOf("leg") >= 0) g.push("Legs");
    if (s.indexOf("abs") >= 0 || s.indexOf("core") >= 0) g.push("Abs");
    if (!g.length) g = ["Chest", "Back", "Shoulders", "Legs", "Abs"];
    return g;
  }

  if (!document.getElementById("upg-css")) {
    var st = document.createElement("style");
    st.id = "upg-css";
    st.textContent =
      ".ex-chip{display:inline-flex;align-items:center;gap:6px;margin:0 6px 8px 0;padding:8px 12px;border-radius:999px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.05);color:#f6f1e8;font-size:12px}" +
      ".ex-chip.on{background:linear-gradient(135deg,#ff9a9e44,#f0c27a55);border-color:#f0c27a}" +
      "#cardioBox select{min-height:48px}" +
      ".sticky-save{position:sticky;bottom:86px;z-index:8}" +
      ".heat0{opacity:.25}.heat1{background:#1e3d32}.heat2{background:#1e8a55}.heat3{background:#63e2b3;color:#04140d}";
    document.head.appendChild(st);
  }

  function hideInclineBlock() {
    var cards = document.querySelectorAll("#view-workout .glass h2");
    cards.forEach(function (h) {
      if (/incline/i.test(h.textContent) && h.closest(".glass")) h.closest(".glass").style.display = "none";
    });
  }
  function mergeCardio() {
    var box = el("beforeTreadmillNote");
    if (!box || el("cardioType")) return;
    var card = box.closest(".glass");
    if (!card) return;
    var h = card.querySelector("h2");
    if (h) h.innerHTML = '<span class="step">3</span> cardio';
    var lab = document.createElement("label");
    lab.textContent = "type";
    var sel = document.createElement("select");
    sel.id = "cardioType";
    ["walk", "run", "cycle", "eliptical", "stair"].forEach(function (t) {
      var o = document.createElement("option"); o.value = t; o.textContent = t; sel.appendChild(o);
    });
    card.insertBefore(sel, card.querySelector(".grid"));
    card.insertBefore(lab, sel);
  }

  function selectedLifts() {
    return Array.prototype.map.call(document.querySelectorAll(".ex-chip.on"), function (c) {
      return { name: c.dataset.name, group: c.dataset.group, done: true };
    });
  }
  function paintLifts() {
    var ta = el("after1HourNote");
    if (!ta) return;
    var host = el("liftBox");
    if (!host) {
      host = document.createElement("div");
      host.id = "liftBox";
      ta.parentNode.insertBefore(host, ta);
    }
    ta.style.display = "none";
    var row = typeof currentRow === "function" ? currentRow() : {};
    var split = (el("splitLine") && el("splitLine").textContent) || (row && row.workoutName) || "";
    var saved = {};
    ((row && row.lifts) || []).forEach(function (x) { saved[x.name] = true; });
    if (!Object.keys(saved).length && row && row.after1HourNote) {
      String(row.after1HourNote).split(/[,\n]/).forEach(function (p) {
        var n = p.trim(); if (n) saved[n] = true;
      });
    }
    var html = "";
    groupsFor(split).forEach(function (g) {
      html += "<p class=\"sub\" style=\"margin:10px 0 6px\">" + g + "</p>";
      (CATALOG[g] || []).forEach(function (n) {
        html += '<button type="button" class="ex-chip' + (saved[n] ? " on" : "") + '" data-name="' + n + '" data-group="' + g + '">' + n + "</button>";
      });
    });
    html += '<div class="row" style="margin-top:8px"><input id="customEx" placeholder="custom exercise" style="flex:1" /><button class="btn ghost" id="addEx" type="button" style="min-height:44px">add</button></div>';
    host.innerHTML = html;
    host.querySelectorAll(".ex-chip").forEach(function (b) {
      b.onclick = function () { b.classList.toggle("on"); syncNote(); };
    });
    var add = el("addEx");
    if (add) add.onclick = function () {
      var v = (el("customEx").value || "").trim();
      if (!v) return;
      var b = document.createElement("button");
      b.type = "button"; b.className = "ex-chip on"; b.dataset.name = v; b.dataset.group = "Custom";
      b.textContent = v;
      b.onclick = function () { b.classList.toggle("on"); syncNote(); };
      host.insertBefore(b, host.lastChild);
      el("customEx").value = "";
      syncNote();
    };
    syncNote();
  }
  function syncNote() {
    var ta = el("after1HourNote");
    if (ta) ta.value = selectedLifts().map(function (x) { return x.name; }).join(", ");
  }

  if (typeof formBody === "function" && !formBody._upg) {
    var _fb = formBody;
    formBody = function (finished) {
      var body = _fb(finished);
      body.lifts = selectedLifts();
      if (el("cardioType")) body.cardioType = el("cardioType").value;
      if (el("cardioType")) body.beforeTreadmillType = el("cardioType").value;
      return body;
    };
    formBody._upg = true;
  }
  if (typeof fillForm === "function" && !fillForm._upg) {
    var _ff = fillForm;
    fillForm = function () {
      _ff();
      hideInclineBlock();
      mergeCardio();
      var row = typeof currentRow === "function" ? currentRow() : {};
      if (el("cardioType")) el("cardioType").value = (row && (row.cardioType || row.beforeTreadmillType)) || "walk";
      paintLifts();
    };
    fillForm._upg = true;
  }

  function movingAvg(pts) {
    return pts.map(function (p, i) {
      var slice = pts.slice(Math.max(0, i - 6), i + 1);
      var sum = slice.reduce(function (a, x) { return a + x.y; }, 0);
      return { x: p.x, y: sum / slice.length };
    });
  }
  if (typeof drawChart === "function" && !drawChart._ma) {
    var _dc = drawChart;
    drawChart = function (canvas, rows) {
      _dc(canvas, rows);
      if (!canvas) return;
      var ctx = canvas.getContext("2d");
      var w = canvas.width, h = canvas.height;
      var pts = (rows || []).filter(function (s) { return Number(s.entryWeight) > 0; }).slice().sort(function (a, b) { return String(a.date).localeCompare(String(b.date)); }).slice(-21);
      if (pts.length < 2) return;
      var ys = pts.map(function (p) { return Number(p.entryWeight); });
      var min = Math.min.apply(null, ys) - 0.4;
      var max = Math.max.apply(null, ys) + 0.4;
      var mapped = pts.map(function (p, i) {
        return {
          x: 24 + i * ((w - 50) / Math.max(pts.length - 1, 1)),
          y: h - 20 - ((Number(p.entryWeight) - min) / (max - min || 1)) * (h - 40)
        };
      });
      var ma = movingAvg(mapped);
      ctx.beginPath();
      ma.forEach(function (p, i) { if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); });
      ctx.setLineDash([6, 5]);
      ctx.strokeStyle = "#7ab8ff"; ctx.lineWidth = 2; ctx.stroke();
      ctx.setLineDash([]);
      if (typeof goalWeight !== "undefined" && goalWeight) {
        var gy = h - 20 - ((Number(goalWeight) - min) / (max - min || 1)) * (h - 40);
        ctx.beginPath(); ctx.moveTo(20, gy); ctx.lineTo(w - 16, gy);
        ctx.strokeStyle = "#63e2b3"; ctx.setLineDash([2, 4]); ctx.stroke(); ctx.setLineDash([]);
      }
    };
    drawChart._ma = true;
  }

  function bestStreak() {
    var map = {};
    ((typeof sessions !== "undefined" && sessions) || []).forEach(function (s) { if (s.finished) map[s.date] = 1; });
    var dates = Object.keys(map).sort();
    var best = 0, cur = 0, prev = null;
    dates.forEach(function (d) {
      if (prev) {
        var a = new Date(prev + "T12:00:00");
        var b = new Date(d + "T12:00:00");
        var gap = (b - a) / 86400000;
        cur = gap === 1 || (gap === 2 && new Date(prev + "T12:00:00").getDay() === 6) ? cur + 1 : 1;
      } else cur = 1;
      if (cur > best) best = cur;
      prev = d;
    });
    return best;
  }
  if (typeof paintHome === "function" && !paintHome._upg) {
    var _ph = paintHome;
    paintHome = function () {
      _ph();
      var st = el("stStreak");
      if (st && st.parentNode && !el("bestStreak")) {
        var extra = document.createElement("div");
        extra.className = "glass stat";
        extra.innerHTML = "<b id=\"bestStreak\">0</b><span>best streak</span>";
        st.parentNode.parentNode.appendChild(extra);
      }
      if (el("bestStreak")) el("bestStreak").textContent = String(bestStreak());
    };
    paintHome._upg = true;
  }

  function download(name, text, type) {
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: type }));
    a.download = name;
    a.click();
  }
  async function exportJson() {
    try {
      var data = typeof api === "function" ? await api("/api/export") : { sessions: sessions };
      download("sidhi-gym.json", JSON.stringify(data, null, 2), "application/json");
    } catch (e) { if (typeof toast === "function") toast(e.message); }
  }
  function exportCsv() {
    var rows = [["date", "day", "workout", "startKg", "endKg", "entry", "exit", "exercises"]];
    ((typeof sessions !== "undefined" && sessions) || []).forEach(function (s) {
      rows.push([s.date, s.day || "", s.workoutName || "", s.entryWeight || "", s.afterTreadmillWeight || "", s.entryTime || "", s.afterTreadmillTime || "", (s.after1HourNote || "").replace(/\n/g, " ")]);
    });
    download("sidhi-gym.csv", rows.map(function (r) { return r.join(","); }).join("\n"), "text/csv");
  }

  var hist = el("view-history");
  if (hist && !el("exportBar")) {
    var bar = document.createElement("div");
    bar.id = "exportBar";
    bar.className = "row";
    bar.style.margin = "0 0 12px";
    bar.innerHTML = '<button class="btn ghost" id="exJson" type="button">JSON export</button><button class="btn ghost" id="exCsv" type="button">CSV export</button>';
    hist.insertBefore(bar, hist.firstChild);
    el("exJson").onclick = exportJson;
    el("exCsv").onclick = exportCsv;
  }

  window.__sidhiDeleteAccount = async function () {
    if (!confirm("Delete account + all workouts?")) return;
    try {
      await api("/api/me", { method: "DELETE" });
      if (el("logoutBtn")) el("logoutBtn").click();
    } catch (e) { if (typeof toast === "function") toast(e.message); }
  };

  if (typeof showProfile === "function" && !showProfile._upg) {
    var _sp = showProfile;
    showProfile = function () {
      _sp();
      setTimeout(function () {
        var v = el("view-profile");
        if (!v || el("pfAge")) return;
        var card = document.createElement("div");
        card.className = "glass card";
        card.innerHTML =
          "<h2>body + goal</h2>" +
          '<label>age</label><input id="pfAge" inputmode="numeric" />' +
          '<label>height (cm)</label><input id="pfHt" inputmode="decimal" />' +
          '<label>current weight</label><input id="pfCw" inputmode="decimal" />' +
          '<label>fitness goal</label><select id="pfFg"><option value="">select</option><option>fat loss</option><option>muscle</option><option>recomp</option><option>endurance</option></select>' +
          '<label>training level</label><select id="pfLv"><option value="">select</option><option>beginner</option><option>intermediate</option><option>advanced</option></select>' +
          '<button class="btn ok full" id="pfBodySave" type="button" style="margin-top:12px">save body</button>' +
          '<button class="btn danger full" id="pfDelAcc" type="button" style="margin-top:8px">delete account</button>';
        v.appendChild(card);
        if (window.__sidhiMe) {
          var m = window.__sidhiMe;
          if (el("pfAge") && m.age) el("pfAge").value = m.age;
          if (el("pfHt") && m.heightCm) el("pfHt").value = m.heightCm;
          if (el("pfCw") && m.currentWeight) el("pfCw").value = m.currentWeight;
          if (el("pfFg") && m.fitnessGoal) el("pfFg").value = m.fitnessGoal;
          if (el("pfLv") && m.trainingLevel) el("pfLv").value = m.trainingLevel;
        }
        el("pfBodySave").onclick = async function () {
          try {
            window.__sidhiMe = await api("/api/me", {
              method: "PATCH",
              body: {
                age: el("pfAge").value,
                heightCm: el("pfHt").value,
                currentWeight: el("pfCw").value,
                fitnessGoal: el("pfFg").value,
                trainingLevel: el("pfLv").value
              }
            });
            if (typeof toast === "function") toast("Profile saved");
          } catch (e) { if (typeof toast === "function") toast(e.message); }
        };
        el("pfDelAcc").onclick = window.__sidhiDeleteAccount;
      }, 0);
    };
    showProfile._upg = true;
  }

  if (typeof afterAuth === "function" && !afterAuth._upg) {
    var _aa = afterAuth;
    afterAuth = async function () {
      await _aa();
      try { window.__sidhiMe = await api("/api/me"); } catch (e) {}
    };
    afterAuth._upg = true;
  }

  hideInclineBlock();
  mergeCardio();
  if (el("view-workout") && !el("view-workout").classList.contains("hidden")) paintLifts();
})();
