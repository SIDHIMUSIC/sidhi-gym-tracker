(function () {
  var days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  function lock() {
    if (!window.SIDHI_PLAN || typeof SPLIT !== "object") return;
    days.forEach(function (d) {
      if (window.SIDHI_PLAN[d]) SPLIT[d] = window.SIDHI_PLAN[d].title;
    });
  }
  setInterval(lock, 400);
})();
