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
    var live = field.on ? Date.now() - field.t0 : 0;
    var run = field.runMs + (field.on && field.mode !== "walk" ? live : 0);
    var walk = field.walkMs + (field.on && field.mode === "walk" ? live : 0);
    var line = field.laps + " lap • " + km().toFixed(2) + " km • " + fmt(totalMs());
    document.querySelectorAll("[data-field-line]").forEach(function (n) { n.textContent = line; });
    document.querySelectorAll("[data-field-split]").forEach(function (n) {
      n.textContent = "run " + fmt(run) + " • walk " + fmt(walk);
    });
  }
  function bump(dir) {
    if (dir > 0) {
      if (!field.on) { field.on = true; field.t0 = Date.now(); }
      else {
        var dt = Date.now() - field.t0;
        if (field.mode === "walk") field.walkMs += dt; else field.runMs += dt;
        field.t0 = Date.now();
      }
      field.laps += 1;
    } else if (field.laps > 0) {
      field.laps -= 1;
    }
    tick();
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
  function panel() {
    return "<p class=\"badge\">FIELD • all users</p>" +
      "<div data-field-line style=\"font:800 22px Comfortaa,sans-serif;text-align:center;margin:8px 0\">0 lap • 0.00 km • 00:00</div>" +
      "<p class=\"sub\" data-field-split style=\"text-align:center\">run 00:00 • walk 00:00</p>" +
      "<div class=\"row\"><button type=\"button\" class=\"btn ok\" data-plus style=\"flex:1;min-height:64px;font-size:18px\">+ lap</button>" +
      "<button type=\"button\" class=\"btn ghost\" data-minus style=\"flex:1;min-height:64px;font-size:18px\">- lap</button></div>" +
      "<div class=\"row\" style=\"margin-top:8px\"><button type=\"button\" class=\"btn ghost\" data-walk>walk</button><button type=\"button\" class=\"btn ghost\" data-run>run</button><button type=\"button\" class=\"btn full\" data-save>save field</button></div>";
  }
  function wire(root) {
    root.querySelector("[data-plus]").onclick = function () { bump(1); };
    root.querySelector("[data-minus]").onclick = function () { bump(-1); };
    root.querySelector("[data-walk]").onclick = function () { switchMode("walk"); };
    root.querySelector("[data-run]").onclick = function () { switchMode("run"); };
    root.querySelector("[data-save]").onclick = saveField;
  }
  function mount(parent, id) {
    if (!parent || document.getElementById(id)) return;
    var box = document.createElement("div");
    box.className = "glass card";
    box.id = id;
    box.innerHTML = panel();
    parent.appendChild(box);
    wire(box);
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
  setInterval(function () {
    mount(document.getElementById("view-home"), "fieldHome");
    var runView = document.getElementById("view-run") || document.getElementById("runZone");
    if (runView) mount(runView, "fieldRunView");
    var ov = document.getElementById("runOv");
    if (ov && ov.querySelector(".wrap")) mount(ov.querySelector(".wrap"), "fieldBox");
    mountProfile();
    if (field.on) tick();
  }, 800);
})();
