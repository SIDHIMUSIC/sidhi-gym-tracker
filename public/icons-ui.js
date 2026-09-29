(function () {
  if (document.getElementById("icons-ui-css")) return;
  var clock = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><circle cx='12' cy='12' r='9.2' fill='none' stroke='white' stroke-width='1.8'/><path d='M12 7v5.2l3.2 2' fill='none' stroke='white' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/><circle cx='12' cy='12' r='1.2' fill='white'/></svg>\")";
  var cal = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><rect x='3.5' y='5' width='17' height='15.5' rx='2.5' fill='none' stroke='white' stroke-width='1.8'/><path d='M8 3.5v4M16 3.5v4M3.5 10h17' fill='none' stroke='white' stroke-width='1.8' stroke-linecap='round'/></svg>\")";
  var st = document.createElement("style");
  st.id = "icons-ui-css";
  st.textContent =
    "input[type=time],input[type=date]{color-scheme:dark;padding-right:44px;background-position:right 12px center;background-repeat:no-repeat;background-size:22px}" +
    "input[type=time]{background-image:" + clock + "}" +
    "input[type=date]{background-image:" + cal + "}" +
    "input[type=time]::-webkit-calendar-picker-indicator,input[type=date]::-webkit-calendar-picker-indicator{" +
    "opacity:1;filter:invert(1) brightness(2);width:22px;height:22px;cursor:pointer;background:transparent}" +
    "#tgShare,.tg-btn{display:inline-flex!important;align-items:center;justify-content:center;gap:8px;" +
    "background:#229ED9!important;color:#fff!important;border:0;box-shadow:0 8px 18px #229ed955;min-height:46px}" +
    ".soc a[href*='t.me'] svg{filter:drop-shadow(0 2px 6px #229ed9aa)}";
  document.head.appendChild(st);

  function dressTg() {
    var btn = document.getElementById("tgShare");
    if (!btn || btn.dataset.icon) return;
    btn.dataset.icon = "1";
    btn.classList.add("tg-btn");
    btn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18"><circle cx="12" cy="12" r="12" fill="#fff"/><path fill="#229ED9" d="M5.4 11.8l11.7-4.5c.5-.2 1 .1.8.9l-2 9.3c-.1.7-.6.8-1.1.5l-3-2.2-1.5 1.4c-.2.2-.3.3-.6.3l.2-3.1 5.6-5.1c.2-.2 0-.3-.3-.1l-7 4.4-3-.9c-.6-.2-.6-.6.2-.8z"/></svg> Telegram';
  }
  dressTg();
  setInterval(dressTg, 1200);
})();
