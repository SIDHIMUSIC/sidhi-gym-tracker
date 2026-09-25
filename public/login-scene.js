(function () {
  var gate = document.getElementById("gate");
  if (!gate) return;
  var old = document.getElementById("login-scene-css");
  if (old) old.remove();

  var st = document.createElement("style");
  st.id = "login-scene-css";
  st.textContent = [
    "#gate.gate{position:relative;overflow:hidden;min-height:100vh;display:grid;place-items:center;padding:28px 16px;background:#020308}",
    "#gate .scene{position:absolute;inset:0;pointer-events:none;z-index:0}",
    "#gate .aurora{position:absolute;inset:-20%;background:",
    "radial-gradient(ellipse at 20% 10%,rgba(255,80,180,.35),transparent 50%),",
    "radial-gradient(ellipse at 85% 20%,rgba(80,180,255,.28),transparent 45%),",
    "radial-gradient(ellipse at 50% 110%,rgba(240,194,122,.28),transparent 50%),",
    "radial-gradient(ellipse at 10% 80%,rgba(99,226,179,.18),transparent 40%);",
    "animation:auroraMove 12s ease-in-out infinite alternate;filter:blur(8px)}",
    "#gate .gridbg{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px);background-size:42px 42px;transform:perspective(500px) rotateX(58deg) translateY(28%);transform-origin:center bottom;opacity:.35;animation:gridDrift 16s linear infinite}",
    "#gate .orb{position:absolute;border-radius:50%;filter:blur(2px);opacity:.7}",
    "#gate .orb.a{width:180px;height:180px;left:-40px;top:12%;background:radial-gradient(circle,#ff8bd4aa,#ff8bd400 70%);animation:floatA 7s ease-in-out infinite}",
    "#gate .orb.b{width:220px;height:220px;right:-50px;bottom:8%;background:radial-gradient(circle,#63e2b3aa,#63e2b300 70%);animation:floatB 9s ease-in-out infinite}",
    "#gate .orb.c{width:120px;height:120px;right:18%;top:8%;background:radial-gradient(circle,#f0c27aaa,#f0c27a00 70%);animation:floatA 6s ease-in-out infinite reverse}",
    "#gate .sparks{position:absolute;inset:0}",
    "#gate .spark{position:absolute;width:3px;height:3px;border-radius:50%;background:#fff;box-shadow:0 0 8px #fff;animation:spark 3.8s linear infinite}",
    "#gate .glass.card{position:relative;z-index:3;width:min(400px,calc(100% - 28px));margin:0 auto;padding:26px 22px 20px;background:rgba(8,10,18,.72);border:1px solid rgba(240,194,122,.28);box-shadow:0 30px 80px #000c,0 0 0 1px #000,0 0 60px rgba(240,194,122,.12);backdrop-filter:blur(22px) saturate(160%);animation:cardIn .8s cubic-bezier(.2,1,.2,1) both}",
    "#gate .glass.card:before{content:\"\";position:absolute;inset:-1px;border-radius:28px;padding:1px;background:linear-gradient(135deg,#ff8bd4,#f0c27a,#63e2b3,#7ab8ff,#ff8bd4);background-size:300% 300%;animation:borderFlow 6s linear infinite;-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none}",
    "#gate .badge{letter-spacing:.28em;text-align:center;color:#f0c27a}",
    "#gate h1.brand{font-size:34px;text-align:center;margin:8px 0 2px}",
    "#gate #gateHint{text-align:center;margin:0 0 16px}",
    "#gate label{color:#f0c27a;letter-spacing:.16em;font-size:11px}",
    "#gate input{background:rgba(2,4,10,.7);border:1px solid rgba(240,194,122,.28);border-radius:16px;transition:border .2s,box-shadow .2s}",
    "#gate input:focus{outline:0;border-color:#f0c27a;box-shadow:0 0 0 3px rgba(240,194,122,.18),0 0 24px rgba(240,194,122,.2)}",
    "#gate .row{flex-direction:column;gap:10px;margin-top:18px}",
    "#gate #loginBtn{position:relative;overflow:hidden;min-height:58px;width:100%;flex:none;border:0;border-radius:999px;color:#140c04;font:800 16px Syne,Comfortaa,sans-serif;letter-spacing:.18em;text-transform:uppercase;background:linear-gradient(90deg,#ff8bd4,#f0c27a,#63e2b3,#7ab8ff,#ff8bd4);background-size:300% 100%;animation:btnFlow 3.2s linear infinite;box-shadow:0 12px 30px rgba(240,194,122,.35),0 0 24px rgba(255,139,212,.25)}",
    "#gate #loginBtn:after{content:\"\";position:absolute;top:0;left:-40%;width:30%;height:100%;background:linear-gradient(90deg,transparent,#fff8,transparent);transform:skewX(-20deg);animation:shine 2.2s ease-in-out infinite}",
    "#gate #loginBtn:active{transform:scale(.98)}",
    "#gate #setupBtn{width:100%;flex:none;min-height:50px;background:transparent;color:#ffe4b5;border:1px solid rgba(240,194,122,.35);box-shadow:none}",
    "@keyframes auroraMove{from{transform:translate3d(-4%,-2%,0) scale(1)}to{transform:translate3d(4%,3%,0) scale(1.08)}}",
    "@keyframes gridDrift{to{background-position:0 42px}}",
    "@keyframes floatA{0%,100%{transform:translateY(0)}50%{transform:translateY(-22px)}}",
    "@keyframes floatB{0%,100%{transform:translate(0,0)}50%{transform:translate(-16px,-18px)}}",
    "@keyframes spark{0%{transform:translateY(110vh);opacity:0}10%{opacity:1}90%{opacity:1}100%{transform:translateY(-10vh);opacity:0}}",
    "@keyframes cardIn{from{opacity:0;transform:translateY(28px) scale(.94)}to{opacity:1;transform:none}}",
    "@keyframes borderFlow{to{background-position:300% 0}}",
    "@keyframes btnFlow{to{background-position:300% 0}}",
    "@keyframes shine{0%{left:-40%}60%,100%{left:130%}}"
  ].join("");
  document.head.appendChild(st);

  var scene = gate.querySelector(".scene");
  if (scene) scene.remove();
  scene = document.createElement("div");
  scene.className = "scene";
  var sparks = "";
  for (var i = 0; i < 18; i++) {
    var left = Math.round(Math.random() * 100);
    var delay = (Math.random() * 3.6).toFixed(2);
    var dur = (2.8 + Math.random() * 2.4).toFixed(2);
    sparks += '<i class="spark" style="left:' + left + "%;animation-delay:" + delay + "s;animation-duration:" + dur + 's"></i>';
  }
  scene.innerHTML = '<div class="aurora"></div><div class="gridbg"></div><div class="orb a"></div><div class="orb b"></div><div class="orb c"></div><div class="sparks">' + sparks + "</div>";
  gate.insertBefore(scene, gate.firstChild);

  var hint = document.getElementById("gateHint");
  if (hint) hint.textContent = "Unlock your gym log.";
  var btn = document.getElementById("loginBtn");
  if (btn) btn.textContent = "ENTER";
})();
