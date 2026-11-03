(function () {
  function el(id) { return document.getElementById(id); }
  function addWeightField() {
    var save = el("pfSave");
    if (!save || el("pfWeightNow")) return;
    var card = save.closest(".card");
    if (!card) return;
    var label = document.createElement("label"); label.textContent = "current weight (kg)";
    var input = document.createElement("input"); input.id = "pfWeightNow"; input.inputMode = "decimal"; input.placeholder = "e.g. 72.5"; input.autocomplete = "off";
    card.insertBefore(label, save); card.insertBefore(input, save);
    fetch("/api/me", { headers: { authorization: "Bearer " + (localStorage.getItem("sidhi-gym-token") || "") }, cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error("Profile load failed"); return r.json(); })
      .then(function (d) { if (el("pfWeightNow") && d.currentWeight != null) el("pfWeightNow").value = d.currentWeight; }).catch(function () {});
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("#pfSave"); if (!b) return;
    var input = el("pfWeightNow"); if (!input || !input.value.trim()) return;
    var kg = Number(input.value);
    if (!Number.isFinite(kg) || kg < 1 || kg > 500) { if (typeof toast === "function") toast("Weight 1–500 kg ke beech daalo"); e.preventDefault(); e.stopImmediatePropagation(); return; }
    setTimeout(function () { if (typeof api === "function") api("/api/me", { method: "PATCH", body: { currentWeight: kg } }).then(function () { if (typeof toast === "function") toast("Current weight saved"); }).catch(function (err) { if (typeof toast === "function") toast(err.message || "Weight save failed"); }); }, 250);
  }, true);
  var observer = new MutationObserver(addWeightField); observer.observe(document.body, { childList: true, subtree: true }); addWeightField();
})();