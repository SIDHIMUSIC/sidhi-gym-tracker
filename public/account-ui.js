(function () {
  function fancy(s) {
    var m = { a: "ᴀ", b: "ʙ", c: "ᴄ", d: "ᴅ", e: "ᴇ", f: "ꜰ", g: "ɢ", h: "ʜ", i: "ɪ", j: "ᴊ", k: "ᴋ", l: "ʟ", m: "ᴍ", n: "ɴ", o: "ᴏ", p: "ᴘ", q: "ǫ", r: "ʀ", s: "s", t: "ᴛ", u: "ᴜ", v: "ᴠ", w: "ᴡ", x: "x", y: "ʏ", z: "ᴢ" };
    return String(s).replace(/[A-Za-z]/g, function (ch) { return m[ch.toLowerCase()] || ch; });
  }
  function mount() {
    var tab = document.getElementById("tab-profile");
    if (!tab || document.getElementById("pfDelete")) return;
    var box = document.createElement("div");
    box.className = "glass card";
    box.id = "pfDanger";
    box.style.marginTop = "14px";
    box.innerHTML =
      "<p class=\"badge\">" + fancy("account") + "</p>" +
      "<p class=\"sub\">" + fancy("delete account and all gym + run history. this cannot be undone.") + "</p>" +
      "<button type=\"button\" class=\"btn ghost full\" id=\"pfDelete\" style=\"margin-top:10px;border-color:rgba(251,113,133,.5);color:#fb7185\">" +
      fancy("delete account") + "</button>";
    tab.appendChild(box);
    document.getElementById("pfDelete").onclick = onDelete;
  }
  async function onDelete() {
    if (!confirm("Account + saari history delete ho jayegi. Sure?")) return;
    if (!confirm("Last confirm: delete forever?")) return;
    try {
      await api("/api/me", { method: "DELETE" });
    } catch (e) {
      if (typeof toast === "function") toast((e && e.message) || "Delete fail");
      return;
    }
    try { localStorage.removeItem("sidhiToken"); } catch (e) {}
    try { localStorage.removeItem("sidhi-gym-sessions"); } catch (e) {}
    if (typeof token !== "undefined") try { token = ""; } catch (e) {}
    if (typeof toast === "function") toast(fancy("account deleted"));
    if (typeof showAuth === "function") showAuth();
    else location.reload();
  }
  setInterval(mount, 1200);
  mount();
})();
