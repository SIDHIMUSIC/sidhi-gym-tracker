(function () {
  var TG = "https://t.me/SANATANI_BACCHA";
  function uid(name) {
    var s = String(name || "").toLowerCase();
    var n = 2166136261;
    for (var i = 0; i < s.length; i++) n = Math.imul(n ^ s.charCodeAt(i), 16777619);
    return "S" + (n >>> 0).toString(16).toUpperCase().padStart(8, "0").slice(0, 8);
  }
  function openAdmin() {
    var t = document.getElementById("toast");
    if (t) t.style.display = "none";
    var user = ((document.getElementById("loginUser") || {}).value || "").trim().toLowerCase();
    if (!user) {
      if (typeof toast === "function") toast("Pehle username likho");
      var box = document.getElementById("loginUser");
      if (box) box.focus();
      return;
    }
    var text = "SIDHI GYM password reset%0Ausername: " + user + "%0Auser id: " + uid(user) + "%0APlease set a new password.";
    window.location.href = TG + "?text=" + text;
  }
  function hook() {
    var list = document.querySelectorAll("#gate .forgot");
    for (var i = 0; i < list.length; i++) {
      list[i].onclick = function (e) {
        if (e) { e.preventDefault(); e.stopImmediatePropagation(); }
        openAdmin();
      };
    }
  }
  hook();
  setTimeout(hook, 200);
  setTimeout(hook, 800);
})();
