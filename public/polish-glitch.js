(function () {
  if (!document.getElementById("polish-glitch-css")) {
    var s = document.createElement("style");
    s.id = "polish-glitch-css";
    s.textContent =
      "*{ -webkit-tap-highlight-color:transparent; }" +
      "button,a,.tab,.forgot{ cursor:pointer; }" +
      "#runOpenBtn,.livebar,.head-actions .btn.run{ display:none !important; }" +
      ".toast{ pointer-events:none; }";
    document.head.appendChild(s);
  }
})();
