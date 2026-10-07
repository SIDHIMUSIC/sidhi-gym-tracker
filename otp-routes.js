const crypto = require("crypto");
const mongoose = require("mongoose");

function uid(name) {
  var s = String(name || "").toLowerCase();
  var n = 2166136261;
  for (var i = 0; i < s.length; i++) n = Math.imul(n ^ s.charCodeAt(i), 16777619);
  return "S" + (n >>> 0).toString(16).toUpperCase().padStart(8, "0").slice(0, 8);
}
function Otp() {
  return mongoose.models.Otp || mongoose.model("Otp", new mongoose.Schema({
    email: { type: String, index: true },
    username: String,
    code: String,
    exp: Date
  }, { timestamps: true }));
}
function users() { return mongoose.connection.collection("users"); }
async function userFrom(req) {
  const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "").trim();
  const Token = mongoose.models.Token;
  if (!token || !Token) return "";
  const row = await Token.findOne({ token: token, exp: { $gt: new Date() } });
  return row ? row.username : "";
}
async function findAccount(key) {
  const raw = String(key || "").trim();
  if (!raw) return null;
  const low = raw.toLowerCase();
  let u = await users().findOne({ $or: [{ username: low }, { email: low }] });
  if (u) return u;
  const all = await users().find({}).toArray();
  return all.find(function (row) { return uid(row.username) === raw.toUpperCase(); }) || null;
}
async function mail(email, code) {
  const key = process.env.BREVO_API_KEY || "";
  const from = process.env.BREVO_SENDER || "";
  if (!key || !from) {
    const err = new Error("Vercel me BREVO_API_KEY aur BREVO_SENDER set karo");
    err.status = 503;
    throw err;
  }
  const html = [
    "<!doctype html><html><body style=\"margin:0;background:#070b14;font-family:Arial,Helvetica,sans-serif;\">",
    "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:#070b14;padding:28px 12px;\"><tr><td align=\"center\">",
    "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"max-width:460px;background:#101826;border:1px solid #243044;border-radius:18px;overflow:hidden;\">",
    "<tr><td style=\"padding:22px 24px 8px;\"><p style=\"margin:0;letter-spacing:3px;font-size:11px;color:#d4b483;\">SIDHI GYM</p>",
    "<h1 style=\"margin:8px 0 0;font-size:22px;color:#f6f1e8;font-weight:700;\">Verify your email</h1></td></tr>",
    "<tr><td style=\"padding:8px 24px 0;color:#b7c3d4;font-size:14px;line-height:1.5;\">Use this code to finish creating your Sidhi Gym account. It expires in 10 minutes.</td></tr>",
    "<tr><td align=\"center\" style=\"padding:22px 24px;\"><div style=\"display:inline-block;background:#0b1220;border:1px solid #3a4d68;border-radius:14px;padding:16px 28px;letter-spacing:8px;font-size:30px;font-weight:700;color:#f0c27a;\">" + code + "</div></td></tr>",
    "<tr><td style=\"padding:0 24px 22px;color:#8ea0b5;font-size:12px;line-height:1.5;\">Do not share this code. Sidhi Gym will never ask for it on a call or chat.<br>If you did not request this, ignore this email.</td></tr>",
    "<tr><td style=\"padding:14px 24px;background:#0b1220;color:#6d7d90;font-size:11px;\">Sidhi Gym · training log</td></tr>",
    "</table></td></tr></table></body></html>"
  ].join("");
  const r = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": key, "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      sender: { email: from, name: "Sidhi Gym" },
      to: [{ email: email }],
      subject: "Your Sidhi Gym verification code",
      textContent: "Sidhi Gym verification code: " + code + "\nThis code expires in 10 minutes. Do not share it.",
      htmlContent: html
    })
  });
  if (!r.ok) {
    const err = new Error("Brevo email nahi gaya");
    err.status = 502;
    throw err;
  }
}

module.exports = function (app) {
  app.post("/api/otp/send", async function (req, res) {
    try {
      const email = String((req.body && req.body.email) || "").trim().toLowerCase();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ error: "Email sahi likho" });
      const code = String(Math.floor(100000 + Math.random() * 900000));
      await Otp().deleteMany({ email: email });
      await Otp().create({ email: email, code: code, exp: new Date(Date.now() + 10 * 60 * 1000) });
      await mail(email, code);
      res.json({ ok: true });
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message || "OTP fail" });
    }
  });

  app.post("/api/otp/check", async function (req, res) {
    const email = String((req.body && req.body.email) || "").trim().toLowerCase();
    const code = String((req.body && req.body.code) || "").trim();
    const row = await Otp().findOne({ email: email, code: code, exp: { $gt: new Date() } });
    if (!row) return res.status(401).json({ error: "OTP galat ya expire" });
    await Otp().deleteMany({ email: email });
    res.json({ ok: true, email: email });
  });

  app.post("/api/otp/reset-start", async function (req, res) {
    try {
      const u = await findAccount(req.body && (req.body.key || req.body.username || req.body.email));
      if (!u) return res.status(404).json({ error: "User nahi mila" });
      if (!u.email) return res.status(400).json({ error: "Is account pe email save nahi. Profile me email daalo." });
      const code = String(Math.floor(100000 + Math.random() * 900000));
      await Otp().deleteMany({ username: u.username });
      await Otp().create({ email: u.email, username: u.username, code: code, exp: new Date(Date.now() + 10 * 60 * 1000) });
      await mail(u.email, code);
      const hidden = u.email.replace(/(.{2}).+(@.+)/, "$1***$2");
      res.json({ ok: true, hint: hidden, username: u.username });
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message || "OTP fail" });
    }
  });

  app.post("/api/otp/reset-finish", async function (req, res) {
    const key = String((req.body && (req.body.key || req.body.username)) || "").trim();
    const code = String((req.body && req.body.code) || "").trim();
    const pass = String((req.body && (req.body.password || req.body.pass)) || "");
    if (pass.length < 4) return res.status(400).json({ error: "Password kam se kam 4" });
    const u = await findAccount(key);
    if (!u) return res.status(404).json({ error: "User nahi mila" });
    const row = await Otp().findOne({ username: u.username, code: code, exp: { $gt: new Date() } });
    if (!row) return res.status(401).json({ error: "OTP galat ya expire" });
    const salt = crypto.randomBytes(16).toString("hex");
    const passHash = crypto.scryptSync(pass, salt, 32).toString("hex");
    await users().updateOne({ username: u.username }, { $set: { salt: salt, passHash: passHash } });
    if (mongoose.models.Token) await mongoose.models.Token.deleteMany({ username: u.username });
    await Otp().deleteMany({ username: u.username });
    res.json({ ok: true, username: u.username });
  });

  app.post("/api/profile-email", async function (req, res) {
    const username = await userFrom(req);
    if (!username) return res.status(401).json({ error: "Login chahiye" });
    const email = String((req.body && req.body.email) || "").trim().toLowerCase();
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ error: "Email sahi likho" });
    await users().updateOne({ username: username }, { $set: { email: email } });
    res.json({ ok: true, email: email });
  });

  app.get("/api/profile-email", async function (req, res) {
    const username = await userFrom(req);
    if (!username) return res.status(401).json({ error: "Login chahiye" });
    const u = await users().findOne({ username: username });
    res.json({ ok: true, email: (u && u.email) || "" });
  });
};
