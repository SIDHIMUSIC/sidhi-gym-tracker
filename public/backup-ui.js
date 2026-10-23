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
    if (!document.getElementById("sg-io-css")) {
      var st = document.createElement("style");
      st.id = "sg-io-css";
      st.textContent = [
        "#exportBar{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}",
        ".io-btn{position:relative;width:10.5rem;height:3rem;cursor:pointer;border:0;background:rgba(240,194,122,.08);border-radius:1em;color:#f6f1e8}",
        ".io-btn svg{width:100%;height:100%;overflow:visible}",
        ".io-btn .border{width:100%;height:100%;stroke:#f0c27a;stroke-width:2;fill:transparent;rx:1em;ry:1em;stroke-dasharray:25;animation:ioStroke 4s linear infinite}",
        ".io-btn .loading{width:100%;height:100%;stroke:#63e2b3;stroke-width:2;fill:none;rx:1em;ry:1em;stroke-dasharray:0 100}",
        ".io-btn.go .loading{stroke-dasharray:100 0;transition:stroke-dasharray .8s ease}",
        ".io-btn .txt{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font:800 12px Comfortaa,sans-serif;letter-spacing:.04em}",
        "@keyframes ioStroke{to{stroke-dashoffset:0}}"
      ].join("");
      document.head.appendChild(st);
    }
    function ioBtn(id, label) {
      return '<button class="io-btn" id="' + id + '" type="button">' +
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 168 48" preserveAspectRatio="none"><rect class="border" x="1" y="1" width="166" height="46" rx="22" pathLength="100"></rect><rect class="loading" x="1" y="1" width="166" height="46" rx="22" pathLength="100"></rect></svg>' +
        '<div class="txt">' + label + '</div></button>';
    }
    bar.innerHTML = ioBtn("exportBtn", "Export JSON") + ioBtn("importBtn", "Import") +
                    '<input type="file" id="importFile" accept=".json" style="display:none">';
    var homeView = el("view-home") || home;
    var week = el("weekBox");
    if (week && week.parentNode) week.parentNode.insertBefore(bar, week.nextSibling);
    else homeView.appendChild(bar);

    el("exportBtn").onclick = async function () { el("exportBtn").classList.add("go"); setTimeout(function(){el("exportBtn").classList.remove("go");},1200);
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

    el("importBtn").onclick = function () { el("importBtn").classList.add("go"); setTimeout(function(){el("importBtn").classList.remove("go");},1200); el("importFile").click(); };
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
