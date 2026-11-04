(function () {
  function el(id) { return document.getElementById(id); }
  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"\']/g, function (ch) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "\'": "&#39;" })[ch]; });
  }
  function fancy(s) {
    const m = {a:"ᴀ",b:"ʙ",c:"ᴄ",d:"ᴅ",e:"ᴇ",f:"ꜰ",g:"ɢ",h:"ʜ",i:"ɪ",j:"ᴊ",k:"ᴋ",l:"ʟ",m:"ᴍ",n:"ɴ",o:"ᴏ",p:"ᴘ",q:"ǫ",r:"ʀ",s:"s",t:"ᴛ",u:"ᴜ",v:"ᴠ",w:"ᴡ",x:"x",y:"ʏ",z:"ᴢ"};
    return String(s).replace(/[A-Za-z]/g, function (ch) { return m[ch.toLowerCase()] || ch; });
  }
  function amp(t) {
    if (!t) return "";
    var p = String(t).split(":");
    var h = Number(p[0]); var m = (p[1] || "00").slice(0, 2);
    if (!Number.isFinite(h)) return t;
    var ap = h >= 12 ? "PM" : "AM";
    var h12 = h % 12; if (!h12) h12 = 12;
    return h12 + ":" + m + " " + ap;
  }
  if (!document.getElementById("hist-ui-css")) {
    var st = document.createElement("style");
    st.id = "hist-ui-css";
    st.textContent = ".hist-list{display:flex;flex-direction:column;gap:10px}.hist-item{display:flex;justify-content:space-between;gap:10px;align-items:center;padding:12px;border-radius:18px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08)}.hist-item b{display:block;font-size:14px}.hist-item .sub{margin:3px 0 0;font-size:12px}.hist-acts{display:flex;flex-direction:column;gap:6px;min-width:72px}.hist-acts .btn{min-height:36px;padding:6px 10px;font-size:11px}.hist-day-card{padding:14px;margin:0 0 10px;border-radius:18px;background:rgba(10,17,28,.92);border:1px solid rgba(255,255,255,.1)}.hist-day-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;color:#f4d6a1}.hist-day-head span{font-size:11px;color:#9aa7b8}.hist-run-line{display:grid;grid-template-columns:64px minmax(0,1fr);gap:8px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.07);font-size:12px;line-height:1.5}.hist-run-line b{color:#f0c27a}.hist-run-line span{color:#dbe4f0;text-align:right}.hist-day-total{display:flex;flex-wrap:wrap;gap:6px 12px;align-items:center;margin-top:12px;padding-top:10px;border-top:1px solid rgba(240,194,122,.28);color:#a8edea;font-size:12px}.hist-day-total small{width:100%;font-size:10px;letter-spacing:.12em;color:#f0c27a;font-weight:800}.hist-day-total b{font-size:13px}.hist-day-actions{display:flex;justify-content:flex-end;margin-top:8px}";
    document.head.appendChild(st);
  }
  var view = el("view-history");
  if (view && !el("histGym")) {
    view.innerHTML =
      '<div class="glass card hist-card"><h2>' + fancy("gym history") + '</h2><div class="hist-list" id="histGym"></div></div>' +
      '<div class="glass card hist-card"><h2>' + fancy("running history") + '</h2><div class="hist-list" id="histRun"></div></div>';
  }
  function kgSafe(v) {
    var n = Number(v);
    return Number.isFinite(n) && n > 0 ? Math.round(n * 1000) / 1000 : null;
  }
  function gymClock(s) {
    var a = amp(s.entryTime);
    var b = amp(s.exitTime || s.afterTreadmillTime);
    if (a && b) return a + " → " + b;
    if (a) return "in " + a;
    if (b) return "out " + b;
    return "";
  }

  function showDetail(date) {
    var list = (typeof sessions !== "undefined" && sessions) || [];
    var s = list.find(function (x) { return x.date === date; });
    if (!s) return;
    var runs = (s.runs || []).map(function (r) {
      return escapeHtml(r.mode || "run") + " • " + (Number(r.distanceKm) || 0).toFixed(2) + " km • " + Math.round((Number(r.durationSec) || 0) / 60) + " min";
    }).join("<br>");
    var html = '<div class="glass card" style="position:fixed;inset:16px;z-index:120;overflow:auto;background:#0c121c;padding:18px;border-radius:20px">' +
      '<b style="font-size:18px">' + escapeHtml(s.date || "") + " • " + escapeHtml(s.workoutName || "gym") + '</b>' +
      '<p class="sub">' + escapeHtml(s.day || "") + '</p>' +
      '<p>Start ' + escapeHtml(s.entryWeight || "—") + ' kg at ' + escapeHtml(s.entryTime || "—") + '</p>' +
      '<p>End ' + escapeHtml(s.afterTreadmillWeight || "—") + ' kg at ' + escapeHtml(s.exitTime || s.afterTreadmillTime || "—") + '</p>' +
      '<p>Finished: ' + (s.finished ? "yes" : "no") + '</p>' +
      (runs ? '<p>Runs<br>' + runs + '</p>' : '') +
      (s.after1HourNote ? '<p>' + escapeHtml(s.after1HourNote) + '</p>' : '') +
      '<button class="btn ok full" id="closeDetail" type="button" style="margin-top:12px">CLOSE</button></div>';
    var old = document.getElementById("sessionDetail");
    if (old) old.remove();
    var wrap = document.createElement("div");
    wrap.id = "sessionDetail";
    wrap.innerHTML = html;
    document.body.appendChild(wrap);
    var c = document.getElementById("closeDetail");
    if (c) c.onclick = function () { wrap.remove(); };
  }

  function paintSplitHist() {
    var gymBox = el("histGym");
    var runBox = el("histRun");
    if (!gymBox || !runBox) return;
    var list = ((typeof sessions !== "undefined" && sessions) || []).slice().sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
    if (!list.length) {
      gymBox.innerHTML = '<p class="sub">' + fancy("no gym sessions yet") + "</p>";
      runBox.innerHTML = '<p class="sub">' + fancy("no runs yet") + "</p>";
      return;
    }
    gymBox.innerHTML = list.map(function (s) {
      var start = kgSafe(s.entryWeight);
      var end = kgSafe(s.afterTreadmillWeight);
      var line = "—";
      var delta = "";
      if (start != null && end != null) {
        var d = Math.round((end - start) * 1000) / 1000;
        line = start + " → " + end + " kg";
        delta = d < 0 ? Math.abs(d) + " kg down" : d > 0 ? d + " kg up" : "same";
      } else if (start != null) line = "start " + start + " kg";
      else if (end != null) line = "end " + end + " kg";
      var clock = gymClock(s);
      var html = '<div class="hist-item" data-date="' + escapeHtml(s.date) + '"><div><b>' + fancy(escapeHtml(s.workoutName || "gym")) + '</b>';
      html += '<div class="sub">' + s.date;
      if (s.day) html += " • " + s.day;
      if (clock) html += " • " + clock;
      if (s.finished) html += " • done";
      html += '</div><div class="sub">' + line;
      if (delta) html += " • " + delta;
      html += '</div></div><div class="hist-acts">';
      html += '<button class="btn ghost" data-open="' + s.date + '">' + fancy("open") + '</button>';
      html += '<button class="btn danger" data-del="' + s.date + '">X</button>';
      html += '</div></div>';
      return html;
    }).join("");
    var dailyRuns = {};
    list.forEach(function (s) {
      (Array.isArray(s.runs) ? s.runs : []).forEach(function (r) {
        var date = String(s.date || r.date || (r.endedAt || r.startedAt || "").slice(0, 10));
        if (!date) return;
        if (!dailyRuns[date]) dailyRuns[date] = { date: date, runs: [], km: 0, seconds: 0, calories: 0 };
        var day = dailyRuns[date];
        day.runs.push(r);
        day.km += Number(r.distanceKm) || 0;
        day.seconds += Number(r.durationSec) || 0;
        day.calories += Number(r.calories) || 0;
      });
    });
    function runDuration(seconds) {
      var total = Math.max(0, Math.round(Number(seconds) || 0));
      var mins = Math.floor(total / 60), secs = total % 60;
      return mins ? mins + " min" + (secs ? " " + secs + " sec" : "") : secs + " sec";
    }
    var runCards = Object.keys(dailyRuns).sort(function (a, b) { return b.localeCompare(a); }).map(function (date) {
      var day = dailyRuns[date];
      day.runs.sort(function (a, b) {
        return String(a.startedAt || a.id || "").localeCompare(String(b.startedAt || b.id || ""));
      });
      var dateLabel = new Date(date + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
      var rows = day.runs.map(function (r, i) {
        var ordinal = i === 0 ? "1st run" : i === 1 ? "2nd run" : i === 2 ? "3rd run" : (i + 1) + "th run";
        var mode = escapeHtml(r.mode || "run");
        return '<div class="hist-run-line"><b>' + ordinal + '</b><span>' + mode + ' · ' +
          (Number(r.distanceKm) || 0).toFixed(2) + ' km · ' + runDuration(r.durationSec) + ' · ' +
          Math.round(Number(r.calories) || 0) + ' kcal</span></div>';
      }).join("");
      return '<div class="hist-day-card" data-date="' + escapeHtml(date) + '">' +
        '<div class="hist-day-head"><b>' + escapeHtml(dateLabel) + '</b><span>' + day.runs.length + (day.runs.length === 1 ? ' run' : ' runs') + '</span></div>' +
        rows +
        '<div class="hist-day-total"><small>DAILY TOTAL</small><b>' + day.km.toFixed(2) + ' km</b><b>' + runDuration(day.seconds) + '</b><b>' + Math.round(day.calories) + ' kcal</b></div>' +
        '<div class="hist-day-actions"><button class="btn ghost" data-open="' + escapeHtml(date) + '">' + fancy("details") + '</button></div></div>';
    });
    runBox.innerHTML = runCards.join("") || '<p class="sub">' + fancy("no runs yet") + "</p>";
  }
  if (typeof paintHist === "function") {
    var _paintHist = paintHist;
    paintHist = function () { try { _paintHist(); } catch (e) {} paintSplitHist(); };
  } else window.paintHist = paintSplitHist;
  document.addEventListener("click", async function (e) {
    var btn = e.target.closest("button");
    if (btn && btn.dataset.del) {
      e.preventDefault();
      e.stopPropagation();
      if (!confirm("Delete " + btn.dataset.del + "?")) return;
      try {
        var data = await api("/api/session/" + encodeURIComponent(btn.dataset.del), { method: "DELETE" });
        sessions = data.sessions || [];
        if (typeof paintHist === "function") paintHist();
        if (typeof paintHome === "function") paintHome();
      } catch (err) {
        if (typeof toast === "function") toast(err.message || "Could not delete session");
      }
      return;
    }
    if (btn && btn.dataset.open) { showDetail(btn.dataset.open); return; }
    var item = e.target.closest(".hist-item");
    if (item && item.dataset.date && view && view.contains(item)) showDetail(item.dataset.date);
  });
  paintSplitHist();
})();
