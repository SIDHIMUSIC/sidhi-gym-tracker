(function () {
  function uid(name) {
    var s = String(name || "").toLowerCase();
    var n = 2166136261;
    for (var i = 0; i < s.length; i++) n = Math.imul(n ^ s.charCodeAt(i), 16777619);
    return "S" + (n >>> 0).toString(16).toUpperCase().padStart(8, "0").slice(0, 8);
  }
  function inject() {
    var v = document.getElementById("view-profile");
    if (!v || v.classList.contains("hidden")) return;
    if (v.querySelector("#pfUid")) return;
    var name = (typeof username === "string" && username) || "";
    var id = uid(name);
    var row = document.createElement("div");
    row.className = "kv";
    row.id = "pfUid";
    row.innerHTML = "<span>user id</span><b>" + id + "</b>";
    var firstKv = v.querySelector(".kv");
    if (firstKv && firstKv.parentNode) firstKv.parentNode.insertBefore(row, firstKv);
    else v.appendChild(row);
  }
  if (typeof showProfile === "function" && !showProfile._uid) {
    var _sp = showProfile;
    showProfile = function () {
      _sp();
      setTimeout(inject, 0);
    };
    showProfile._uid = true;
  }
  setInterval(inject, 1000);
})();
