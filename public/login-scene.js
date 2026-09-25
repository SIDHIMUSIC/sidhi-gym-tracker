(function () {
  var gate = document.getElementById("gate");
  if (!gate) return;
  var old = document.getElementById("login-scene-css");
  if (old) old.remove();

  var st = document.createElement("style");
  st.id = "login-scene-css";
  st.textContent = [
    "#gate.gate{position:relative;overflow:hidden;min-height:100vh;display:grid;place-items:center;padding:22px 14px;background:#02040c}",
    "#gate .scene{position:absolute;inset:0;pointer-events:none;z-index:0}",
    "#gate .aurora{position:absolute;inset:-18%;background:radial-gradient(ellipse at 18% 8%,rgba(56,189,248,.32),transparent 46%),radial-gradient(ellipse at 88% 18%,rgba(37,99,235,.28),transparent 42%),radial-gradient(ellipse at 50% 108%,rgba(14,165,233,.2),transparent 48%);animation:auroraMove 14s ease-in-out infinite alternate;filter:blur(10px)}",
    "#gate .bubbles i{position:absolute;bottom:-20px;border-radius:50%;background:rgba(56,189,248,.16);border:1px solid rgba(125,211,252,.2);animation:bubble 9s linear infinite}",
    "#gate .glass.card{position:relative;z-index:3;width:min(400px,calc(100% - 24px));margin:0 auto;padding:24px 20px 18px;background:rgba(6,10,22,.78);border:1px solid rgba(56,189,248,.22);box-shadow:0 30px 80px #000c,0 0 50px rgba(56,189,248,.12);backdrop-filter:blur(22px) saturate(170%);animation:cardIn .75s cubic-bezier(.2,1.2,.2,1) both}",
    "#gate .g-top{display:flex;align-items:center;gap:10px;margin-bottom:8px}",
    "#gate .back-btn{width:42px;height:42px;border-radius:50%;border:1px solid rgba(56,189,248,.28);background:rgba(255,255,255,.04);color:#7dd3fc;display:grid;place-items:center;cursor:pointer;position:relative;overflow:hidden}",
    "#gate .back-btn svg{transition:transform .35s cubic-bezier(.2,1.4,.2,1)}",
    "#gate .back-btn:hover svg,#gate .back-btn:active svg{transform:translateX(-4px)}",
    "#gate .badge{letter-spacing:.26em;text-align:center;color:#7dd3fc;flex:1}",
    "#gate h1.brand{font-size:32px;text-align:center;margin:4px 0 2px}",
    "#gate #gateHint{text-align:center;margin:0 0 14px;color:#93c5fd}",
    "#gate label{color:#7dd3fc;letter-spacing:.14em;font-size:11px}",
    "#gate input{background:rgba(2,6,16,.75);border:1px solid rgba(56,189,248,.22);border-radius:16px}",
    "#gate input:focus{outline:0;border-color:#38bdf8;box-shadow:0 0 0 3px rgba(56,189,248,.16)}",
    "#gate .pass-wrap{position:relative}",
    "#gate .eye-btn{position:absolute;right:8px;top:50%;transform:translateY(-50%);width:40px;height:40px;border:0;background:transparent;color:#7dd3fc;border-radius:50%;cursor:pointer}",
    "#gate .eye-btn.on{color:#38bdf8;box-shadow:0 0 16px rgba(56,189,248,.45)}",
    "#gate .row{flex-direction:column;gap:12px;margin-top:16px}",
    "#gate #loginBtn{position:relative;overflow:hidden;isolation:isolate;min-height:58px;width:100%;flex:none;border:0;border-radius:999px;color:#041018;font:800 15px Syne,Comfortaa,sans-serif;letter-spacing:.16em;text-transform:uppercase;background:linear-gradient(180deg,rgba(186,230,253,.95),rgba(56,189,248,.92) 55%,rgba(14,165,233,.95));box-shadow:0 12px 28px rgba(14,165,233,.35)}",
    "#gate #loginBtn .ui-label{position:relative;z-index:2}",
    "#gate #loginBtn .spin,#gate #loginBtn .check{display:none;position:relative;z-index:2}",
    "#gate #loginBtn.loading .ui-label{display:none}",
    "#gate #loginBtn.loading .spin{display:inline-block;width:18px;height:18px;border:2px solid #042033;border-top-color:transparent;border-radius:50%;animation:spin .7s linear infinite}",
    "#gate #loginBtn.ok .ui-label,#gate #loginBtn.ok .spin{display:none}",
    "#gate #loginBtn.ok .check{display:inline-block;font-size:22px;animation:pop .35s cubic-bezier(.2,1.6,.2,1)}",
    "#gate #loginBtn .ring{position:absolute;inset:-2px;border-radius:inherit;padding:2px;background:conic-gradient(from var(--ang,0deg),transparent 0 70%,#fff 78%,#38bdf8 100%);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;animation:spin 2.4s linear infinite;z-index:1}",
    "#gate #loginBtn .wave{position:absolute;inset:0;background:linear-gradient(90deg,transparent,#fff8,transparent);transform:translateX(-120%);pointer-events:none;z-index:1}",
    "#gate #loginBtn:hover .wave,#gate #loginBtn:active .wave{animation:wave 0.7s ease}",
    "#gate #loginBtn.press{transform:scale(.96)}",
    "#gate #loginBtn .rip{position:absolute;border-radius:50%;background:rgba(255,255,255,.35);transform:scale(0);animation:rip .55s ease-out forwards;pointer-events:none;z-index:1}",
    "#gate #setupBtn{position:relative;overflow:hidden;width:100%;flex:none;min-height:52px;background:rgba(8,16,32,.35);color:#e0f2fe;border:1px solid transparent;box-shadow:none;font:800 13px Comfortaa,sans-serif;letter-spacing:.08em}",
    "#gate #setupBtn:before{content:\"\";position:absolute;inset:0;border-radius:inherit;padding:1px;background:linear-gradient(90deg,#38bdf8,#818cf8,#22d3ee,#38bdf8);background-size:220% 100%;animation:borderFlow 3.4s linear infinite;-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude}",
    "#gate #setupBtn .arr{display:inline-block;margin-left:6px;transition:transform .35s cubic-bezier(.2,1.5,.2,1)}",
    "#gate #setupBtn:hover .arr,#gate #setupBtn.pop .arr{transform:translateX(7px)}",
    "#gate #setupBtn.pop{transform:scale(1.04)}",
    "#gate #setupBtn .dot{position:absolute;width:6px;height:6px;border-radius:50%;background:#7dd3fc;animation:dot .7s ease-out forwards;pointer-events:none}",
    "#gate .forgot{display:inline-flex;align-items:center;gap:6px;margin:8px 0 0;padding:0;border:0;background:none;color:#93c5fd;font:700 12px Comfortaa,sans-serif;cursor:pointer;position:relative}",
    "#gate .forgot .lk{transition:transform .4s}",
    "#gate .forgot:hover .lk,#gate .forgot:active .lk{transform:rotate(-18deg)}",
    "#gate .forgot:after{content:\"\";position:absolute;left:22px;right:0;bottom:-2px;height:1px;background:#38bdf8;transform:scaleX(0);transform-origin:left;transition:transform .35s}",
    "#gate .forgot:hover:after,#gate .forgot:active:after{transform:scaleX(1)}",
    "@media (prefers-reduced-motion:reduce){#gate *{animation:none !important;transition:none !important}}",
    "@keyframes auroraMove{from{transform:translate3d(-3%,-2%,0)}to{transform:translate3d(3%,2%,0)}}",
    "@keyframes bubble{0%{transform:translateY(0) scale(1);opacity:0}15%{opacity:.7}100%{transform:translateY(-110vh) scale(1.2);opacity:0}}",
    "@keyframes cardIn{from{opacity:0;transform:translateY(24px) scale(.96)}to{opacity:1;transform:none}}",
    "@keyframes spin{to{transform:rotate(360deg)}}",
    "@keyframes wave{from{transform:translateX(-120%)}to{transform:translateX(120%)}}",
    "@keyframes rip{to{transform:scale(18);opacity:0}}",
    "@keyframes pop{from{transform:scale(.4);opacity:0}to{transform:scale(1);opacity:1}}",
    "@keyframes borderFlow{to{background-position:220% 0}}",
    "@keyframes dot{to{transform:translate(var(--x),var(--y));opacity:0}}"
  ].join("");
  document.head.appendChild(st);

  var scene = gate.querySelector(".scene");
  if (scene) scene.remove();
  scene = document.createElement("div");
  scene.className = "scene";
  var html = '<div class="aurora"></div><div class="bubbles">';
  for (var i = 0; i < 14; i++) {
    var s = 8 + Math.round(Math.random() * 18);
    html += '<i style="left:' + Math.round(Math.random() * 100) + "%;width:" + s + "px;height:" + s + "px;animation-delay:" + (Math.random() * 6).toFixed(2) + "s;animation-duration:" + (7 + Math.random() * 5).toFixed(2) + 's"></i>';
  }
  html += "</div>";
  scene.innerHTML = html;
  gate.insertBefore(scene, gate.firstChild);

  var card = gate.querySelector(".glass.card");
  if (card && !card.querySelector(".g-top")) {
    var top = document.createElement("div");
    top.className = "g-top";
    top.innerHTML = '<button type="button" class="back-btn" id="gateBack" aria-label="back"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M15 6l-6 6 6 6"/></svg></button>';
    var badge = card.querySelector(".badge");
    if (badge) {
      card.insertBefore(top, badge);
      top.appendChild(badge);
    }
  }

  var pass = document.getElementById("loginPass");
  if (pass && !gate.querySelector(".pass-wrap")) {
    var wrap = document.createElement("div");
    wrap.className = "pass-wrap";
    pass.parentNode.insertBefore(wrap, pass);
    wrap.appendChild(pass);
    var eye = document.createElement("button");
    eye.type = "button";
    eye.className = "eye-btn";
    eye.id = "gateEye";
    eye.setAttribute("aria-label", "show password");
    eye.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
    wrap.appendChild(eye);
    eye.onclick = function () {
      var on = pass.type === "password";
      pass.type = on ? "text" : "password";
      eye.classList.toggle("on", on);
    };
  }

  if (!gate.querySelector(".forgot")) {
    var fg = document.createElement("button");
    fg.type = "button";
    fg.className = "forgot";
    fg.innerHTML = '<span class="lk">🔒</span> forgot password';
    var row = gate.querySelector(".row");
    if (row) row.parentNode.insertBefore(fg, row);
    fg.onclick = function () {
      if (typeof toast === "function") toast("Ask admin to reset password");
    };
  }

  var loginBtn = document.getElementById("loginBtn");
  if (loginBtn && !loginBtn.querySelector(".ui-label")) {
    loginBtn.innerHTML = '<span class="ring"></span><span class="wave"></span><span class="ui-label">ENTER</span><span class="spin"></span><span class="check">✓</span>';
  }
  var setupBtn = document.getElementById("setupBtn");
  if (setupBtn && setupBtn.textContent.indexOf("→") < 0) {
    setupBtn.innerHTML = "CREATE ACCOUNT <span class=\"arr\">→</span>";
  }

  function ripple(btn, e) {
    var r = btn.getBoundingClientRect();
    var x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
    var y = (e.touches ? e.touches[0].clientY : e.clientY) - r.top;
    var d = document.createElement("span");
    d.className = "rip";
    d.style.left = x + "px";
    d.style.top = y + "px";
    d.style.width = d.style.height = "12px";
    btn.appendChild(d);
    setTimeout(function () { d.remove(); }, 560);
  }
  function particles(btn) {
    for (var i = 0; i < 8; i++) {
      var d = document.createElement("span");
      d.className = "dot";
      var ang = (Math.PI * 2 * i) / 8;
      d.style.left = "50%"; d.style.top = "50%";
      d.style.setProperty("--x", Math.round(Math.cos(ang) * 46) + "px");
      d.style.setProperty("--y", Math.round(Math.sin(ang) * 28) + "px");
      btn.appendChild(d);
      setTimeout(function (n) { return function () { n.remove(); }; }(d), 700);
    }
  }

  if (loginBtn && !loginBtn.dataset.ui) {
    loginBtn.dataset.ui = "1";
    loginBtn.addEventListener("pointerdown", function (e) {
      loginBtn.classList.add("press");
      ripple(loginBtn, e);
    });
    loginBtn.addEventListener("pointerup", function () { loginBtn.classList.remove("press"); });
    loginBtn.addEventListener("click", function () {
      loginBtn.classList.add("loading");
      setTimeout(function () {
        loginBtn.classList.remove("loading");
        loginBtn.classList.add("ok");
      }, 520);
    });
  }
  if (setupBtn && !setupBtn.dataset.ui) {
    setupBtn.dataset.ui = "1";
    setupBtn.addEventListener("click", function () {
      setupBtn.classList.add("pop");
      particles(setupBtn);
      setTimeout(function () { setupBtn.classList.remove("pop"); }, 380);
    });
  }
  var back = document.getElementById("gateBack");
  if (back) {
    back.addEventListener("pointerdown", function (e) { ripple(back, e); });
    back.onclick = function () {
      var u = document.getElementById("loginUser");
      var p = document.getElementById("loginPass");
      if (u) u.value = "";
      if (p) p.value = "";
    };
  }

  var hint = document.getElementById("gateHint");
  if (hint) hint.textContent = "Premium gym access.";
})();
