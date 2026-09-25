(function () {
  var IG = '<svg viewBox="0 0 24 24" width="22" height="22"><defs><radialGradient id="ig" cx="30%" cy="107%" r="150%"><stop offset="0" stop-color="#fdf497"/><stop offset=".5" stop-color="#fd5949"/><stop offset="1" stop-color="#d6249f"/></radialGradient></defs><rect x="2" y="2" width="20" height="20" rx="6" fill="url(#ig)"/><circle cx="12" cy="12" r="5" fill="none" stroke="#fff" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1.3" fill="#fff"/></svg>';
  var TG = '<svg viewBox="0 0 24 24" width="22" height="22"><circle cx="12" cy="12" r="12" fill="#229ED9"/><path fill="#fff" d="M5.4 11.8l11.7-4.5c.5-.2 1 .1.8.9l-2 9.3c-.1.7-.6.8-1.1.5l-3-2.2-1.5 1.4c-.2.2-.3.3-.6.3l.2-3.1 5.6-5.1c.2-.2 0-.3-.3-.1l-7 4.4-3-.9c-.6-.2-.6-.6.2-.8z"/></svg>';
  var GH = '<svg viewBox="0 0 24 24" width="22" height="22"><circle cx="12" cy="12" r="12" fill="#fff"/><path fill="#181717" d="M12 3.1c-5 0-9 4-9 9 0 4 2.6 7.4 6.2 8.6.5.1.6-.2.6-.4v-1.5c-2.5.5-3-1.2-3-1.2-.4-1-1-1.3-1-1.3-.8-.6.1-.6.1-.6.9.1 1.4 1 1.4 1 .8 1.4 2.2 1 2.7.8.1-.6.3-1 .6-1.2-2-.2-4.1-1-4.1-4.5 0-1 .4-1.8 1-2.4-.1-.2-.4-1.2.1-2.5 0 0 .8-.3 2.5 1a8.7 8.7 0 014.6 0c1.7-1.3 2.5-1 2.5-1 .5 1.3.2 2.3.1 2.5.6.6 1 1.4 1 2.4 0 3.5-2.1 4.3-4.1 4.5.3.3.6.8.6 1.7v2.5c0 .2.2.5.6.4A9 9 0 0021 12.1c0-5-4-9-9-9z"/></svg>';
  function logos() {
    return '<div class="soc"><a href="https://www.instagram.com/harryashu_/" target="_blank" rel="noopener">' + IG + '<span>Instagram</span></a><a href="https://t.me/SANATANI_BACHA" target="_blank" rel="noopener">' + TG + '<span>Telegram</span></a><a href="https://github.com/SIDHIMUSIC" target="_blank" rel="noopener">' + GH + '<span>GitHub</span></a></div>';
  }
  if (!document.getElementById("gf-css")) {
    var s = document.createElement("style");
    s.id = "gf-css";
    s.textContent = ".soc{display:flex;justify-content:center;gap:16px;margin:10px 0;flex-wrap:wrap}.soc a{display:flex;flex-direction:column;align-items:center;gap:4px;color:#cfe8ff;text-decoration:none;font-size:11px;min-width:64px}.soc svg{display:block}.wgt-card{margin-top:8px;font-size:13px;color:#ffe4b5}";
    document.head.appendChild(s);
  }
  var foot = document.getElementById("sidhiFoot");
  if (foot) foot.innerHTML = "<b>SIDHI GYM TRACKER</b><div>Built with ❤️ by Harry</div>" + logos() + "<div>© 2026 SIDHI GYM TRACKER. All rights reserved.</div>";
  if (!document.querySelector('script[src*="timing-fix.js"]')) {
    var t = document.createElement("script");
    t.src = "timing-fix.js?v=2";
    document.body.appendChild(t);
  }
})();
