(function () {
  var TG = "https://t.me/SANATANI_BACCHA";
  function uid(name) {
    var s = String(name || "").toLowerCase();
    var n = 2166136261;
    for (var i = 0; i < s.length; i++) n = Math.imul(n ^ s.charCodeAt(i), 16777619);
    return "S" + (n >>> 0).toString(16).toUpperCase().padStart(8, "0").slice(0, 8);
  }
  function openAdmin() {
    var user = ((document.getElementById("loginUser") || {}).value || "").trim().toLowerCase();
    var id = user ? uid(user) : "(username box me likho)";
    var text = "SIDHI GYM password reset%0Ausername: " + (user || "?") + "%0Auser id: " + id + "%0APlease set a new password.";
    window.open(TG + "?text=" + text, "_blank");
  }
  function hook() {
    var list = document.querySelectorAll("#gate .forgot, .forgot");
    for (var i = 0; i < list.length; i++) {
      list[i].onclick = function (e) {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        openAdmin();
      };
    }
  }
  hook();
  setInterval(hook, 600);
})();
