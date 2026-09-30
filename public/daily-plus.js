(function () {
  var TG = "https://t.me/SANATANI_BACCHA";
  function uid(name) {
    var s = String(name || "").toLowerCase();
    var n = 2166136261;
    for (var i = 0; i < s.length; i++) n = Math.imul(n ^ s.charCodeAt(i), 16777619);
    return "S" + (n >>> 0).toString(16).toUpperCase().padStart(8, "0").slice(0, 8);
  }
  function dateKey() {
    var d = document.getElementById("date");
    return (d && d.value) || (typeof todayISO === "function" ? todayISO() : new Date().toISOString().slice(0, 10));
  }
  function storeKey() { return "sidhi-daily-" + dateKey(); }
  function readLog() {
    try { return JSON.parse(localStorage.getItem(storeKey()) || "{}"); } catch (e) { return {}; }
  }
  function writeLog() {
    var w = document.getElementById("waterL");
    var p = document.getElementById("proteinG");
    var obj = { water: w ? w.value : "", protein: p ? p.value : "" };
    localStorage.setItem(storeKey(), JSON.stringify(obj));
    var note = document.getElementById("after1HourNote");
    if (note) {
      var clean = String(note.value || "").replace(/^\[log\].*\n?/, "");
      var line = "";
      if (obj.water || obj.protein) line = "[log] water " + (obj.water || "-") + " L · protein " + (obj.protein || "-") + " g\n";
      note.value = line + clean;
    }
  }
  function mountLog() {
    if (document.getElementById("waterL")) return;
    var entry = document.getElementById("entryWeight");
    if (!entry) return;
    var card = entry.closest(".glass") || entry.parentNode;
    var box = document.createElement("div");
    box.className = "grid";
    box.style.marginTop = "10px";
    box.innerHTML =
      '<div><label>water (L)</label><input id="waterL" inputmode="decimal" placeholder="3" /></div>' +
      '<div><label>protein (g)</label><input id="proteinG" inputmode="decimal" placeholder="140" /></div>';
    card.appendChild(box);
    var saved = readLog();
    if (saved.water) document.getElementById("waterL").value = saved.water;
    if (saved.protein) document.getElementById("proteinG").value = saved.protein;
    ["waterL", "proteinG"].forEach(function (id) {
      document.getElementById(id).addEventListener("change", writeLog);
    });
  }
  function parseNoteLog() {
    var note = document.getElementById("after1HourNote");
    if (!note) return;
    var m = String(note.value || "").match(/^\[log\]\s*water\s+([^\s]+)\s+L\s+·\s+protein\s+([^\s]+)\s+g/);
    if (!m) return;
    var w = document.getElementById("waterL");
    var p = document.getElementById("proteinG");
    if (w && !w.value && m[1] !== "-") w.value = m[1];
    if (p && !p.value && m[2] !== "-") p.value = m[2];
  }
  function openAdmin() {
    var user = ((document.getElementById("loginUser") || {}).value || "").trim().toLowerCase();
    var id = user ? uid(user) : "(username box me likho)";
    var text = "SIDHI GYM password reset%0Ausername: " + (user || "?") + "%0Auser id: " + id + "%0APlease set a new password.";
    window.open(TG + "?text=" + text, "_blank");
  }
  function sheet() {
    if (document.getElementById("forgotSheet")) return;
    var m = document.createElement("div");
    m.id = "forgotSheet";
    m.style.cssText = "position:fixed;inset:0;z-index:90;background:rgba(2,6,14,.72);display:grid;place-items:end center;padding:16px";
    m.innerHTML =
      '<div style="width:min(420px,100%);background:#121a2b;border-radius:24px;padding:18px;border:1px solid rgba(56,189,248,.25)">' +
      "<p class=\"badge\">forgot password</p>" +
      "<p class=\"sub\">Admin ko Telegram pe username + user id chala jayega.</p>" +
      '<button type="button" class="btn full" id="fgAdmin" style="margin-top:12px">message admin</button>' +
      '<button type="button" class="btn ghost full" id="fgNo" style="margin-top:8px">cancel</button></div>';
    document.body.appendChild(m);
    document.getElementById("fgAdmin").onclick = function () { m.remove(); openAdmin(); };
    document.getElementById("fgNo").onclick = function () { m.remove(); };
    m.addEventListener("click", function (e) { if (e.target === m) m.remove(); });
  }
  function bindForgot(el) {
    if (!el || el._fg) return;
    el._fg = true;
    el.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      sheet();
    }, true);
  }
  function hookForgot() {
    var extra = document.getElementById("forgotTg");
    if (extra) extra.remove();
    ["forgotBtn", "forgotPass", "fgBtn", "forgot"].forEach(function (id) {
      bindForgot(document.getElementById(id));
    });
    var nodes = document.querySelectorAll("a,button,span,div,p,label");
    for (var i = 0; i < nodes.length; i++) {
      var t = (nodes[i].textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
      if (t === "forgot password" || t.indexOf("forgot password") === 0) bindForgot(nodes[i]);
    }
  }
  if (typeof formBody === "function" && !formBody._log) {
    var _fb = formBody;
    formBody = function (finished) { writeLog(); return _fb(finished); };
    formBody._log = true;
  }
  if (typeof fillForm === "function" && !fillForm._log) {
    var _ff = fillForm;
    fillForm = function () {
      _ff();
      mountLog();
      parseNoteLog();
      var saved = readLog();
      var w = document.getElementById("waterL");
      var p = document.getElementById("proteinG");
      if (w && saved.water) w.value = saved.water;
      if (p && saved.protein) p.value = saved.protein;
    };
    fillForm._log = true;
  }
  setInterval(function () { mountLog(); hookForgot(); }, 800);
  mountLog();
  hookForgot();
})();
