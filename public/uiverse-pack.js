(function () {
  if (document.getElementById("uv-pack")) return;
  var st = document.createElement("style");
  st.id = "uv-pack";
  st.textContent = [
    ".btn.ok,.btn.full,#homeFinish,#saveBtn,#finishBtn,#runStartBtn,#goalBtn{",
    "position:relative;overflow:hidden;",
    "box-shadow:0 0 0 1px rgba(240,194,122,.25),0 10px 28px rgba(240,194,122,.22);",
    "transition:transform .18s ease,box-shadow .18s ease}",
    ".btn.ok:active,.btn.full:active,#homeFinish:active{transform:scale(.97)}",
    ".btn.ok::after,#homeFinish::after,#runStartBtn::after{",
    "content:\"\";position:absolute;inset:-40%;background:linear-gradient(120deg,transparent,rgba(255,255,255,.35),transparent);",
    "transform:translateX(-60%);animation:uvShine 2.8s ease-in-out infinite}",
    "@keyframes uvShine{to{transform:translateX(60%)}}",
    "#view-home .glass.card{border-color:rgba(240,194,122,.22);box-shadow:0 12px 40px #0006,inset 0 1px 0 rgba(255,255,255,.1),0 0 24px rgba(99,226,179,.08)}",
    "#view-home .stat{border-color:rgba(99,226,179,.2)}",
    ".toast{display:none;animation:uvToast .35s ease}",
    ".toast.on{display:block}",
    "@keyframes uvToast{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}",
    "#weekRing{width:92px;height:92px;margin:8px auto 0;display:block}",
    ".modes button,.btn.ghost{transition:transform .15s ease,background .15s ease}",
    ".modes button:active,.btn.ghost:active{transform:scale(.96)}"
  ].join("");
  document.head.appendChild(st);

  function ring() {
    var home = document.getElementById("view-home");
    if (!home || document.getElementById("weekRing")) return;
    var kg = document.getElementById("homeKg");
    if (!kg || !kg.parentNode) return;
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.id = "weekRing";
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.innerHTML = '<circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="8"/>' +
      '<circle id="weekArc" cx="50" cy="50" r="40" fill="none" stroke="url(#uvg)" stroke-width="8" stroke-linecap="round" stroke-dasharray="251" stroke-dashoffset="251" transform="rotate(-90 50 50)"/>' +
      '<defs><linearGradient id="uvg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff8bd4"/><stop offset=".5" stop-color="#f0c27a"/><stop offset="1" stop-color="#63e2b3"/></linearGradient></defs>' +
      '<text id="weekPct" x="50" y="55" text-anchor="middle" fill="#f6f1e8" font-size="16" font-family="Comfortaa,sans-serif">0%</text>';
    kg.parentNode.appendChild(svg);
  }
  function weekGymDays() {
    if (typeof sessions === "undefined" || typeof todayISO !== "function") return 0;
    var now = new Date(todayISO() + "T12:00:00");
    var day = now.getDay();
    var start = new Date(now);
    start.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
    var from = start.toISOString().slice(0, 10);
    var to = todayISO();
    var seen = {};
    sessions.forEach(function (s) {
      if (s && s.date >= from && s.date <= to && s.finished) seen[s.date] = 1;
    });
    return Object.keys(seen).length;
  }
  function paintRing() {
    var days = weekGymDays();
    var pct = Math.max(0, Math.min(100, Math.round(days / 6 * 100)));
    var arc = document.getElementById("weekArc");
    var txt = document.getElementById("weekPct");
    if (arc) arc.setAttribute("stroke-dashoffset", String(251 - 251 * pct / 100));
    if (txt) txt.textContent = days + "/6";
  }
  function hookToast() {
    var t = document.getElementById("toast");
    if (!t || t._uv) return;
    t._uv = true;
    var obs = new MutationObserver(function () {
      if (t.style.display === "block" || t.style.display === "") t.classList.add("on");
      else t.classList.remove("on");
    });
    obs.observe(t, { attributes: true, attributeFilter: ["style"] });
  }
  function boot() { ring(); paintRing(); hookToast(); }
  setTimeout(boot, 600);
  setTimeout(boot, 1800);
  if (typeof paintHome === "function" && !paintHome._uv) {
    var old = paintHome;
    paintHome = function () { old(); setTimeout(function () { ring(); paintRing(); }, 40); };
    paintHome._uv = true;
  }
})();
