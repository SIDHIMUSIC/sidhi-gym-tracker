(function () {
  if (document.getElementById("stats-pack")) return;
  var st = document.createElement("style");
  st.id = "stats-pack";
  st.textContent = ".alert-chip{display:inline-block;margin-top:8px;padding:6px 12px;border-radius:999px;font:800 12px Comfortaa,sans-serif}.alert-up{background:rgba(255,107,107,.15);color:#ff8b8b}.alert-down{background:rgba(99,226,179,.15);color:#63e2b3}.bar-track{height:10px;border-radius:99px;background:rgba(255,255,255,.08);overflow:hidden;margin:8px 0}.bar-fill{height:100%;width:0;border-radius:99px;background:linear-gradient(90deg,#ff8bd4,#f0c27a,#63e2b3)}.status{font:800 13px Comfortaa,sans-serif;color:#f0c27a}";
  document.head.appendChild(st);

  function weights() {
    if (typeof sessions === "undefined") return [];
    return sessions.filter(function (s) { return s.entryWeight != null && s.entryWeight !== ""; })
      .map(function (s) { return { date: s.date, kg: Number(s.entryWeight) }; })
      .sort(function (a, b) { return a.date.localeCompare(b.date); });
  }
  function avg(arr) {
    if (!arr.length) return null;
    return arr.reduce(function (a, b) { return a + b; }, 0) / arr.length;
  }

  function paintAlert() {
    var box = document.getElementById("homeKg");
    if (!box || !box.parentNode) return;
    var chip = document.getElementById("wtAlert");
    if (!chip) {
      chip = document.createElement("div");
      chip.id = "wtAlert";
      box.parentNode.appendChild(chip);
    }
    var pts = weights();
    if (pts.length < 2) { chip.textContent = ""; chip.className = ""; return; }
    var a = pts[pts.length - 2].kg, b = pts[pts.length - 1].kg;
    var d = Math.round((b - a) * 100) / 100;
    if (d > 0) { chip.className = "alert-chip alert-up"; chip.textContent = "+" + d + " kg bad gaya"; }
    else if (d < 0) { chip.className = "alert-chip alert-down"; chip.textContent = d + " kg kam ho gaya · keep going"; }
    else { chip.className = "alert-chip"; chip.textContent = "same weight"; }
  }

  function paintInsights() {
    var view = document.getElementById("view-progress");
    if (!view) return;
    var card = document.getElementById("insightCard");
    if (!card) {
      card = document.createElement("div");
      card.id = "insightCard";
      card.className = "glass card";
      var goal = document.getElementById("goalWeight");
      if (goal && goal.closest(".glass")) goal.closest(".glass").insertAdjacentElement("afterend", card);
      else view.appendChild(card);
    }
    var pts = weights();
    if (!pts.length) { card.innerHTML = "<h2>progress</h2><p class=\"sub\">No weight yet</p>"; return; }
    var last = pts[pts.length - 1].kg;
    var hi = pts.reduce(function (m, p) { return p.kg > m.kg ? p : m; }, pts[0]);
    var lo = pts.reduce(function (m, p) { return p.kg < m.kg ? p : m; }, pts[0]);
    var last7 = pts.slice(-7);
    var ma = avg(last7.map(function (p) { return p.kg; }));
    var weekChange = last7.length > 1 ? Math.round((last7[last7.length - 1].kg - last7[0].kg) * 100) / 100 : 0;
    var days = Math.round((new Date(pts[pts.length - 1].date) - new Date(pts[0].date)) / 86400000) + 1;
    var goal = typeof goalWeight !== "undefined" && goalWeight != null ? Number(goalWeight) : null;
    var left = goal != null ? Math.round((last - goal) * 100) / 100 : null;
    var start = pts[0].kg;
    var pct = 0;
    if (goal != null && start !== goal) pct = Math.max(0, Math.min(100, Math.round(((start - last) / (start - goal)) * 100)));
    var status = "On track";
    if (last7.length >= 4) {
      var older = avg(last7.slice(0, Math.floor(last7.length / 2)).map(function (p) { return p.kg; }));
      var newer = avg(last7.slice(Math.floor(last7.length / 2)).map(function (p) { return p.kg; }));
      var drop = older - newer;
      if (Math.abs(drop) < 0.15) status = "Plateau";
      else if (drop > 0.6) status = "Too fast";
      else if (drop > 0) status = "On track";
      else status = "Up this week";
    }
    card.innerHTML =
      "<h2>progress</h2>" +
      (left != null ? "<p class=\"status\">" + (left > 0 ? left + " kg bacha hai" : "goal hit") + "</p><div class=\"bar-track\"><div class=\"bar-fill\" style=\"width:" + pct + "%\"></div></div>" : "<p class=\"sub\">Set goal weight</p>") +
      "<div class=\"kv\"><span>status</span><b>" + status + "</b></div>" +
      "<div class=\"kv\"><span>7-day avg</span><b>" + (ma != null ? ma.toFixed(1) + " kg" : "—") + "</b></div>" +
      "<div class=\"kv\"><span>last 7 change</span><b>" + (weekChange > 0 ? "+" : "") + weekChange + " kg</b></div>" +
      "<div class=\"kv\"><span>highest</span><b>" + hi.kg + " · " + hi.date + "</b></div>" +
      "<div class=\"kv\"><span>lowest</span><b>" + lo.kg + " · " + lo.date + "</b></div>" +
      "<div class=\"kv\"><span>days tracked</span><b>" + days + " din · " + pts.length + " entries</b></div>";
  }

  function boot() { paintAlert(); paintInsights(); }
  setTimeout(boot, 800);
  setTimeout(boot, 2000);
  if (typeof paintHome === "function" && !paintHome._stats) {
    var old = paintHome;
    paintHome = function () { old(); setTimeout(boot, 40); };
    paintHome._stats = true;
  }
  if (typeof showTab === "function" && !showTab._stats) {
    var stOld = showTab;
    showTab = function (name) { stOld(name); if (name === "progress") setTimeout(paintInsights, 40); };
    showTab._stats = true;
  }
})();
