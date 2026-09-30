module.exports = function (app, deps) {
  const crypto = require("crypto");
  const User = deps.User;
  const Token = deps.Token;
  const hashPass = deps.hashPass;

  app.post("/api/admin/reset-password", async function (req, res) {
    const secret = process.env.ADMIN_SECRET || "";
    if (!secret) return res.status(503).json({ error: "Vercel me ADMIN_SECRET set karo" });
    const given = String((req.body && req.body.secret) || req.headers["x-admin-secret"] || "");
    if (given !== secret) return res.status(401).json({ error: "Galat admin secret" });
    const username = String((req.body && (req.body.username || req.body.user)) || "").trim().toLowerCase();
    const pass = String((req.body && (req.body.password || req.body.pass)) || "");
    if (!username) return res.status(400).json({ error: "Username likho" });
    if (pass.length < 4) return res.status(400).json({ error: "Password kam se kam 4" });
    const u = await User.findOne({ username });
    if (!u) return res.status(404).json({ error: "User nahi mila" });
    const salt = crypto.randomBytes(16).toString("hex");
    u.salt = salt;
    u.passHash = hashPass(pass, salt);
    await u.save();
    await Token.deleteMany({ username });
    res.json({ ok: true, username });
  });
};
