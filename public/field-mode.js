(function () {
  var KEY = "sidhi-lap-m";
  function lapM() {
    var n = Number(localStorage.getItem(KEY) || 250);
    return n > 0 ? n : 250;
  }
  var field = { laps: 0, runMs: 0, walkMs: 0, t0: 0, on: false, mode: "run" };
  function fmt(ms) {
    var s = Math.floor(ms / 1000);
    var m = Math.floor(s / 60);
    s = s % 60;
    return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
  }
  function totalMs() {
    var extra = field.on ? Date.now() - field.t0 : 0;
    return field.runMs + field.walkMs + extra;
  }
  function km() { return (field.laps * lapM()) / 1000; }
  function tick() {
    var box = document.getElementById("fieldLine");
    if (!box) return;
    var live = field.on ? Date.now() - field.t0 : 0;
    var run = field.runMs + (field.on && field.mode !== "walk" ? live : 0);
    var walk = field.walkMs + (field.on && field.mode === "walk" ? live : 0);
    box.textContent = field.laps + " lap • " + km().toFixed(2) + " km • " + fmt(totalMs());
    var rw = document.getElementById("fieldSplit");
    if (rw) rw.textContent = "run " + fmt(run) + " • walk " + fmt(walk);
  }
  function mountProfile() {
    var v = document.getElementById("view-profile");
    if (!v || v.classList.contains("hidden") || document.getElementById("pfLap")) return;
    var box = document.createElement("div");
    box.className = "glass card";
    box.id = "pfLap";
    box.innerHTML = "<h2>field lap</h2><label>1 lap = meters</label><input id=\"lapMeters\" inputmode=\"decimal\" value=\"" + lapM() + "\" /><button type=\"button\" class=\"btn full\" id=\"lapSave\" style=\"margin-top:10px\">save lap length</button>";
    v.appendChild(box);
    document.getElementById("lapSave").onclick = function () {
      var n = Number(document.getElementById("lapMeters").value);
      if (!(n > 0)) return;
      localStorage.setItem(KEY, String(n));
      if (typeof toast === "function") toast("1 lap = " + n + " m");
      tick();
    };
  }
  function mountRun() {
    var ov = document.getElementById("runOv");
    if (!ov || document.getElementById("fieldBox")) return;
    var box = document.createElement("div");
    box.className = "glass card";
    box.id = "fieldBox";
    box.style.marginTop = "12px";
    box.innerHTML =
      "<p class=\"badge\">FIELD MODE</p>" +
      "<div id=\"fieldLine\" style=\"font:800 22px Comfortaa,sans-serif;text-align:center;margin:8px 0\">0 lap • 0.00 km • 00:00</div>" +
      "<p class=\"sub\" id=\"fieldSplit\" style=\"text-align:center\">run 00:00 • walk 00:00</p>" +
      "<button type=\"button\" class=\"btn ok full\" id=\"fieldLap\" style=\"min-height:72px;font-size:20px;margin-top:8px\">+1 lap</button>" +
      "<div class=\"row\" style=\"margin-top:8px\"><button type=\"button\" class=\"btn ghost\" id=\"fieldWalk\">walk</button><button type=\"button\" class=\"btn ghost\" id=\"fieldRun\">run</button><button type=\"button\" class=\"btn full\" id=\"fieldSave\">save field</button></div>" +
      "<p class=\"sub\">GPS optional. Lap button is the count.</p>";
    ov.querySelector(".wrap").appendChild(box);
    document.getElementById("fieldLap").onclick = function () {
      if (!field.on) {
        field.on = true;
        field.t0 = Date.now();
      } else {
        var dt = Date.now() - field.t0;
        if (field.mode === "walk") field.walkMs += dt; else field.runMs += dt;
        field.t0 = Date.now();
      }
      field.laps += 1;
      tick();
    };
    document.getElementById("fieldWalk").onclick = function () { switchMode("walk"); };
    document.getElementById("fieldRun").onclick = function () { switchMode("run"); };
    document.getElementById("fieldSave").onclick = saveField;
  }
  function switchMode(next) {
    if (field.on) {
      var dt = Date.now() - field.t0;
      if (field.mode === "walk") field.walkMs += dt; else field.runMs += dt;
      field.t0 = Date.now();
    }
    field.mode = next;
    tick();
  }
  function saveField() {
    if (field.on) switchMode(field.mode);
    var line = "field " + field.laps + " lap × " + lapM() + " m";
    var note = document.getElementById("beforeTreadmillNote") || document.getElementById("after1HourNote");
    if (note) note.value = (note.value ? note.value + "\n" : "") + line;
    try {
      localStorage.setItem("sidhi-field-last", JSON.stringify({
        laps: field.laps, meters: lapM(), km: km(), runMs: field.runMs, walkMs: field.walkMs, line: line
      }));
    } catch (e) {}
    if (typeof toast === "function") toast(line);
    field.on = false;
    tick();
  }
  setInterval(function () { mountProfile(); mountRun(); if (field.on) tick(); }, 800);
})();
