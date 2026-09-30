(function () {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js?v=4").catch(function () {});
  }
  function clean() {
    var back = document.getElementById("gateBack");
    if (back) back.remove();
    document.querySelectorAll("#gate .back-btn").forEach(function (n) { n.remove(); });
    var badge = document.querySelector("#gate .badge");
    if (badge) {
      badge.textContent = "TRAIN HARD  •  LOG EASY";
      badge.style.textAlign = "center";
      badge.style.display = "block";
      badge.style.width = "100%";
    }
    var top = document.querySelector("#gate .g-top");
    if (top && badge && top.contains(badge)) {
      top.parentNode.insertBefore(badge, top);
      top.remove();
    }
  }
  clean();
  setTimeout(clean, 30);
  setTimeout(clean, 300);
})();
