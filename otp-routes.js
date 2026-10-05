const crypto = require("crypto");
const mongoose = require("mongoose");

function Otp() {
  return mongoose.models.Otp || mongoose.model("Otp", new mongoose.Schema({
    email: { type: String, index: true },
    code: String,
    exp: Date
  }, { timestamps: true }));
}
async function userFrom(req) {
  const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "").trim();
  const Token = mongoose.models.Token;
  if (!token || !Token) return "";
  const row = await Token.findOne({ token: token, exp: { $gt: new Date() } });
  return row ? row.username : "";
}

module.exports = function (app) {
  app.post("/api/otp/send", async function (req, res) {
    const email = String((req.body && req.body.email) || "").trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ error: "Email sahi likho" });
    const key = process.env.BREVO_API_KEY || "";
    const from = process.env.BREVO_SENDER || "";
    if (!key || !from) return res.status(503).json({ error: "Vercel me BREVO_API_KEY aur BREVO_SENDER set karo" });
    const code = String(Math.floor(100000 + Math.random() * 900000));
    await Otp().deleteMany({ email: email });
    await Otp().create({ email: email, code: code, exp: new Date(Date.now() + 10 * 60 * 1000) });
    const r = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": key, "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        sender: { email: from, name: "Sidhi Gym" },
        to: [{ email: email }],
        subject: "Sidhi Gym OTP " + code,
        textContent: "Sidhi Gym code: " + code + "\n10 minute me expire."
      })
    });
    if (!r.ok) return res.status(502).json({ error: "Brevo email nahi gaya" });
    res.json({ ok: true });
  });

  app.post("/api/otp/check", async function (req, res) {
    const email = String((req.body && req.body.email) || "").trim().toLowerCase();
    const code = String((req.body && req.body.code) || "").trim();
    const row = await Otp().findOne({ email: email, code: code, exp: { $gt: new Date() } });
    if (!row) return res.status(401).json({ error: "OTP galat ya expire" });
    await Otp().deleteMany({ email: email });
    res.json({ ok: true, email: email, ticket: crypto.randomBytes(8).toString("hex") });
  });

  app.post("/api/profile-email", async function (req, res) {
    const username = await userFrom(req);
    if (!username) return res.status(401).json({ error: "Login chahiye" });
    const email = String((req.body && req.body.email) || "").trim().toLowerCase();
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ error: "Email sahi likho" });
    await mongoose.connection.collection("users").updateOne({ username: username }, { $set: { email: email } });
    res.json({ ok: true, email: email });
  });

  app.get("/api/profile-email", async function (req, res) {
    const username = await userFrom(req);
    if (!username) return res.status(401).json({ error: "Login chahiye" });
    const u = await mongoose.connection.collection("users").findOne({ username: username });
    res.json({ ok: true, email: (u && u.email) || "" });
  });
};
