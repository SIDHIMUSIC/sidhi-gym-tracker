(function () {
  var TG = "https://t.me/SANATANI_BACCHA";
  function uid(name) {
    var s = String(name || "").toLowerCase();
    var n = 2166136261;
    for (var i = 0; i < s.length; i++) n = Math.imul(n ^ s.charCodeAt(i), 16777619);
    return "S" + (n >>> 0).toString(16).toUpperCase().padStart(8, "0").slice(0, 8);
  }
  function send(lines) {
    var t = document.getElementById("toast");
    if (t) t.style.display = "none";
    window.location.href = TG + "?text=" + encodeURIComponent(lines.join("\n"));
  }
  function closeSheet() {
    var m = document.getElementById("forgotSheet");
    if (m) m.remove();
  }
  function sheet(html) {
    closeSheet();
    var m = document.createElement("div");
    m.id = "forgotSheet";
    m.style.cssText = "position:fixed;inset:0;z-index:90;background:rgba(2,6,14,.75);display:grid;place-items:end center;padding:16px";
    m.innerHTML = '<div style="width:min(420px,100%);background:#121a2b;border-radius:24px;padding:18px;border:1px solid rgba(56,189,248,.28)">' + html + "</div>";
    document.body.appendChild(m);
    m.addEventListener("click", function (e) { if (e.target === m) closeSheet(); });
    return m;
  }
  function openMenu() {
    sheet(
      "<p class=\"badge\">forgot</p>" +
      "<p class=\"sub\">Kya bhool gaye?</p>" +
      '<button type="button" class="btn full" id="fgPass" style="margin-top:12px">password forgot</button>' +
      '<button type="button" class="btn ghost full" id="fgUser" style="margin-top:8px">username forgot</button>' +
      '<button type="button" class="btn ghost full" id="fgNo" style="margin-top:8px">cancel</button>'
    );
    document.getElementById("fgNo").onclick = closeSheet;
    document.getElementById("fgPass").onclick = function () {
      var user = ((document.getElementById("loginUser") || {}).value || "").trim().toLowerCase();
      if (!user) {
        sheet(
          "<p class=\"badge\">password forgot</p>" +
          "<p class=\"sub\">Username ya apna name likho.</p>" +
          '<label>username</label><input id="fgU" />' +
          '<label>full name</label><input id="fgN" placeholder="Ashutosh" />' +
          '<button type="button" class="btn full" id="fgGo" style="margin-top:12px">message admin</button>' +
          '<button type="button" class="btn ghost full" id="fgBack" style="margin-top:8px">back</button>'
        );
        document.getElementById("fgBack").onclick = openMenu;
        document.getElementById("fgGo").onclick = function () {
          var u = (document.getElementById("fgU").value || "").trim().toLowerCase();
          var n = (document.getElementById("fgN").value || "").trim();
          send([
            "SIDHI GYM — password forgot",
            "username: " + (u || "?"),
            "name: " + (n || "?"),
            u ? "user id: " + uid(u) : "user id: n/a",
            "Please reset password."
          ]);
        };
        return;
      }
      send([
        "SIDHI GYM — password forgot",
        "username: " + user,
        "user id: " + uid(user),
        "Please reset password."
      ]);
    };
    document.getElementById("fgUser").onclick = function () {
      sheet(
        "<p class=\"badge\">username forgot</p>" +
        "<p class=\"sub\">Apna name likho. Admin list se username nikalega.</p>" +
        '<label>full name</label><input id="fgName" placeholder="Ashutosh" />' +
        '<label>koi hint (optional)</label><input id="fgHint" placeholder="gym time / city" />' +
        '<button type="button" class="btn full" id="fgGoU" style="margin-top:12px">message admin</button>' +
        '<button type="button" class="btn ghost full" id="fgBack2" style="margin-top:8px">back</button>'
      );
      document.getElementById("fgBack2").onclick = openMenu;
      document.getElementById("fgGoU").onclick = function () {
        var n = (document.getElementById("fgName").value || "").trim();
        var h = (document.getElementById("fgHint").value || "").trim();
        if (!n) {
          if (typeof toast === "function") toast("Name likho");
          return;
        }
        send([
          "SIDHI GYM — username forgot",
          "name: " + n,
          h ? "hint: " + h : "hint: -",
          "Please send my username."
        ]);
      };
    };
  }
  function hook() {
    var list = document.querySelectorAll("#gate .forgot, #forgotBtn");
    for (var i = 0; i < list.length; i++) {
      list[i].onclick = function (e) {
        if (e) { e.preventDefault(); e.stopImmediatePropagation(); }
        openMenu();
      };
    }
  }
  hook();
  setTimeout(hook, 200);
  setTimeout(hook, 900);
})();
