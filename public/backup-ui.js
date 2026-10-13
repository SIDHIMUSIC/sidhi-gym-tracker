(function () {
  function el(id) { return document.getElementById(id); }
  function toast(msg) { if (typeof window.toast === "function") window.toast(msg); }

  if (!document.getElementById("backup-css")) {
    var st = document.createElement("style");
    st.id = "backup-css";
    st.textContent = ".backup-bar{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.backup-bar .btn{min-height:40px;font-size:12px}";
    document.head.appendChild(st);
  }

  function ensureBar() {
    var home = el("view-home") || el("view-progress");
    if (!home || el("backupBar")) return;
    var bar = document.createElement("div");
    bar.id = "backupBar";
    bar.className = "backup-bar";
    bar.innerHTML = '<button class="btn ghost" id="exportBtn" type="button">Export JSON</button>' +
                    '<button class="btn ghost" id="importBtn" type="button">Import / Restore</button>' +
                    '<input type="file" id="importFile" accept=".json" style="display:none">';
    var week = el("weekBox");
    if (week && week.parentNode) week.parentNode.insertBefore(bar, week.nextSibling);
    else home.appendChild(bar);

    el("exportBtn").onclick = async function () {
      try {
        var data = await api("/api/export");
        var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        var a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "sidhi-gym-backup-" + (typeof todayISO === "function" ? todayISO() : "data") + ".json";
        a.click();
        toast("Backup downloaded");
      } catch (e) { toast(e.message || "Export fail"); }
    };

    el("importBtn").onclick = function () { el("importFile").click(); };
    el("importFile").onchange = async function (ev) {
      var f = ev.target.files && ev.target.files[0];
      if (!f) return;
      try {
        var text = await f.text();
        var data = JSON.parse(text);
        var sessions = Array.isArray(data.sessions) ? data.sessions : (Array.isArray(data) ? data : []);
        if (!sessions.length) { toast("No sessions in file"); return; }
        if (!confirm("Restore " + sessions.length + " sessions? Existing dates will be updated.")) return;
        var ok = 0;
        for (var i = 0; i < sessions.length; i++) {
          var s = sessions[i];
          if (!s || !s.date) continue;
          try {
            await api("/api/session", { method: "PUT", body: s });
            ok++;
          } catch (e) {}
        }
        var fresh = await api("/api/sessions");
        if (typeof sessions !== "undefined") window.sessions = fresh.sessions || [];
        if (typeof paintHome === "function") paintHome();
        if (typeof paintHist === "function") paintHist();
        toast("Restored " + ok + " sessions");
      } catch (e) { toast("Import fail: " + (e.message || "bad file")); }
      ev.target.value = "";
    };
  }

  function tryAdd() {
    if (document.getElementById("view-home") || document.getElementById("weekBox")) ensureBar();
  }
  setTimeout(tryAdd, 800);
  setTimeout(tryAdd, 2500);
  if (typeof paintHome === "function" && !paintHome._backup) {
    var _ph = paintHome;
    paintHome = function () { _ph(); tryAdd(); };
    paintHome._backup = true;
  }
})();
