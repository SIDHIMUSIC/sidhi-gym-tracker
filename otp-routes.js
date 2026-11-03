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
    purpose: { type: String, default: "register", index: true },
    attempts: { type: Number, default: 0 },
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
      const recent = await Otp().findOne({ email: email, purpose: "register-rate", createdAt: { $gt: new Date(Date.now() - 60 * 1000) } });
      if (recent) return res.status(429).json({ error: "60 seconds baad naya OTP lo." });
      const count = await Otp().countDocuments({ email: email, purpose: "register-rate", createdAt: { $gt: new Date(Date.now() - 60 * 60 * 1000) } });
      if (count >= 5) return res.status(429).json({ error: "Hourly OTP limit reached. 1 hour baad try karo." });
      const code = String(crypto.randomInt(100000, 1000000));
      await mail(email, code);
      await Otp().deleteMany({ email: email, purpose: "register-rate", createdAt: { $lt: new Date(Date.now() - 60 * 60 * 1000) } });
      await Otp().create({ email: email, purpose: "register-rate", code: "sent", exp: new Date(Date.now() + 60 * 60 * 1000) });
      await Otp().deleteMany({ email: email, purpose: "register" });
      await Otp().create({ email: email, purpose: "register", code: code, exp: new Date(Date.now() + 10 * 60 * 1000) });
      res.json({ ok: true });
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message || "OTP fail" });
    }
  });

  app.post("/api/otp/check", async function (req, res) {
    const email = String((req.body && req.body.email) || "").trim().toLowerCase();
    const code = String((req.body && req.body.code) || "").trim();
    const row = await Otp().findOne({ email: email, purpose: "register", code: code, attempts: { $lt: 5 }, exp: { $gt: new Date() } });
    if (!row) {
      await Otp().updateOne({ email: email, purpose: "register", exp: { $gt: new Date() } }, { $inc: { attempts: 1 } });
      return res.status(401).json({ error: "OTP galat ya expire. Maximum 5 attempts." });
    }
    await Otp().deleteMany({ email: email, purpose: "register" });
    res.json({ ok: true, email: email });
  });

  app.post("/api/otp/reset-start", async function (req, res) {
    try {
      const u = await findAccount(req.body && (req.body.key || req.body.username || req.body.email));
      if (!u) return res.status(404).json({ error: "User nahi mila" });
      if (!u.email) return res.status(400).json({ error: "Is account pe email save nahi. Profile me email daalo." });
      const recent = await Otp().findOne({ username: u.username, purpose: "reset-rate", createdAt: { $gt: new Date(Date.now() - 60 * 1000) } });
      if (recent) return res.status(429).json({ error: "60 seconds baad naya OTP lo." });
      const count = await Otp().countDocuments({ username: u.username, purpose: "reset-rate", createdAt: { $gt: new Date(Date.now() - 60 * 60 * 1000) } });
      if (count >= 5) return res.status(429).json({ error: "Hourly OTP limit reached. 1 hour baad try karo." });
      const code = String(crypto.randomInt(100000, 1000000));
      await mail(u.email, code);
      await Otp().deleteMany({ username: u.username, purpose: "reset-rate", createdAt: { $lt: new Date(Date.now() - 60 * 60 * 1000) } });
      await Otp().create({ username: u.username, email: u.email, purpose: "reset-rate", code: "sent", exp: new Date(Date.now() + 60 * 60 * 1000) });
      await Otp().deleteMany({ username: u.username, purpose: "reset" });
      await Otp().create({ email: u.email, username: u.username, purpose: "reset", code: code, exp: new Date(Date.now() + 10 * 60 * 1000) });
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
    if (pass.length < 6) return res.status(400).json({ error: "Password kam se kam 6" });
    const u = await findAccount(key);
    if (!u) return res.status(404).json({ error: "User nahi mila" });
    const row = await Otp().findOne({ username: u.username, purpose: "reset", code: code, attempts: { $lt: 5 }, exp: { $gt: new Date() } });
    if (!row) {
      await Otp().updateOne({ username: u.username, purpose: "reset", exp: { $gt: new Date() } }, { $inc: { attempts: 1 } });
      return res.status(401).json({ error: "OTP galat, expire ya 5 attempts complete" });
    }
    const salt = crypto.randomBytes(16).toString("hex");
    const passHash = crypto.scryptSync(pass, salt, 32).toString("hex");
    await users().updateOne({ username: u.username }, { $set: { salt: salt, passHash: passHash } });
    if (mongoose.models.Token) await mongoose.models.Token.deleteMany({ username: u.username });
    await Otp().deleteMany({ username: u.username });
    res.json({ ok: true, username: u.username });
  });

  app.post("/api/otp/who", async function (req, res) {
    try {
      const key = String((req.body && req.body.key) || "").trim();
      const code = String((req.body && req.body.code) || "").trim();
      const account = await findAccount(key);
      if (!account) return res.status(404).json({ error: "User nahi mila" });
      const row = await Otp().findOne({ username: account.username, purpose: "reset", code: code, attempts: { $lt: 5 }, exp: { $gt: new Date() } });
      if (!row) {
        await Otp().updateOne({ username: account.username, purpose: "reset", exp: { $gt: new Date() } }, { $inc: { attempts: 1 } });
        return res.status(401).json({ error: "OTP galat ya expire" });
      }
      await Otp().deleteMany({ username: account.username, purpose: "reset" });
      res.json({ ok: true, username: account.username });
    } catch (err) {
      res.status(500).json({ error: "OTP verify fail" });
    }
  });

  app.post("/api/profile-email/send", async function (req, res) {
    try {
      const username = await userFrom(req);
      if (!username) return res.status(401).json({ error: "Login chahiye" });
      const email = String((req.body && req.body.email) || "").trim().toLowerCase();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ error: "Email sahi likho" });
      const account = await users().findOne({ username: username });
      if (!account) return res.status(404).json({ error: "Account nahi mila" });
      if (account.emailVerified === true) {
        if (String(account.email || "").toLowerCase() === email) return res.json({ ok: true, alreadyVerified: true, email: account.email });
        return res.status(409).json({ error: "Verified email lock hai. Ise change nahi kiya ja sakta." });
      }
      const taken = await users().findOne({ email: email, username: { $ne: username } });
      if (taken) return res.status(409).json({ error: "Ye email kisi aur account se linked hai." });
      const recent = await Otp().findOne({ username: username, purpose: "profile-email-rate", createdAt: { $gt: new Date(Date.now() - 60 * 1000) } }).sort({ createdAt: -1 });
      if (recent) return res.status(429).json({ error: "Naya OTP bhejne se pehle 60 seconds wait karo." });
      const sentCount = await Otp().countDocuments({ username: username, purpose: "profile-email-rate", createdAt: { $gt: new Date(Date.now() - 60 * 60 * 1000) } });
      if (sentCount >= 5) return res.status(429).json({ error: "Hourly OTP limit reached. 1 hour baad try karo." });
      const code = String(crypto.randomInt(100000, 1000000));
      await mail(email, code);
      await Otp().deleteMany({ username: username, purpose: "profile-email-rate", createdAt: { $lt: new Date(Date.now() - 60 * 60 * 1000) } });
      await Otp().create({ username: username, email: email, purpose: "profile-email-rate", code: "sent", exp: new Date(Date.now() + 60 * 60 * 1000) });
      await Otp().deleteMany({ username: username, purpose: "profile-email" });
      await Otp().create({
        email: email, username: username, purpose: "profile-email",
        code: crypto.createHash("sha256").update(code).digest("hex"),
        exp: new Date(Date.now() + 10 * 60 * 1000)
      });
      res.json({ ok: true, hint: email.replace(/(.{2}).+(@.+)/, "$1***$2") });
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message || "OTP fail" });
    }
  });

  app.post("/api/profile-email/verify", async function (req, res) {
    try {
      const username = await userFrom(req);
      if (!username) return res.status(401).json({ error: "Login chahiye" });
      const email = String((req.body && req.body.email) || "").trim().toLowerCase();
      const code = String((req.body && req.body.code) || "").trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !/^\\d{6}$/.test(code)) return res.status(400).json({ error: "Email aur 6 digit OTP sahi daalo" });
      const account = await users().findOne({ username: username });
      if (!account) return res.status(404).json({ error: "Account nahi mila" });
      if (account.emailVerified === true) return res.status(409).json({ error: "Email pehle se verified aur locked hai." });
      const digest = crypto.createHash("sha256").update(code).digest("hex");
      const otp = await Otp().findOne({
        username: username, email: email, purpose: "profile-email", code: digest,
        attempts: { $lt: 5 }, exp: { $gt: new Date() }
      });
      if (!otp) {
        await Otp().updateOne({ username: username, email: email, purpose: "profile-email", exp: { $gt: new Date() } }, { $inc: { attempts: 1 } });
        return res.status(401).json({ error: "OTP galat ya expire. Maximum 5 attempts." });
      }
      const taken = await users().findOne({ email: email, username: { $ne: username } });
      if (taken) return res.status(409).json({ error: "Ye email kisi aur account se linked hai." });
      const updated = await users().updateOne(
        { username: username, emailVerified: { $ne: true } },
        { $set: { email: email, emailVerified: true } }
      );
      if (!updated.modifiedCount) return res.status(409).json({ error: "Email lock ho chuka hai. Refresh karke dekho." });
      await Otp().deleteMany({ username: username, purpose: "profile-email" });
      res.json({ ok: true, email: email, emailVerified: true });
    } catch (err) {
      res.status(500).json({ error: "Email verify fail" });
    }
  });

  app.post("/api/profile-email", async function (req, res) {
    const username = await userFrom(req);
    if (!username) return res.status(401).json({ error: "Login chahiye" });
    return res.status(403).json({ error: "Email direct edit disabled. OTP verification required." });
  });

  app.get("/api/profile-email", async function (req, res) {
    const username = await userFrom(req);
    if (!username) return res.status(401).json({ error: "Login chahiye" });
    const u = await users().findOne({ username: username });
    res.json({ ok: true, email: (u && u.email) || "", emailVerified: !!(u && u.emailVerified) });
  });
};
