// Sidhi Gym — Premium features
(function () {
  var TOKEN = "sidhi-gym-token";

  function isPrem() {
    return window.__sidhiMe && (window.__sidhiMe.premium || window.__sidhiMe.isAdmin);
  }

  function toast(m) {
    var t = document.getElementById("toast");
    if (!t) return;
    t.textContent = m;
    t.style.display = "block";
    setTimeout(function () { t.style.display = "none"; }, 1800);
  }

  // Personal Records card
  function prCard() {
    if (!isPrem() || document.getElementById("prCard")) return;
    var home = document.getElementById("view-home");
    if (!home) return;
    var box = document.createElement("div");
    box.id = "prCard";
    box.className = "glass card";
    box.style.marginTop = "12px";
    box.innerHTML = '<h2 style="color:#f0c27a">Personal Records</h2><div id="prList" style="font-size:14px;color:#9aa7b8">Loading...</div>';
    home.appendChild(box);
    loadPRs();
  }

  function loadPRs() {
    var token = localStorage.getItem(TOKEN);
    fetch("/api/sessions", { headers: { Authorization: "Bearer " + token } })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        var sessions = d.sessions || [];
        var prs = {};
        sessions.forEach(function (s) {
          (s.lifts || []).forEach(function (l) {
            var name = (l.name || l.exercise || "").toLowerCase();
            var w = Number(l.weight || l.kg || 0);
            if (name && w > (prs[name] || 0)) prs[name] = w;
          });
        });
        var html = "";
        var keys = Object.keys(prs).slice(0, 6);
        if (!keys.length) html = "No lifts yet";
        else keys.forEach(function (k) {
          html += '<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #222"><span>' + k + '</span><span style="color:#63e2b3">' + prs[k] + ' kg</span></div>';
        });
        var el = document.getElementById("prList");
        if (el) el.innerHTML = html;
      });
  }

  // Weekly summary
  function weeklyCard() {
    if (!isPrem() || document.getElementById("weekCard")) return;
    var home = document.getElementById("view-home");
    if (!home) return;
    var box = document.createElement("div");
    box.id = "weekCard";
    box.className = "glass card";
    box.style.marginTop = "12px";
    box.innerHTML = '<h2 style="color:#f0c27a">This Week</h2><div id="weekStats" style="font-size:14px">...</div>';
    home.appendChild(box);
    var token = localStorage.getItem(TOKEN);
    fetch("/api/sessions", { headers: { Authorization: "Bearer " + token } })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        var sessions = d.sessions || [];
        var now = new Date();
        var weekAgo = new Date(now - 7 * 86400000);
        var count = 0, weight = 0;
        sessions.forEach(function (s) {
          var dt = new Date(s.date);
          if (dt >= weekAgo) {
            count++;
            if (s.entryWeight) weight = s.entryWeight;
          }
        });
        var el = document.getElementById("weekStats");
        if (el) el.innerHTML = '<div>' + count + ' workouts</div><div style="color:#9aa7b8;font-size:12px;margin-top:4px">Last weight: ' + (weight || "—") + ' kg</div>';
      });
  }

  // Rest timer button
  function restTimer() {
    if (!isPrem() || document.getElementById("restBtn")) return;
    var home = document.getElementById("view-home");
    if (!home) return;
    var btn = document.createElement("button");
    btn.id = "restBtn";
    btn.textContent = "Rest Timer 60s";
    btn.style.cssText = "margin:10px 14px;padding:10px 16px;border-radius:10px;border:0;background:#63e2b3;color:#111;font-weight:700";
    btn.onclick = function () {
      var sec = 60;
      btn.disabled = true;
      var iv = setInterval(function () {
        sec--;
        btn.textContent = "Rest " + sec + "s";
        if (sec <= 0) {
          clearInterval(iv);
          btn.textContent = "Rest Timer 60s";
          btn.disabled = false;
          toast("Rest done!");
          if (navigator.vibrate) navigator.vibrate(200);
        }
      }, 1000);
    };
    home.appendChild(btn);
  }

  function boot() {
    var token = localStorage.getItem(TOKEN);
    if (!token) return;
    fetch("/api/me", { headers: { Authorization: "Bearer " + token } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (m) {
        if (!m) return;
        window.__sidhiMe = m;
        if (m.premium || m.isAdmin) {
          setTimeout(prCard, 800);
          setTimeout(weeklyCard, 1000);
          setTimeout(restTimer, 1200);
        }
      });
  }

  setTimeout(boot, 1500);
})();
