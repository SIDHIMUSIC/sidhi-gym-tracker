(function () {
  var gate = document.getElementById("gate");
  if (!gate || document.getElementById("login-scene-css")) return;
  var st = document.createElement("style");
  st.id = "login-scene-css";
  st.textContent = [
    "#gate.gate{position:relative;overflow:hidden;align-items:stretch;justify-items:stretch;padding:0;background:#05070c}",
    "#gate .scene{position:absolute;inset:0;pointer-events:none;z-index:0}",
    "#gate .sky{position:absolute;inset:0;background:radial-gradient(ellipse at 18% 72%,#1a140c 0%,#070b12 42%,#030408 100%)}",
    "#gate .stars{position:absolute;inset:0;background-image:radial-gradient(1px 1px at 12% 18%,#fff8,transparent),radial-gradient(1px 1px at 40% 12%,#fff6,transparent),radial-gradient(1.5px 1.5px at 72% 22%,#fff7,transparent),radial-gradient(1px 1px at 88% 40%,#fff5,transparent),radial-gradient(1px 1px at 30% 40%,#fff4,transparent)}",
    "#gate .lighthouse{position:absolute;left:8%;bottom:8%;width:54px;height:210px;z-index:2}",
    "#gate .lh-body{position:absolute;left:50%;bottom:0;width:34px;height:170px;transform:translateX(-50%);background:repeating-linear-gradient(#f3efe6 0 28px,#1b1b1b 28px 52px);clip-path:polygon(18% 0,82% 0,100% 100%,0 100%);border-radius:2px 2px 0 0;box-shadow:0 0 24px #000}",
    "#gate .lh-top{position:absolute;left:50%;bottom:168px;width:28px;height:22px;transform:translateX(-50%);background:#111;border-radius:3px 3px 0 0}",
    "#gate .lh-lamp{position:absolute;left:50%;bottom:186px;width:16px;height:16px;transform:translateX(-50%);background:#ffe7a3;border-radius:50%;box-shadow:0 0 18px 8px #ffd36a,0 0 40px 16px #f0c27a88;animation:lamp 2.4s ease-in-out infinite}",
    "#gate .beam{position:absolute;left:calc(8% + 36px);bottom:198px;width:min(70vw,420px);height:90px;transform-origin:0 50%;background:linear-gradient(90deg,rgba(255,220,140,.55),rgba(255,200,90,.12) 55%,transparent);clip-path:polygon(0 42%,100% 0,100% 100%,0 58%);filter:blur(0.4px);animation:sweep 4.6s ease-in-out infinite;opacity:.9}",
    "@keyframes sweep{0%,100%{transform:rotate(-8deg);opacity:.55}50%{transform:rotate(18deg);opacity:1}}",
    "@keyframes lamp{50%{box-shadow:0 0 28px 12px #ffe08a,0 0 60px 22px #f0c27a66}}",
    "#gate .glass.card{position:relative;z-index:3;margin:auto;width:min(380px,calc(100% - 36px));padding:22px 20px 18px;background:rgba(12,16,22,.78);border:1px solid rgba(240,194,122,.22);box-shadow:0 20px 60px #000a,0 0 0 1px #000;animation:cardIn .7s ease both .15s}",
    "@keyframes cardIn{from{opacity:0;transform:translateY(16px) scale(.98)}to{opacity:1;transform:none}}",
    "#gate .badge{letter-spacing:.2em}",
    "#gate h1.brand{font-size:28px;margin-top:4px}",
    "#gate #loginBtn{background:linear-gradient(180deg,#f0c27a,#c9923d);color:#1a1206;box-shadow:0 10px 24px #f0c27a33}",
    "#app.hidden + * {}"
  ].join("");
  document.head.appendChild(st);
  if (!gate.querySelector(".scene")) {
    var scene = document.createElement("div");
    scene.className = "scene";
    scene.innerHTML = '<div class="sky"></div><div class="stars"></div><div class="beam"></div><div class="lighthouse"><div class="lh-body"></div><div class="lh-top"></div><div class="lh-lamp"></div></div>';
    gate.insertBefore(scene, gate.firstChild);
  }
  var hint = document.getElementById("gateHint");
  if (hint) hint.textContent = "Welcome back. Sign in to continue.";
})();
