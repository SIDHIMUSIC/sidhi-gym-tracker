function uid(name) {
  var s = String(name || "").toLowerCase();
  var n = 2166136261;
  for (var i = 0; i < s.length; i++) n = Math.imul(n ^ s.charCodeAt(i), 16777619);
  return "S" + (n >>> 0).toString(16).toUpperCase().padStart(8, "0").slice(0, 8);
}

function indiaDateNow(date) {
  var parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit"
  }).formatToParts(date || new Date());
  var p = {};
  parts.forEach(function (x) { p[x.type] = x.value; });
  return p.year + "-" + p.month + "-" + p.day;
}
function daysBefore(dateString, days) {
  var p = dateString.split("-").map(Number);
  return new Date(Date.UTC(p[0], p[1] - 1, p[2]) - days * 86400000).toISOString().slice(0, 10);
}

module.exports = function (app, deps) {
  const crypto = require("crypto");
  const User = deps.User;
  const Token = deps.Token;
  const GymSession = deps.GymSession;
  const DailySummaryDelivery = deps.DailySummaryDelivery;
  const isAdminUser = deps.isAdminUser;
  const hashPass = deps.hashPass;

  app.get("/api/public-config", function (_req, res) {
    const admin = String(process.env.ADMIN_USER || "harryashu").trim().toLowerCase();
    res.json({ ok: true, adminUser: admin });
  });

  async function requireAdminToken(req, res) {
    const token = String(req.headers.authorization || "").replace(/^Bearer\\s+/i, "").trim();
    if (!token) { res.status(401).json({ error: "Login to SIDHI GYM first." }); return null; }
    const row = await Token.findOne({ token: token, exp: { $gt: new Date() } }).lean();
    if (!row) { res.status(401).json({ error: "Session expired. Login again." }); return null; }
    if (!isAdminUser || !isAdminUser(row.username)) { res.status(403).json({ error: "Admin access only." }); return null; }
    return row.username;
  }

  // Read-only admin overview: user activity and email-provider submission history.
  app.get("/api/admin/dashboard", async function (req, res) {
    try {
      const admin = await requireAdminToken(req, res);
      if (!admin) return;
      res.setHeader("Cache-Control", "no-store");
      const today = indiaDateNow(new Date());
      const activeFrom = daysBefore(today, 6); // today + previous 6 IST calendar days
      const reportFrom = new Date(Date.now() - 30 * 86400000);

      const [users, lastCheckins, deliveryCounts, recentDeliveries] = await Promise.all([
        User.find({}, {
          username: 1, displayName: 1, email: 1, emailVerified: 1, createdAt: 1
        }).sort({ createdAt: -1 }).limit(2000).lean(),
        GymSession.aggregate([
          { $group: { _id: "$owner", lastCheckIn: { $max: "$date" } } }
        ]),
        DailySummaryDelivery.aggregate([
          { $match: { updatedAt: { $gte: reportFrom } } },
          { $group: { _id: "$status", count: { $sum: 1 } } }
        ]),
        DailySummaryDelivery.find({ updatedAt: { $gte: reportFrom } })
          .sort({ updatedAt: -1 }).limit(100)
          .select("owner date email status messageId sentAt updatedAt").lean()
      ]);

      const lastByOwner = new Map(lastCheckins.map(function (x) { return [x._id, x.lastCheckIn]; }));
      const activityUsers = users.map(function (u) {
        const lastCheckIn = lastByOwner.get(u.username) || null;
        const active = !!lastCheckIn && lastCheckIn >= activeFrom && lastCheckIn <= today;
        return {
          username: u.username,
          displayName: u.displayName || "",
          email: u.email || "",
          emailVerified: !!u.emailVerified,
          createdAt: u.createdAt || null,
          lastCheckIn: lastCheckIn,
          active: active
        };
      });
      const delivery = { sent: 0, failed: 0, other: 0 };
      deliveryCounts.forEach(function (x) {
        if (x._id === "sent") delivery.sent = x.count;
        else if (x._id === "failed") delivery.failed = x.count;
        else delivery.other += x.count;
      });

      res.json({
        ok: true,
        generatedAt: new Date().toISOString(),
        timezone: "Asia/Kolkata",
        activeFrom: activeFrom,
        activeTo: today,
        reportFrom: reportFrom.toISOString(),
        counts: {
          totalUsers: users.length,
          activeUsers: activityUsers.filter(function (u) { return u.active; }).length,
          inactiveUsers: activityUsers.filter(function (u) { return !u.active; }).length,
          verifiedEmails: activityUsers.filter(function (u) { return u.emailVerified && u.email; }).length,
          usersLimited: users.length === 2000
        },
        email: delivery,
        users: activityUsers,
        deliveries: recentDeliveries.map(function (d) {
          return {
            username: d.owner, date: d.date, email: d.email || "",
            status: d.status || "unknown", messageId: d.messageId || "",
            sentAt: d.sentAt || null, updatedAt: d.updatedAt || null
          };
        })
      });
    } catch (err) {
      console.error("SIDHI admin dashboard:", err && err.message);
      res.status(500).json({ error: "Admin dashboard could not load." });
    }
  });

  // Legacy secret-protected admin actions are retained for compatibility.
  function check(req, res) {
    const secret = process.env.ADMIN_SECRET || "";
    if (!secret) {
      res.status(503).json({ error: "Vercel me ADMIN_SECRET set karo" });
      return null;
    }
    const given = String((req.body && req.body.secret) || req.headers["x-admin-secret"] || "");
    const a = Buffer.from(given), b = Buffer.from(secret);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      res.status(401).json({ error: "Galat admin secret" });
      return null;
    }
    return true;
  }

  async function findUser(key) {
    const raw = String(key || "").trim();
    if (!raw) return null;
    const low = raw.toLowerCase();
    const up = raw.toUpperCase();
    let u = await User.findOne({ $or: [{ username: low }, { memberId: up }, { memberId: raw }] });
    if (u) return u;
    const all = await User.find({}).lean();
    const hit = all.find(function (row) {
      return uid(row.username) === up || uid(row.username) === raw;
    });
    if (!hit) return null;
    return User.findOne({ username: hit.username });
  }

  app.post("/api/admin/reset-password", async function (req, res) {
    if (!check(req, res)) return;
    const key = String((req.body && (req.body.username || req.body.user || req.body.memberId || req.body.id)) || "").trim();
    const pass = String((req.body && (req.body.password || req.body.pass)) || "");
    if (!key) return res.status(400).json({ error: "Username ya User ID likho" });
    if (pass.length < 6) return res.status(400).json({ error: "Password kam se kam 6" });
    const u = await findUser(key);
    if (!u) return res.status(404).json({ error: "User nahi mila" });
    const salt = crypto.randomBytes(16).toString("hex");
    u.salt = salt;
    u.passHash = hashPass(pass, salt);
    await u.save();
    await Token.deleteMany({ username: u.username });
    res.json({ ok: true, username: u.username, memberId: uid(u.username) });
  });

  app.post("/api/admin/users", async function (req, res) {
    if (!check(req, res)) return;
    const rows = await User.find({}, { username: 1, displayName: 1, memberId: 1 }).lean();
    res.json({
      ok: true,
      users: rows.map(function (u) {
        return { username: u.username, displayName: u.displayName || "", memberId: uid(u.username) };
      })
    });
  });
};
