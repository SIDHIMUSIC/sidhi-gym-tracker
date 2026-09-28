(function () {
  function el(id) { return document.getElementById(id); }

  var headLogout = el("logoutBtn");
  if (headLogout) {
    headLogout.style.display = "none";
    headLogout.classList.add("hidden");
  }
  var runHead = el("runOpenBtn");
  if (runHead) runHead.style.display = "none";
  var live = el("livebar");
  if (live) live.style.display = "none";
  var acts = document.querySelector(".head-actions");
  if (acts) {
    acts.querySelectorAll(".btn.run, #runOpenBtn").forEach(function (b) { b.style.display = "none"; });
  }

  function placeLogout() {
    if (el("pfLogout")) return;
    var view = el("view-profile");
    if (!view) return;
    var btn = document.createElement("button");
    btn.id = "pfLogout";
    btn.type = "button";
    btn.className = "btn danger";
    btn.textContent = "logout";
    btn.style.cssText = "position:absolute;top:10px;right:10px;min-height:36px;padding:8px 14px;z-index:2";
    var card = view.querySelector(".glass");
    if (card) {
      card.style.position = "relative";
      card.appendChild(btn);
    } else {
      view.style.position = "relative";
      view.appendChild(btn);
    }
    btn.onclick = function () {
      var src = el("logoutBtn");
      if (src && typeof src.onclick === "function") src.onclick();
      else if (src) src.click();
    };
  }

  var _sp = window.showProfile;
  window.showProfile = function () {
    if (typeof _sp === "function") _sp();
    placeLogout();
  };

  if (typeof afterAuth === "function" && !afterAuth._keep) {
    var _aa = afterAuth;
    afterAuth = async function () {
      try {
        await _aa();
      } catch (e) {
        if (typeof toast === "function") toast("Reconnect...");
        try { await _aa(); } catch (e2) {}
      }
    };
    afterAuth._keep = true;
  }

  var TOKEN_KEY = "sidhi-gym-token";
  var USER_KEY = "sidhi-gym-username";
  if ((!window.token || !token) && localStorage.getItem(TOKEN_KEY)) {
    try {
      token = localStorage.getItem(TOKEN_KEY) || "";
      username = localStorage.getItem(USER_KEY) || username || "";
    } catch (e) {}
  }
  if (typeof token !== "undefined" && token && el("app") && el("app").classList.contains("hidden")) {
    if (typeof afterAuth === "function") {
      afterAuth().catch(function () {});
    }
  }
})();
