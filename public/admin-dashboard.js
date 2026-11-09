(function () {
  "use strict";
  var data = null;
  var filter = "all";
  function el(id) { return document.getElementById(id); }
  function esc(v) { return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) { return ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[c]; }); }
  function date(v) {
    if (!v) return "—";
    var d = new Date(v.length === 10 ? v + "T12:00:00+05:30" : v);
    return isNaN(d.getTime()) ? String(v) : d.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: v.length === 10 ? undefined : "short", timeZone: "Asia/Kolkata" });
  }
  function token() { return localStorage.getItem("sidhi-gym-token") || ""; }
  function setNotice(message, error) {
    el("notice").textContent = message;
    el("notice").style.color = error ? "#ff8585" : "";
  }
  function setResetMsg(message, ok) {
    var m = el("resetMsg");
    m.textContent = message || "";
    m.className = "msg " + (ok ? "ok" : "err");
  }
  function fillUserList() {
    var list = el("userList");
    if (!list || !data || !data.users) return;
    list.innerHTML = data.users.map(function (u) {
      return '<option value="' + esc(u.username) + '">' + esc(u.displayName || u.username) + "</option>";
    }).join("");
  }
  function renderMembers() {
    if (!data) return;
    var q = el("search").value.trim().toLowerCase();
    var rows = data.users.filter(function (u) {
      if (filter === "active" && !u.active) return false;
      if (filter === "inactive" && u.active) return false;
      return !q || [u.username, u.displayName, u.email].join(" ").toLowerCase().indexOf(q) >= 0;
    });
    el("members").innerHTML = rows.length ? rows.map(function (u) {
      return "<tr><td>" + esc(u.displayName || u.username) + "</td><td>@" + esc(u.username) + "</td><td>" + esc(u.email || "—") + "</td><td>" + (u.emailVerified ? "Verified" : "No") + "</td><td>" + esc(date(u.lastCheckIn)) + "</td><td><span class='pill " + (u.active ? "active" : "inactive") + "'>" + (u.active ? "Active" : "Inactive") + "</span></td><td>" + esc(date(u.createdAt)) + '</td><td><button type="button" class="btn reset-row" data-user="' + esc(u.username) + '">Reset</button></td></tr>';
    }).join("") : "<tr><td colspan='8' class='empty'>No matching members.</td></tr>";
    el("memberSub").textContent = rows.length + " shown · Active = last 7 IST days check-in.";
    el("members").querySelectorAll("[data-user]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        el("resetUser").value = btn.getAttribute("data-user") || "";
        el("resetPass").focus();
        setResetMsg("Username selected. New password likho aur Reset dabao.", true);
        el("resetUser").scrollIntoView({ behavior: "smooth", block: "center" });
      });
    });
  }
  function renderDeliveries() {
    var rows = data.deliveries || [];
    el("deliveries").innerHTML = rows.length ? rows.map(function (d) {
      var status = d.status === "sent" ? "Accepted" : d.status === "failed" ? "Failed" : esc(d.status);
      var cls = d.status === "sent" ? "sent" : "failed";
      return "<tr><td>@" + esc(d.username) + "</td><td>" + esc(d.date) + "</td><td>" + esc(d.email) + "</td><td><span class='pill " + cls + "'>" + status + "</span></td><td>" + esc(date(d.sentAt || d.updatedAt)) + "</td><td>" + esc(d.messageId || "—") + "</td></tr>";
    }).join("") : "<tr><td colspan='6' class='empty'>No email attempts in last 30 days.</td></tr>";
  }
  function render() {
    var c = data.counts || {};
    el("total").textContent = c.totalUsers == null ? "—" : c.totalUsers;
    el("active").textContent = c.activeUsers == null ? "—" : c.activeUsers;
    el("inactive").textContent = c.inactiveUsers == null ? "—" : c.inactiveUsers;
    el("verified").textContent = c.verifiedEmails == null ? "—" : c.verifiedEmails;
    el("activeWindow").textContent = data.activeFrom + " to " + data.activeTo + " (IST)";
    el("sent").textContent = "Accepted: " + ((data.email && data.email.sent) || 0);
    el("failed").textContent = "Failed: " + ((data.email && data.email.failed) || 0);
    el("generated").textContent = "Updated " + date(data.generatedAt) + " · India Standard Time";
    el("limitNote").textContent = c.usersLimited ? "Showing newest 2,000 members." : "Row pe Reset dabao ya upar form se password change karo.";
    setNotice("Admin access verified. Members + email reports loaded.", false);
    fillUserList();
    renderMembers();
    renderDeliveries();
  }
  async function load() {
    if (!token()) {
      setNotice("Pehle SIDHI GYM me admin account se login karo, phir ye page reload karo.", true);
      return;
    }
    el("refresh").disabled = true;
    setNotice("Refreshing secure admin data…", false);
    try {
      var response = await fetch("/api/admin/dashboard", {
        headers: { Authorization: "Bearer " + token() },
        cache: "no-store"
      });
      var body = await response.json().catch(function () { return {}; });
      if (!response.ok) throw new Error(body.error || ("Request failed (" + response.status + ")"));
      data = body;
      render();
    } catch (err) {
      setNotice(err.message || "Could not load admin dashboard.", true);
    } finally {
      el("refresh").disabled = false;
    }
  }
  async function doReset() {
    var username = (el("resetUser").value || "").trim().toLowerCase();
    var password = el("resetPass").value || "";
    if (!username) { setResetMsg("Username likho.", false); return; }
    if (password.length < 6) { setResetMsg("Password kam se kam 6 characters.", false); return; }
    if (!token()) { setResetMsg("Admin login token nahi mila. App me login karke wapas aao.", false); return; }
    var btn = el("resetBtn");
    btn.disabled = true;
    setResetMsg("Updating…", true);
    try {
      var response = await fetch("/api/admin/users/" + encodeURIComponent(username) + "/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token()
        },
        body: JSON.stringify({ password: password })
      });
      var body = await response.json().catch(function () { return {}; });
      if (!response.ok) throw new Error(body.error || ("Failed (" + response.status + ")"));
      setResetMsg("OK — @" + (body.username || username) + " password update. User ko naya password se login karna hoga.", true);
      el("resetPass").value = "";
    } catch (err) {
      setResetMsg(err.message || "Reset fail.", false);
    } finally {
      btn.disabled = false;
    }
  }
  function csvCell(v) { return '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"'; }
  function exportCsv() {
    if (!data) return;
    var lines = [["Name","Username","Email","Email verified","Last check-in","Activity","Joined"]];
    data.users.forEach(function (u) {
      lines.push([u.displayName || u.username, u.username, u.email, u.emailVerified ? "Yes" : "No", u.lastCheckIn || "", u.active ? "Active" : "Inactive", u.createdAt || ""]);
    });
    var blob = new Blob(["\uFEFF" + lines.map(function (r) { return r.map(csvCell).join(","); }).join("\r\n")], { type: "text/csv;charset=utf-8" });
    var url = URL.createObjectURL(blob), a = document.createElement("a");
    a.href = url; a.download = "sidhi-gym-members-" + (data.activeTo || "report") + ".csv"; a.click();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }
  el("refresh").addEventListener("click", load);
  el("search").addEventListener("input", renderMembers);
  el("csv").addEventListener("click", exportCsv);
  el("resetBtn").addEventListener("click", doReset);
  document.querySelectorAll("[data-filter]").forEach(function (b) {
    b.addEventListener("click", function () {
      filter = b.getAttribute("data-filter");
      document.querySelectorAll("[data-filter]").forEach(function (x) { x.classList.toggle("active", x === b); });
      renderMembers();
    });
  });
  load();
})();
