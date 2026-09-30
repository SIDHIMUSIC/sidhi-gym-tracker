(function () {
  function el(id) { return document.getElementById(id); }
  if (!document.getElementById("polish-css")) {
    var st = document.createElement("style");
    st.id = "polish-css";
    st.textContent =
      ".hist-item{cursor:pointer}.hist-item:active{transform:scale(.99)}" +
      "#deltaPop{position:fixed;inset:0;z-index:90;display:none;place-items:center;background:#070b12cc;padding:24px}" +
      "#deltaPop.on{display:grid}" +
      "#deltaPop .box{text-align:center;padding:28px 22px;max-width:340px}" +
      "#deltaPop .big{font:800 42px Comfortaa,sans-serif;margin:8px 0}" +
      ".pwa-hint{margin:10px 0 14px;padding:12px 14px;display:flex;justify-content:space-between;gap:8px;align-items:center}" +
      ".pwa-hint b{display:block;font-size:13px}.pwa-hint span{font-size:11px;color:#9aa7b8}" +
      ".draft-dot{position:fixed;top:10px;left:50%;transform:translateX(-50%);z-index:25;font-size:11px;padding:6px 12px;border-radius:999px;background:#f0c27a22;color:#f0c27a;display:none}";
    document.head.appendChild(st);
  }

  var FIELDS = ["date","entryTime","after1HourTime","after1HourNote","beforeTreadmillTime","beforeTreadmillKm","beforeTreadmillMins","beforeTreadmillSpeed","beforeTreadmillNote","afterTreadmillTime","afterTreadmillKm","afterTreadmillMins","afterTreadmillSpeed","afterTreadmillIncline","afterTreadmillNote"];
  var DRAFT = "sidhi-gym-draft";

  function readDraft() {
    try { return JSON.parse(localStorage.getItem(DRAFT) || "null"); } catch (e) { return null; }
  }
  function writeDraft() {
    var o = { savedAt: Date.now() };
    FIELDS.forEach(function (id) { var n = el(id); if (n) o[id] = n.value; });
    localStorage.setItem(DRAFT, JSON.stringify(o));
  }
  function clearDraft() { localStorage.removeItem(DRAFT); }
  function applyDraft() {
    var o = readDraft();
    if (!o) return;
    var today = typeof todayISO === "function" ? todayISO() : "";
    if (o.date && today && o.date !== today) return;
    FIELDS.forEach(function (id) {
      if (id === "entryTime" || id === "after1HourTime") return;
      var n = el(id);
      if (n && o[id] != null && n.value === "") n.value = o[id];
    });
  }
  FIELDS.forEach(function (id) {
    var n = el(id);
    if (!n) return;
    n.addEventListener("input", writeDraft);
    n.addEventListener("change", writeDraft);
  });
  applyDraft();

  async function syncDraft() {
    if (!navigator.onLine || !readDraft()) return;
    if (typeof save === "function") {
      try { await save(false); clearDraft(); } catch (e) {}
    }
  }
  window.addEventListener("online", syncDraft);

  function showDelta() {
    var start = Number((el("entryWeight") || {}).value);
    var end = Number((el("afterTreadmillWeight") || {}).value);
    var pop = el("deltaPop");
    if (!pop) {
      pop = document.createElement("div");
      pop.id = "deltaPop";
      pop.innerHTML = '<div class="glass box"><p class="badge">WORKOUT DONE</p><div class="big" id="deltaBig"></div><p class="sub" id="deltaSub"></p><button class="btn ok full" id="deltaOk" type="button">ok</button></div>';
      document.body.appendChild(pop);
      el("deltaOk").onclick = function () { pop.classList.remove("on"); };
    }
    var big = el("deltaBig"), sub = el("deltaSub");
    if (!Number.isFinite(start) || !Number.isFinite(end) || !start) {
      if (typeof toast === "function") toast("Workout saved");
      return;
    }
    var d = Math.round((end - start) * 1000) / 1000;
    var abs = Math.abs(d);
    if (d < 0) {
      big.textContent = "\u2212" + abs + " kg"; big.style.color = "#63e2b3";
      sub.textContent = start + " \u2192 " + end + " kg";
      if (typeof toast === "function") toast(abs + " kg down");
    } else if (d > 0) {
      big.textContent = "+" + abs + " kg"; big.style.color = "#ff8b8b";
      sub.textContent = start + " \u2192 " + end + " kg";
      if (typeof toast === "function") toast(abs + " kg up");
    } else {
      big.textContent = end + " kg"; big.style.color = "#f0c27a";
      sub.textContent = "Same as start " + start + " kg";
      if (typeof toast === "function") toast("Weight same");
    }
    pop.classList.add("on");
    setTimeout(function () { pop.classList.remove("on"); }, 4200);
  }

  if (typeof save === "function" && !save._delta) {
    var _sv = save;
    save = async function (finished) {
      try {
        await _sv(finished);
        clearDraft();
        if (finished) showDelta();
      } catch (err) {
        writeDraft();
        if (typeof toast === "function") toast(navigator.onLine ? err.message : "Offline \u2014 draft saved");
      }
    };
    save._delta = true;
  }

  var hist = el("view-history");
  if (hist && !hist._rowTap) {
    hist._rowTap = true;
    hist.addEventListener("click", function (e) {
      if (e.target.closest("button")) return;
      var item = e.target.closest(".hist-item");
      if (!item) return;
      var open = item.querySelector("[data-open]");
      if (open) open.click();
    });
  }
})();
