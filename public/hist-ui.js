(function () {
  function el(id) { return document.getElementById(id); }
  function fancy(s) {
    const m = {a:"ᴀ",b:"ʙ",c:"ᴄ",d:"ᴅ",e:"ᴇ",f:"ꜰ",g:"ɢ",h:"ʜ",i:"ɪ",j:"ᴊ",k:"ᴋ",l:"ʟ",m:"ᴍ",n:"ɴ",o:"ᴏ",p:"ᴘ",q:"ǫ",r:"ʀ",s:"s",t:"ᴛ",u:"ᴜ",v:"ᴠ",w:"ᴡ",x:"x",y:"ʏ",z:"ᴢ"};
    return String(s).replace(/[A-Za-z]/g, function (ch) { return m[ch.toLowerCase()] || ch; });
  }
  if (!document.getElementById("hist-ui-css")) {
    var st = document.createElement("style");
    st.id = "hist-ui-css";
    st.textContent = [
      ".tabbar{padding:10px 8px calc(10px + env(safe-area-inset-bottom));gap:6px;background:rgba(8,14,22,.82)}",
      ".tab{min-height:52px;font:700 11px Comfortaa,sans-serif;letter-spacing:.08em;color:#c9d4e2}",
      ".tab span{display:block;font-size:16px;margin-bottom:2px}",
      ".tab.on{color:#120d06;font-weight:800;box-shadow:0 8px 18px #f0c27a33}",
      "#view-history .hist-card h2{margin-bottom:12px}",
      ".hist-list{display:flex;flex-direction:column;gap:10px}",
      ".hist-item{display:flex;justify-content:space-between;gap:10px;align-items:center;padding:12px;border-radius:18px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08)}",
      ".hist-item b{display:block;font-size:14px}",
      ".hist-item .sub{margin:3px 0 0;font-size:12px}",
      ".hist-acts{display:flex;flex-direction:column;gap:6px;min-width:72px}",
      ".hist-acts .btn{min-height:36px;padding:6px 10px;font-size:11px}"
    ].join("");
    document.head.appendChild(st);
  }
  document.querySelectorAll("#tabbar .tab").forEach(function (b) {
    var name = b.dataset.tab;
    var icon = { home: "⌂", workout: "✦", progress: "◈", history: "☰" }[name] || "•";
    b.innerHTML = "<span>" + icon + "</span>" + fancy(name);
  });
  var view = el("view-history");
  if (view) {
    view.innerHTML =
      '<div class="glass card hist-card"><h2>' + fancy("gym history") + '</h2><div class="hist-list" id="histGym"></div></div>' +
      '<div class="glass card hist-card"><h2>' + fancy("running history") + '</h2><div class="hist-list" id="histRun"></div></div>';
  }
  function kgSafe(v) {
    if (typeof kg === "function") return kg(v);
    var n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : null;
  }
  function paintSplitHist() {
    var gymBox = el("histGym");
    var runBox = el("histRun");
    if (!gymBox || !runBox) return;
    var list = (typeof sessions !== "undefined" && sessions) || [];
    if (!list.length) {
      gymBox.innerHTML = '<p class="sub">' + fancy("no gym sessions yet") + "</p>";
      runBox.innerHTML = '<p class="sub">' + fancy("no runs yet") + "</p>";
      return;
    }
    gymBox.innerHTML = list.map(function (s) {
      var start = kgSafe(s.entryWeight);
      var end = kgSafe(s.afterTreadmillWeight);
      var line = start != null ? start + " kg" : "—";
      var delta = "";
      if (start != null && end != null) {
        var d = Math.round((end - start) * 1000) / 1000;
        line = start + " → " + end + " kg";
        delta = d < 0 ? Math.abs(d) + " kg down" : d > 0 ? d + " kg up" : "same";
      }
      var note = s.after1HourNote ? String(s.after1HourNote).slice(0, 42) : "";
      return '<div class="hist-item"><div><b>' + fancy(s.workoutName || "gym") + '</b><div class="sub">' + s.date + (s.day ? " • " + s.day : "") + (s.finished ? " • done" : "") + '</div><div class="sub">' + line + (delta ? " • " + delta : "") + (note ? " • " + note : "") + '</div></div><div class="hist-acts"><button class="btn ghost" data-open="' + s.date + '">' + fancy("open") + '</button><button class="btn danger" data-del="' + s.date + '">X</button></div></div>';
    }).join("");
    var runCards = [];
    list.forEach(function (s) {
      var runs = Array.isArray(s.runs) ? s.runs : [];
      runs.forEach(function (r) {
        var km = Number(r.distanceKm) || 0;
        var min = Math.round((Number(r.durationSec) || 0) / 60);
        var cal = Math.round(Number(r.calories) || 0);
        var spd = r.avgSpeed != null ? r.avgSpeed : r.maxSpeed;
        runCards.push('<div class="hist-item"><div><b>' + fancy(r.mode || "run") + (r.source === "gps" ? " • gps" : "") + '</b><div class="sub">' + s.date + (s.day ? " • " + s.day : "") + '</div><div class="sub">' + km.toFixed(2) + " km • " + min + " min • " + cal + " kcal" + (spd != null ? " • " + spd + " km/h" : "") + '</div></div><div class="hist-acts"><button class="btn ghost" data-open="' + s.date + '">' + fancy("open") + "</button></div></div>");
      });
      if (!runs.length) {
        var tkm = (Number(s.beforeTreadmillKm) || 0) + (Number(s.afterTreadmillKm) || 0);
        var tmin = (Number(s.beforeTreadmillMins) || 0) + (Number(s.afterTreadmillMins) || 0);
        if (tkm || tmin) {
          runCards.push('<div class="hist-item"><div><b>' + fancy("treadmill") + '</b><div class="sub">' + s.date + (s.day ? " • " + s.day : "") + '</div><div class="sub">' + (tkm ? tkm + " km" : "—") + (tmin ? " • " + tmin + " min" : "") + '</div></div><div class="hist-acts"><button class="btn ghost" data-open="' + s.date + '">' + fancy("open") + "</button></div></div>");
        }
      }
    });
    runBox.innerHTML = runCards.join("") || '<p class="sub">' + fancy("no runs yet") + "</p>";
  }
  if (typeof paintHist === "function") {
    var _paintHist = paintHist;
    paintHist = function () {
      try { _paintHist(); } catch (e) {}
      paintSplitHist();
    };
  } else {
    window.paintHist = paintSplitHist;
  }
  if (view) {
    view.addEventListener("click", async function (e) {
      var btn = e.target.closest("button");
      if (!btn) return;
      var open = btn.dataset.open;
      var del = btn.dataset.del;
      if (open && typeof showTab === "function") {
        if (el("date")) el("date").value = open;
        showTab("workout");
      }
      if (del) {
        if (!confirm("Delete " + del + "?")) return;
        try {
          var data = await api("/api/session/" + del, { method: "DELETE" });
          sessions = data.sessions || [];
          if (typeof paintHist === "function") paintHist();
          if (typeof paintHome === "function") paintHome();
        } catch (err) {
          if (typeof toast === "function") toast(err.message);
        }
      }
    });
  }
  paintSplitHist();
})();
