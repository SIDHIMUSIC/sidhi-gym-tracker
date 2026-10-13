(function () {
  function el(id) { return document.getElementById(id); }
  function kg(v) { var n = Number(v); return Number.isFinite(n) && n > 0 ? n : null; }

  function comparisonHtml() {
    var list = ((typeof sessions !== "undefined" && sessions) || []).slice().sort(function (a,b){return String(a.date).localeCompare(String(b.date));});
    if (list.length < 2) return '<p class="sub">More data needed for comparison</p>';
    var weights = list.filter(function(s){return kg(s.entryWeight);});
    if (weights.length < 2) return '<p class="sub">Add more weight entries</p>';
    var first = weights[0], last = weights[weights.length-1];
    var delta = Math.round((kg(last.entryWeight) - kg(first.entryWeight))*10)/10;
    var days = Math.max(1, Math.round((new Date(last.date) - new Date(first.date))/86400000));
    var perWeek = Math.round((delta / days * 7)*10)/10;
    return '<div class="glass card" style="margin-top:12px"><h2>progress summary</h2>' +
      '<div class="kv"><span>start</span><b>' + kg(first.entryWeight) + ' kg (' + first.date + ')</b></div>' +
      '<div class="kv"><span>latest</span><b>' + kg(last.entryWeight) + ' kg (' + last.date + ')</b></div>' +
      '<div class="kv"><span>total change</span><b style="color:' + (delta<0?'#63e2b3':'#ff8b8b') + '">' + (delta>0?'+':'') + delta + ' kg</b></div>' +
      '<div class="kv"><span>avg / week</span><b>' + (perWeek>0?'+':'') + perWeek + ' kg</b></div>' +
      '<p class="sub">Improvement visible from first logged weight to latest.</p></div>';
  }

  function paintComp() {
    var prog = el("view-progress");
    if (!prog) return;
    var box = el("compBox");
    if (!box) {
      box = document.createElement("div");
      box.id = "compBox";
      var chart = el("progChart");
      if (chart && chart.parentNode) chart.parentNode.parentNode.insertBefore(box, chart.parentNode.nextSibling);
      else prog.appendChild(box);
    }
    box.innerHTML = comparisonHtml();
  }

  if (typeof showTab === "function" && !showTab._comp) {
    var _st = showTab;
    showTab = function (name) {
      _st(name);
      if (name === "progress" || name === "home") setTimeout(paintComp, 100);
    };
    showTab._comp = true;
  }
  setTimeout(paintComp, 1500);
})();
