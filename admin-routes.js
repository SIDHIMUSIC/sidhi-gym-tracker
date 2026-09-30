module.exports = function (app, deps) {
  const crypto = require("crypto");
  const User = deps.User;
  const Token = deps.Token;
  const hashPass = deps.hashPass;

  function check(req, res) {
    const secret = process.env.ADMIN_SECRET || "";
    if (!secret) {
      res.status(503).json({ error: "Vercel me ADMIN_SECRET set karo" });
      return null;
    }
    const given = String((req.body && req.body.secret) || req.headers["x-admin-secret"] || req.query.secret || "");
    if (given !== secret) {
      res.status(401).json({ error: "Galat admin secret" });
      return null;
    }
    return true;
  }

  app.post("/api/admin/reset-password", async function (req, res) {
    if (!check(req, res)) return;
    const key = String((req.body && (req.body.username || req.body.user || req.body.memberId || req.body.id)) || "").trim();
    const pass = String((req.body && (req.body.password || req.body.pass)) || "");
    if (!key) return res.status(400).json({ error: "Username ya User ID likho" });
    if (pass.length < 4) return res.status(400).json({ error: "Password kam se kam 4" });
    const low = key.toLowerCase();
    const up = key.toUpperCase();
    const u = await User.findOne({ $or: [{ username: low }, { memberId: up }, { memberId: key }] });
    if (!u) return res.status(404).json({ error: "User nahi mila" });
    const salt = crypto.randomBytes(16).toString("hex");
    u.salt = salt;
    u.passHash = hashPass(pass, salt);
    await u.save();
    await Token.deleteMany({ username: u.username });
    res.json({ ok: true, username: u.username, memberId: u.memberId || "" });
  });

  app.post("/api/admin/users", async function (req, res) {
    if (!check(req, res)) return;
    const rows = await User.find({}, { username: 1, displayName: 1, memberId: 1 }).lean();
    res.json({
      ok: true,
      users: rows.map(function (u) {
        return { username: u.username, displayName: u.displayName || "", memberId: u.memberId || "" };
      })
    });
  });
};
