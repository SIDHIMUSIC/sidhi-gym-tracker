(function () {
  if (document.getElementById("plus-pack")) return;
  var st = document.createElement("style");
  st.id = "plus-pack";
  st.textContent = ".plus-card{margin-top:12px}.plus-row{display:flex;justify-content:space-between;align-items:center;padding:8px 0}.plus-row b{font-size:18px}.plus-btn{min-height:36px;padding:6px 12px;border-radius:999px;border:0;background:rgba(240,194,122,.15);color:#f0c27a;font:700 14px Comfortaa,sans-serif}";
  document.head.appendChild(st);

  var KEY = "sidhi-plus-" + (localStorage.getItem("sidhi-user") || "me");
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { return {}; } }
  function saveP(p) { localStorage.setItem(KEY, JSON.stringify(p)); }

  function today() { return typeof todayISO === "function" ? todayISO() : new Date().toISOString().slice(0,10); }
  function day() {
    var p = load();
    var d = today();
    if (!p[d]) p[d] = { water: 0, protein: 0 };
    return p;
  }
  function add(kind, n) {
    var p = day();
    p[today()][kind] = Math.max(0, (p[today()][kind] || 0) + n);
    saveP(p);
    paint();
  }

  function bmi() {
    var p = load();
    var h = Number(p.heightCm);
    var w = document.getElementById("homeKg");
    var kg = w ? parseFloat(w.textContent) : 0;
    if (!h || !kg) return "—";
    var m = h / 100;
    return (kg / (m * m)).toFixed(1);
  }
  function cal() {
    var row = typeof todayRow === "function" ? todayRow() : null;
    if (!row) return "—";
    var km = (Number(row.beforeTreadmillKm) || 0) + (Number(row.afterTreadmillKm) || 0);
    var mins = (Number(row.beforeTreadmillMins) || 0) + (Number(row.afterTreadmillMins) || 0);
    if (!km && !mins) return "—";
    return Math.round(km * 70 + mins * 8) + " kcal";
  }

  function paint() {
    var home = document.getElementById("view-home");
    if (!home) return;
    var box = document.getElementById("plusBox");
    if (!box) {
      box = document.createElement("div");
      box.id = "plusBox";
      box.className = "glass card plus-card";
      var week = document.getElementById("weekBox");
      if (week && week.parentNode) week.parentNode.insertBefore(box, week.nextSibling);
      else home.appendChild(box);
    }
    var p = day();
    var d = p[today()];
    var meta = load();
    box.innerHTML =
      '<h2>today extras</h2>' +
      '<div class="plus-row"><span>water</span><span><button class="plus-btn" data-k="water" data-n="-1">−</button> <b>' + d.water + '</b> glass <button class="plus-btn" data-k="water" data-n="1">+</button></span></div>' +
      '<div class="plus-row"><span>protein</span><span><button class="plus-btn" data-k="protein" data-n="-10">−</button> <b>' + d.protein + '</b> g <button class="plus-btn" data-k="protein" data-n="10">+</button></span></div>' +
      '<div class="plus-row"><span>BMI</span><b id="bmiVal">' + bmi() + '</b></div>' +
      '<div class="plus-row"><span>height cm</span><input id="htIn" inputmode="decimal" value="' + (meta.heightCm || "") + '" style="width:80px;text-align:right"></div>' +
      '<div class="plus-row"><span>est calories</span><b>' + cal() + '</b></div>' +
      '<div class="plus-row"><span>remind at</span><input id="remTime" type="time" value="' + (meta.remindAt || "17:00") + '" style="width:110px"></div>' +
      '<button class="btn ghost full" id="remindBtn" type="button" style="margin-top:8px">save reminder</button>';
    box.querySelectorAll(".plus-btn").forEach(function (b) {
      b.onclick = function () { add(b.dataset.k, Number(b.dataset.n)); };
    });
    var ht = document.getElementById("htIn");
    if (ht) ht.onchange = function () {
      var meta = load(); meta.heightCm = Number(ht.value) || 0; saveP(meta);
      document.getElementById("bmiVal").textContent = bmi();
    };
    function arm(timeStr) {
      if (!timeStr || !("Notification" in window)) return;
      var parts = timeStr.split(":");
      var h = Number(parts[0]), m = Number(parts[1]);
      var now = new Date();
      var next = new Date(); next.setHours(h, m, 0, 0);
      if (next <= now) next.setDate(next.getDate() + 1);
      clearTimeout(window._sidhiRem);
      window._sidhiRem = setTimeout(function () {
        new Notification("Sidhi Gym", { body: "Aaj gym jana hai!" });
        arm(timeStr);
      }, next - now);
    }
    var rt = document.getElementById("remTime");
    if (rt) rt.onchange = function () {
      var meta = load(); meta.remindAt = rt.value; saveP(meta);
    };
    var rb = document.getElementById("remindBtn");
    if (rb) rb.onclick = function () {
      if (!("Notification" in window)) return toast("Notifications not supported");
      Notification.requestPermission().then(function (ok) {
        if (ok !== "granted") return toast("Allow notifications");
        var meta = load();
        meta.remindAt = (document.getElementById("remTime") || {}).value || "17:00";
        saveP(meta);
        arm(meta.remindAt);
        toast("Reminder saved for " + meta.remindAt);
      });
    };
    var saved = load().remindAt;
    if (saved && Notification.permission === "granted") arm(saved);
  }

  function csvExport() {
    if (typeof sessions === "undefined" || !sessions.length) return toast("No data");
    var lines = ["date,workout,entryWeight,endWeight,km,mins"];
    sessions.forEach(function (s) {
      var km = (Number(s.beforeTreadmillKm) || 0) + (Number(s.afterTreadmillKm) || 0);
      var mins = (Number(s.beforeTreadmillMins) || 0) + (Number(s.afterTreadmillMins) || 0);
      lines.push([s.date, '"' + (s.workoutName || "") + '"', s.entryWeight || "", s.afterTreadmillWeight || "", km, mins].join(","));
    });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv" }));
    a.download = "sidhi-gym.csv";
    a.click();
    toast("CSV downloaded");
  }

  function hookCsv() {
    var bar = document.getElementById("backupBar");
    if (!bar || document.getElementById("csvBtn")) return;
    var b = document.createElement("button");
    b.className = "io-btn";
    b.id = "csvBtn";
    b.type = "button";
    b.innerHTML = '<div class="txt">Export CSV</div>';
    b.onclick = csvExport;
    bar.appendChild(b);
  }

  var DRAFT = "sidhi-offline-draft";
  function queueDraft(body) {
    var q = [];
    try { q = JSON.parse(localStorage.getItem(DRAFT) || "[]"); } catch (e) {}
    q.push(body);
    localStorage.setItem(DRAFT, JSON.stringify(q));
  }
  async function flushDraft() {
    if (!navigator.onLine || typeof api !== "function") return;
    var q = [];
    try { q = JSON.parse(localStorage.getItem(DRAFT) || "[]"); } catch (e) {}
    if (!q.length) return;
    var left = [];
    for (var i = 0; i < q.length; i++) {
      try { await api("/api/session", { method: "PUT", body: q[i] }); }
      catch (e) { left.push(q[i]); }
    }
    localStorage.setItem(DRAFT, JSON.stringify(left));
    if (!left.length && typeof toast === "function") toast("Offline logs synced");
  }
  if (typeof save === "function" && !save._plus) {
    var old = save;
    save = async function (finished) {
      try { await old(finished); }
      catch (e) {
        if (typeof formBody === "function") {
          queueDraft(formBody(finished));
          if (typeof toast === "function") toast("Saved offline");
        } else if (typeof toast === "function") toast(e.message);
      }
    };
    save._plus = true;
  }
  window.addEventListener("online", flushDraft);
  setTimeout(flushDraft, 1500);

  function boot() { paint(); hookCsv(); }
  setTimeout(boot, 900);
  setTimeout(boot, 2200);
  if (typeof paintHome === "function" && !paintHome._plus) {
    var ph = paintHome;
    paintHome = function () { ph(); setTimeout(paint, 50); };
    paintHome._plus = true;
  }
})();
