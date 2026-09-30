(function () {
  function fancy(s) {
    var m = { a: "ᴀ", b: "ʙ", c: "ᴄ", d: "ᴅ", e: "ᴇ", f: "ꜰ", g: "ɢ", h: "ʜ", i: "ɪ", j: "ᴊ", k: "ᴋ", l: "ʟ", m: "ᴍ", n: "ɴ", o: "ᴏ", p: "ᴘ", q: "ǫ", r: "ʀ", s: "s", t: "ᴛ", u: "ᴜ", v: "ᴠ", w: "ᴡ", x: "x", y: "ʏ", z: "ᴢ" };
    return String(s).replace(/[A-Za-z]/g, function (ch) { return m[ch.toLowerCase()] || ch; });
  }
  if (!document.getElementById("acc-del-css")) {
    var st = document.createElement("style");
    st.id = "acc-del-css";
    st.textContent =
      "#delModal{position:fixed;inset:0;z-index:80;background:rgba(2,6,14,.72);backdrop-filter:blur(10px);display:grid;place-items:center;padding:18px;animation:delIn .25s ease}" +
      "@keyframes delIn{from{opacity:0}to{opacity:1}}@keyframes delUp{from{transform:translateY(28px) scale(.96);opacity:0}to{transform:none;opacity:1}}" +
      "#delModal .sheet{width:min(420px,100%);border-radius:28px;padding:22px 18px 18px;background:linear-gradient(180deg,#141c2c,#0b1220);border:1px solid rgba(251,113,133,.35);box-shadow:0 20px 50px #0008;animation:delUp .32s ease}" +
      "#delModal h3{margin:0 0 8px;font:800 20px Syne,sans-serif;color:#ff8b8b}" +
      "#delModal .warn{color:#f6f1e8;line-height:1.45;margin:0 0 16px}" +
      "#delPass{min-height:52px;margin:8px 0 14px}";
    document.head.appendChild(st);
  }
  function injectBtn() {
    var v = document.getElementById("view-profile");
    if (!v || v.classList.contains("hidden")) return;
    if (document.getElementById("pfDelete")) return;
    var box = document.createElement("div");
    box.className = "glass card";
    box.id = "pfDanger";
    box.innerHTML =
      "<h2>" + fancy("danger zone") + "</h2>" +
      "<p class=\"sub\">" + fancy("delete account + gym + run history forever") + "</p>" +
      "<button type=\"button\" class=\"btn full\" id=\"pfDelete\" style=\"margin-top:12px;background:linear-gradient(135deg,#ff6b6b,#c0392b);color:#fff\">" +
      fancy("delete account") + "</button>";
    v.appendChild(box);
    document.getElementById("pfDelete").onclick = openConfirm;
  }
  function closeModal() {
    var m = document.getElementById("delModal");
    if (m) m.remove();
  }
  function openConfirm() {
    closeModal();
    var m = document.createElement("div");
    m.id = "delModal";
    m.innerHTML =
      '<div class="sheet">' +
      "<h3>" + fancy("delete account?") + "</h3>" +
      '<p class="warn">' + fancy("all workouts, runs, weight and login will go. this cannot be undone.") + "</p>" +
      '<div class="row">' +
      '<button type="button" class="btn ghost full" id="delNo">' + fancy("no keep it") + "</button>" +
      '<button type="button" class="btn full" id="delYes" style="background:linear-gradient(135deg,#ff6b6b,#c0392b);color:#fff">' + fancy("yes") + "</button>" +
      "</div></div>";
    document.body.appendChild(m);
    document.getElementById("delNo").onclick = closeModal;
    m.addEventListener("click", function (e) { if (e.target === m) closeModal(); });
    document.getElementById("delYes").onclick = openPass;
  }
  function openPass() {
    var sheet = document.querySelector("#delModal .sheet");
    if (!sheet) return;
    sheet.innerHTML =
      "<h3>" + fancy("enter password") + "</h3>" +
      '<p class="warn">' + fancy("password sahi ho tab hi account delete hoga") + "</p>" +
      '<label>' + fancy("password") + '</label>' +
      '<input id="delPass" type="password" autocomplete="current-password" placeholder="password" />' +
      '<div class="row">' +
      '<button type="button" class="btn ghost full" id="delNo2">' + fancy("cancel") + "</button>" +
      '<button type="button" class="btn full" id="delGo" style="background:linear-gradient(135deg,#ff6b6b,#c0392b);color:#fff">' + fancy("delete now") + "</button>" +
      "</div>";
    document.getElementById("delNo2").onclick = closeModal;
    document.getElementById("delGo").onclick = doDelete;
    var inp = document.getElementById("delPass");
    if (inp) inp.focus();
  }
  async function doDelete() {
    var pass = (document.getElementById("delPass") || {}).value || "";
    if (pass.length < 4) {
      if (typeof toast === "function") toast("Password likho");
      return;
    }
    var go = document.getElementById("delGo");
    if (go) { go.disabled = true; go.textContent = fancy("deleting"); }
    try {
      await api("/api/me", { method: "DELETE", body: { password: pass } });
    } catch (e) {
      if (go) { go.disabled = false; go.textContent = fancy("delete now"); }
      if (typeof toast === "function") toast((e && e.message) || "Galat password");
      return;
    }
    closeModal();
    try { localStorage.removeItem("sidhi-gym-token"); } catch (e) {}
    try { localStorage.removeItem("sidhi-gym-username"); } catch (e) {}
    try { localStorage.removeItem("sidhi-gym-sessions"); } catch (e) {}
    if (typeof token !== "undefined") try { token = ""; } catch (e) {}
    if (typeof toast === "function") toast(fancy("account deleted"));
    setTimeout(function () { location.reload(); }, 600);
  }
  if (typeof showProfile === "function" && !showProfile._del) {
    var _sp = showProfile;
    showProfile = function () {
      _sp();
      setTimeout(injectBtn, 0);
    };
    showProfile._del = true;
  }
  setInterval(injectBtn, 800);
  injectBtn();
})();
