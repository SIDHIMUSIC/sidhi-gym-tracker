(function () {
  function fancy(s) {
    var m = { a: "ᴀ", b: "ʙ", c: "ᴄ", d: "ᴅ", e: "ᴇ", f: "ꜰ", g: "ɢ", h: "ʜ", i: "ɪ", j: "ᴊ", k: "ᴋ", l: "ʟ", m: "ᴍ", n: "ɴ", o: "ᴏ", p: "ᴘ", q: "ǫ", r: "ʀ", s: "s", t: "ᴛ", u: "ᴜ", v: "ᴠ", w: "ᴡ", x: "x", y: "ʏ", z: "ᴢ" };
    return String(s).replace(/[A-Za-z]/g, function (ch) { return m[ch.toLowerCase()] || ch; });
  }
  function splitBox(box) {
    if (!box) return;
    var list = box.querySelector(".ex-list");
    if (!list || box.querySelector(".ex-sec")) return;
    var cards = Array.prototype.slice.call(list.querySelectorAll(".ex-card"));
    if (cards.length < 4) return;
    var abs = cards.slice(-3);
    var main = cards.slice(0, -3);
    var h1 = document.createElement("p"); h1.className = "ex-sec"; h1.textContent = fancy("exercises");
    var h2 = document.createElement("p"); h2.className = "ex-sec"; h2.textContent = fancy("abs");
    var l1 = document.createElement("div"); l1.className = "ex-list";
    var l2 = document.createElement("div"); l2.className = "ex-list";
    main.forEach(function (c, i) { var n = c.querySelector(".ex-no"); if (n) n.textContent = i + 1; l1.appendChild(c); });
    abs.forEach(function (c, i) { var n = c.querySelector(".ex-no"); if (n) n.textContent = i + 1; l2.appendChild(c); });
    list.parentNode.insertBefore(h1, list);
    list.parentNode.insertBefore(l1, list);
    list.parentNode.insertBefore(h2, list);
    list.parentNode.insertBefore(l2, list);
    list.remove();
    var sub = box.querySelector(".sub");
    if (sub && /last 3/.test(sub.textContent.toLowerCase() + sub.textContent)) sub.remove();
  }
  function go() {
    splitBox(document.getElementById("exGuideHome"));
    splitBox(document.getElementById("exGuideWork"));
  }
  var _ph = window.paintHome;
  if (typeof _ph === "function") window.paintHome = function () { _ph(); setTimeout(go, 0); };
  setTimeout(go, 300);
  setInterval(go, 1500);
})();
