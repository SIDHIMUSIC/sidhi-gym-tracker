// SIDHI GYM — Premium mode is controlled only by Vercel PREMIUM_MODE=YES/NO.
(function () {
  "use strict";
  function apply(flags) {
    window.SIDHI_PREMIUM_FLAGS = flags;
    window.SIDHI_PREMIUM_MODE_ENABLED = flags.modeEnabled === true;
    if (document.body) document.body.setAttribute("data-sidhi-premium-off", flags.modeEnabled === true ? "false" : "true");
    if (!document.getElementById("sidhiPremiumMasterOffStyle")) {
      var style = document.createElement("style");
      style.id = "sidhiPremiumMasterOffStyle";
      style.textContent = 'body[data-sidhi-premium-off="true"] #premiumBox, body[data-sidhi-premium-off="true"] #membershipCard, body[data-sidhi-premium-off="true"] #premBadge, body[data-sidhi-premium-off="true"] #adminGiftBox, body[data-sidhi-premium-off="true"] #adminListBtn, body[data-sidhi-premium-off="true"] #sidhiPremiumAdminControls, body[data-sidhi-premium-off="true"] .premium-tab { display:none !important; }';
      document.head.appendChild(style);
    }
    window.dispatchEvent(new CustomEvent("sidhi-premium-flags-updated", { detail: flags }));
  }
  function init() {
    fetch("/api/premium/features", { cache: "no-store" })
      .then(function (r) { return r.json(); })
      .then(function (flags) { apply(flags); })
      .catch(function () {
        // Fail closed: don't show Premium UI if the server mode cannot be confirmed.
        apply({ modeEnabled: false, masterEnabled: false, features: {} });
      });
  }
  window.addEventListener("load", init);
  init();
})();