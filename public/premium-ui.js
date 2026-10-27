// Sidhi Gym — Premium UI
(function () {
  const PREMIUM_PRICE = 99; // INR / year
  const FREE_DAYS = 14;

  function toast(msg) {
    const t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg;
    t.style.display = "block";
    setTimeout(() => (t.style.display = "none"), 2500);
  }

  async function getMe() {
    const sidhi-gym-token = localStorage.getItem("sidhi-gym-token") || localStorage.getItem("sidhi-gym-token");
    if (!sidhi-gym-token) return null;
    const r = await fetch("/api/me", { headers: { Authorization: "Bearer " + sidhi-gym-token } });
    return r.ok ? r.json() : null;
  }

  function renderPremiumCard(me) {
    const app = document.getElementById("app");
    if (!app) return;
    let box = document.getElementById("premiumBox");
    if (!box) {
      box = document.createElement("div");
      box.id = "premiumBox";
      box.className = "glass card";
      box.style.marginTop = "14px";
      const home = document.getElementById("view-home");
      if (home) home.appendChild(box);
      else app.appendChild(box);
    }
    if (me && me.premium) {
      box.innerHTML = `
        <h2>Premium Active</h2>
        <p class="sub">Unlimited history · CSV export · No limits</p>
        <button class="btn ok full" id="exportBtn" style="margin-top:10px">Export CSV</button>
      `;
      document.getElementById("exportBtn").onclick = exportCSV;
    } else {
      box.innerHTML = `
        <h2>Go Premium · ₹${PREMIUM_PRICE}/year</h2>
        <p class="sub">Unlimited history, CSV export, custom splits</p>
        <button class="btn full" id="upgradeBtn" style="margin-top:10px">Upgrade with UPI</button>
        <p class="sub" style="margin-top:8px;font-size:11px">Free plan: last ${FREE_DAYS} days only</p>
      `;
      document.getElementById("upgradeBtn").onclick = showUpgrade;
    }
  }

  function showUpgrade() {
    const upi = "sidhi@upi"; // replace with real UPI
    const msg = `Sidhi Gym Premium ₹${PREMIUM_PRICE}\\nUPI: ${upi}\\n\\nPayment ke baad code milega.`;
    if (confirm(msg + "\\n\\nUPI app kholo?")) {
      const code = prompt("Payment ke baad activation code daalo:");
      if (code) activate(code);
    }
  }

  async function activate(code) {
    const sidhi-gym-token = localStorage.getItem("sidhi-gym-token") || localStorage.getItem("sidhi-gym-token");
    const r = await fetch("/api/premium/activate", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + sidhi-gym-token },
      body: JSON.stringify({ code })
    });
    const data = await r.json();
    if (data.ok) {
      toast("Premium activated!");
      setTimeout(() => location.reload(), 800);
    } else {
      toast(data.error || "Invalid code");
    }
  }

  async function exportCSV() {
    const sidhi-gym-token = localStorage.getItem("sidhi-gym-token") || localStorage.getItem("sidhi-gym-token");
    const r = await fetch("/api/export.csv", { headers: { Authorization: "Bearer " + sidhi-gym-token } });
    if (!r.ok) {
      const e = await r.json().catch(() => ({}));
      return toast(e.error || "Export failed");
    }
    const blob = await r.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "sidhi-gym.csv";
    a.click();
    toast("CSV downloaded");
  }

  // Limit history for free users
  function limitHistory(me) {
    if (me && me.premium) return;
    const rows = document.querySelectorAll("#hist tr");
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - FREE_DAYS);
    rows.forEach((tr) => {
      const dateCell = tr.querySelector("td");
      if (!dateCell) return;
      const d = new Date(dateCell.textContent.trim());
      if (d < cutoff) tr.style.opacity = "0.4";
    });
  }

  async function init() {
    if (!document.getElementById("app")) return;
    const me = await getMe();
    if (!me) return;
    renderPremiumCard(me);
    setTimeout(() => limitHistory(me), 1200);
  }

  setTimeout(init, 1500);
  setInterval(() => {
    if (!document.getElementById("premiumBox") && localStorage.getItem("sidhi-gym-token")) init();
  }, 3000);
})();
