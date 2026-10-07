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
  const appUrl = "https://sidhi-gym-tracker.vercel.app/";
  const html = "<!doctype html><html><body style='margin:0;padding:0;background:#e8edf3'>"
    + "<table role='presentation' width='100%' cellpadding='0' cellspacing='0' style='background:#e8edf3;padding:28px 12px'><tr><td align='center'>"
    + "<table role='presentation' width='100%' cellpadding='0' cellspacing='0' style='max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0'>"
    + "<tr><td style='background:#0b1220;padding:22px 28px'>"
    + "<p style='margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:3px;color:#e8c98a'>SIDHI GYM</p>"
    + "<p style='margin:6px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#9fb0c3'>Training log</p>"
    + "</td></tr>"
    + "<tr><td style='padding:28px 28px 8px;font-family:Arial,Helvetica,sans-serif'>"
    + "<h1 style='margin:0;font-size:24px;line-height:1.3;color:#0f172a;font-weight:700'>Verify your email</h1>"
    + "<p style='margin:12px 0 0;font-size:15px;line-height:1.55;color:#475569'>Enter this code in Sidhi Gym to finish. It expires in 10 minutes.</p>"
    + "</td></tr>"
    + "<tr><td align='center' style='padding:20px 28px 8px'>"
    + "<div style='font-family:Arial,Helvetica,sans-serif;font-size:32px;letter-spacing:10px;font-weight:700;color:#0f172a;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px 12px'>" + code + "</div>"
    + "</td></tr>"
    + "<tr><td align='center' style='padding:18px 28px 8px'>"
    + "<a href='" + appUrl + "' style='display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;padding:14px 28px;border-radius:999px'>Open Sidhi Gym</a>"
    + "</td></tr>"
    + "<tr><td align='center' style='padding:8px 28px 22px;font-family:Arial,Helvetica,sans-serif;font-size:12px'>"
    + "<a href='" + appUrl + "' style='color:#64748b;text-decoration:underline'>sidhi-gym-tracker.vercel.app</a>"
    + "</td></tr>"
    + "<tr><td style='padding:0 28px 24px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;color:#64748b'>Do not share this code. Sidhi Gym will never ask for it on a call or chat.</td></tr>"
    + "<tr><td style='padding:16px 28px;background:#f8fafc;border-top:1px solid #e2e8f0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#94a3b8'>Sidhi Gym · daily training log</td></tr>"
    + "</table></td></tr></table></body></html>";
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
