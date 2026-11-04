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
    purpose: { type: String, default: "signup" },
    code: String,
    purpose: { type: String, default: "register", index: true },
    attempts: { type: Number, default: 0 },
    exp: Date
  }, { timestamps: true }));
}
function users() { return mongoose.connection.collection("users"); }
const otpLimits = new Map();
function otpAllowed(req, action, max) {
  const key = action + ":" + String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown").split(",")[0].trim();
  const now = Date.now(); const row = otpLimits.get(key) || { start: now, count: 0 };
  if (now - row.start > 10 * 60 * 1000) { row.start = now; row.count = 0; }
  row.count++; otpLimits.set(key, row);
  if (otpLimits.size > 5000) for (const [k,v] of otpLimits) if (now - v.start > 10 * 60 * 1000) otpLimits.delete(k);
  return row.count <= max;
}
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
  const appCodeUrl = appUrl + "#email-code=" + encodeURIComponent(code);
  const html = "<!doctype html><html><body style='margin:0;padding:0;background:#07111f'>"
    + "<table role='presentation' width='100%' cellpadding='0' cellspacing='0' style='background:#07111f;padding:30px 12px'><tr><td align='center'>"
    + "<table role='presentation' width='100%' cellpadding='0' cellspacing='0' style='max-width:500px;background:#101b2c;border:1px solid #293a50;border-radius:26px;overflow:hidden'>"
    + "<tr><td style='padding:28px;background:linear-gradient(135deg,#172b43,#101827 65%,#20233a)'><p style='margin:0;color:#f0c27a;font:800 12px Arial,sans-serif;letter-spacing:5px'>SIDHI GYM</p><p style='margin:9px 0 0;color:#a9bfd4;font:13px Arial,sans-serif;letter-spacing:2px'>YOUR TRAINING JOURNEY</p><div style='margin-top:20px;width:48px;height:4px;border-radius:9px;background:linear-gradient(90deg,#ff9a9e,#f0c27a,#63e2b3)'></div></td></tr>"
    + "<tr><td style='padding:30px 28px 8px;font-family:Arial,Helvetica,sans-serif'><p style='margin:0 0 9px;color:#a8edea;font-size:11px;font-weight:700;letter-spacing:2px'>ACCOUNT SECURITY</p><h1 style='margin:0;color:#f8fafc;font-size:27px;line-height:1.25'>Verify your email</h1><p style='margin:13px 0 0;color:#b8c5d5;font-size:15px;line-height:1.7'>Use this one-time code to verify your email address and secure your SIDHI GYM account.</p></td></tr>"
    + "<tr><td align='center' style='padding:22px 28px 8px'><div style='display:inline-block;min-width:245px;padding:20px 18px;border:1px solid #3a5268;border-radius:18px;background:#091321;color:#f8fafc;font:800 35px Arial,sans-serif;letter-spacing:12px;text-align:center'>" + code + "</div><p style='margin:10px 0 0;color:#8fa4b9;font:12px Arial,sans-serif'>EXPIRES IN 10 MINUTES</p></td></tr>"
    + "<tr><td align='center' style='padding:22px 28px 8px'><a href='" + appCodeUrl + "' style='display:inline-block;padding:15px 25px;border-radius:999px;background:linear-gradient(135deg,#a8edea,#63e2b3);color:#062019;text-decoration:none;font:800 14px Arial,sans-serif;letter-spacing:.5px'>OPEN SIDHI GYM WITH CODE&nbsp; →</a><p style='margin:12px 0 0;color:#91a4b8;font:12px Arial,sans-serif;line-height:1.5'>Tap to open the app. Your code will be filled in the verification box, where you can copy it if needed.</p></td></tr>"
    + "<tr><td style='padding:18px 28px 26px;color:#8fa0b4;font:12px Arial,sans-serif;line-height:1.7'>If you did not request this code, you can safely ignore this email. Never share your code with anyone.</td></tr>"
    + "<tr><td style='padding:18px 28px;background:#0b1422;border-top:1px solid #293a50;color:#71849a;font:11px Arial,sans-serif;letter-spacing:.5px'>SIDHI GYM · TRAIN HARD · LOG EASY</td></tr>"
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

async function sendProfileVerifiedEmail(email, username) {
  const key = process.env.BREVO_API_KEY || "";
  const from = process.env.BREVO_SENDER || "";
  if (!key || !from) throw new Error("Brevo sender is not configured");
  const appUrl = "https://sidhi-gym-tracker.vercel.app/";
  const safeName = String(username || "athlete").replace(/[&<>"]/g, "");
  const safeEmail = String(email || "").replace(/[&<>"]/g, "");
  const verifiedAt = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata", dateStyle: "long", timeStyle: "short"
  }) + " IST";
  const html = "<!doctype html><html><body style='margin:0;padding:0;background:#07111f'>"
    + "<table role='presentation' width='100%' cellpadding='0' cellspacing='0' style='background:#07111f;padding:30px 12px'><tr><td align='center'>"
    + "<table role='presentation' width='100%' cellpadding='0' cellspacing='0' style='max-width:500px;background:#101b2c;border:1px solid #293a50;border-radius:26px;overflow:hidden'>"
    + "<tr><td style='padding:28px;background:linear-gradient(135deg,#172b43,#101827 65%,#20233a)'><p style='margin:0;color:#f0c27a;font:800 12px Arial,sans-serif;letter-spacing:5px'>SIDHI GYM</p><p style='margin:9px 0 0;color:#a9bfd4;font:13px Arial,sans-serif;letter-spacing:2px'>ACCOUNT CONFIRMATION</p></td></tr>"
    + "<tr><td align='center' style='padding:30px 28px 8px'><div style='width:62px;height:62px;line-height:62px;border-radius:50%;background:#63e2b3;color:#062019;font:800 34px Arial,sans-serif'>✓</div><h1 style='margin:20px 0 8px;color:#f8fafc;font:800 26px Arial,sans-serif'>Email verified!</h1><p style='margin:0;color:#b8c5d5;font:15px/1.7 Arial,sans-serif'>Your email address has been successfully verified and securely linked to your SIDHI GYM account.</p></td></tr>"
    + "<tr><td style='padding:20px 28px'><div style='padding:16px;border:1px solid #315b56;border-radius:16px;background:#0c211f;color:#c7f9e8;font:14px/1.7 Arial,sans-serif'><b>Username</b><br>@" + safeName + "<br><b>Verified email</b><br>" + safeEmail + "<br><b>Verification date</b><br>" + verifiedAt + "<br><b>Status</b><br>Verified and locked</div></td></tr>"
    + "<tr><td align='center' style='padding:4px 28px 28px'><a href='" + appUrl + "' style='display:inline-block;padding:15px 28px;border-radius:999px;background:linear-gradient(135deg,#f0c27a,#e2a64e);color:#1b160b;text-decoration:none;font:800 14px Arial,sans-serif'>CONTINUE TO SIDHI GYM →</a></td></tr>"
    + "<tr><td style='padding:18px 28px;background:#0b1422;border-top:1px solid #293a50;color:#71849a;font:11px Arial,sans-serif'>If you did not make this change, contact SIDHI GYM support.</td></tr></table></td></tr></table></body></html>";
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": key, "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      sender: { email: from, name: "Sidhi Gym" },
      to: [{ email: email }],
      subject: "Your SIDHI GYM email is verified",
      textContent: "Your email has been successfully verified and linked to SIDHI GYM. Username: @" + safeName + ". Verified email: " + safeEmail + ". Verification date: " + verifiedAt + ". Continue: " + appUrl,
      htmlContent: html
    })
  });
  const responseText = await response.text();
  let responseData = {};
  try { responseData = responseText ? JSON.parse(responseText) : {}; } catch (_) {}
  if (!response.ok) {
    console.error("SIDHI GYM Brevo confirmation rejected:", response.status, responseText.slice(0, 500));
    const err = new Error("Confirmation email provider rejected the message (HTTP " + response.status + ")");
    err.status = 502;
    throw err;
  }
  return { messageId: responseData.messageId || (responseData.messageIds && responseData.messageIds[0]) || "" };
}

module.exports = function (app) {
  app.post("/api/otp/send", async function (req, res) {
    try {
      const email = String((req.body && req.body.email) || "").trim().toLowerCase();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ error: "Email sahi likho" });
      const existingEmail = await users().findOne({ email: email });
      if (existingEmail) return res.status(409).json({ error: "Ye email pehle se account se linked hai. Login karo." });
      const recent = await Otp().findOne({ email: email, purpose: "register-rate", createdAt: { $gt: new Date(Date.now() - 60 * 1000) } });
      if (recent) return res.status(429).json({ error: "60 seconds baad naya OTP lo." });
      const count = await Otp().countDocuments({ email: email, purpose: "register-rate", createdAt: { $gt: new Date(Date.now() - 60 * 60 * 1000) } });
      if (count >= 5) return res.status(429).json({ error: "Hourly OTP limit reached. 1 hour baad try karo." });
      const code = String(crypto.randomInt(100000, 1000000));
      await Otp().deleteMany({ email: email });
      await Otp().create({ email: email, purpose: "signup", code: code, exp: new Date(Date.now() + 10 * 60 * 1000) });
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
    const signupRow = await Otp().findOne({ email: email, purpose: "signup", code: code, exp: { $gt: new Date() } });
    if (!signupRow) return res.status(401).json({ error: "OTP galat ya expire" });
    await Otp().deleteMany({ email: email });
    res.json({ ok: true, email: email });
  });

  app.post("/api/otp/reset-start", async function (req, res) {
    try {
      const u = await findAccount(req.body && (req.body.key || req.body.username || req.body.email));
      if (!u) return res.status(404).json({ error: "User nahi mila" });
      if (!u.email || u.emailVerified !== true) return res.status(400).json({ error: "Is account ka email verified nahi hai. Account recovery ke liye verified email zaroori hai." });
      const recent = await Otp().findOne({ username: u.username, purpose: "reset-rate", createdAt: { $gt: new Date(Date.now() - 60 * 1000) } });
      if (recent) return res.status(429).json({ error: "60 seconds baad naya OTP lo." });
      const count = await Otp().countDocuments({ username: u.username, purpose: "reset-rate", createdAt: { $gt: new Date(Date.now() - 60 * 60 * 1000) } });
      if (count >= 5) return res.status(429).json({ error: "Hourly OTP limit reached. 1 hour baad try karo." });
      const code = String(crypto.randomInt(100000, 1000000));
      await Otp().deleteMany({ username: u.username });
      await Otp().create({ email: u.email, username: u.username, purpose: "password-reset", code: code, exp: new Date(Date.now() + 10 * 60 * 1000) });
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
    const row = await Otp().findOne({ username: u.username, purpose: "password-reset", code: code, exp: { $gt: new Date() } });
    if (!row) return res.status(401).json({ error: "OTP galat ya expire" });
    const salt = crypto.randomBytes(16).toString("hex");
    const passHash = crypto.scryptSync(pass, salt, 32).toString("hex");
    await users().updateOne({ username: u.username }, { $set: { salt: salt, passHash: passHash } });
    if (mongoose.models.Token) await mongoose.models.Token.deleteMany({ username: u.username });
    await Otp().deleteMany({ username: u.username, purpose: "reset" });
    res.json({ ok: true, username: u.username });
  });

  app.post("/api/profile-email/send-otp", async function (req, res) {
    const username = await userFrom(req);
    if (!username) return res.status(401).json({ error: "Login chahiye" });
    const email = String((req.body && req.body.email) || "").trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ error: "Email sahi likho" });
    const account = await users().findOne({ username: username });
    if (account && account.emailVerified) return res.status(409).json({ error: "Verified email lock hai. Ise change nahi kar sakte." });
    const taken = await users().findOne({ email: email, username: { $ne: username } });
    if (taken) return res.status(409).json({ error: "Ye email kisi doosre account par use ho raha hai." });
    const code = String(crypto.randomInt(100000, 1000000));
    await Otp().deleteMany({ username: username, purpose: "profile-email" });
    await Otp().create({ email: email, username: username, purpose: "profile-email", code: code, exp: new Date(Date.now() + 10 * 60 * 1000) });
    try { await mail(email, code); }
    catch (err) { await Otp().deleteMany({ username: username, purpose: "profile-email" }); return res.status(err.status || 502).json({ error: err.message || "OTP email nahi gaya" }); }
    res.json({ ok: true, hint: email.replace(/(.{2}).+(@.+)/, "$1***$2") });
  });

  app.post("/api/profile-email/verify", async function (req, res) {
    const username = await userFrom(req);
    if (!username) return res.status(401).json({ error: "Login chahiye" });
    const email = String((req.body && req.body.email) || "").trim().toLowerCase();
    const code = String((req.body && req.body.code) || "").trim();
    if (!/^[0-9]{6}$/.test(code)) return res.status(400).json({ error: "6 digit OTP daalo" });
    const account = await users().findOne({ username: username });
    if (account && account.emailVerified) return res.status(409).json({ error: "Verified email lock hai." });
    const taken = await users().findOne({ email: email, username: { $ne: username } });
    if (taken) return res.status(409).json({ error: "Ye email kisi doosre account par use ho raha hai." });
    const otp = await Otp().findOne({ username: username, email: email, purpose: "profile-email", code: code, exp: { $gt: new Date() } });
    if (!otp) return res.status(401).json({ error: "OTP galat ya expire ho gaya." });
    const result = await users().updateOne({ username: username, emailVerified: { $ne: true } }, { $set: { email: email, emailVerified: true } });
    if (!result.modifiedCount) return res.status(409).json({ error: "Email pehle se verify/lock hai." });
    await Otp().deleteMany({ username: username, purpose: "profile-email" });
    let confirmationEmailSent = false;
    let confirmationMessageId = "";
    let confirmationEmailError = "";
    try {
      const sent = await sendProfileVerifiedEmail(email, username);
      confirmationEmailSent = true;
      confirmationMessageId = sent.messageId || "";
    } catch (mailErr) {
      confirmationEmailError = mailErr && mailErr.message ? mailErr.message : "Email send failed";
      console.error("SIDHI GYM verification confirmation email failed:", confirmationEmailError);
    }
    res.json({
      ok: true, email: email, emailVerified: true,
      confirmationEmailSent: confirmationEmailSent,
      confirmationMessageId: confirmationMessageId,
      confirmationEmailError: confirmationEmailError
    });
  });

  app.post("/api/profile-email/confirmation-resend", async function (req, res) {
    try {
      const username = await userFrom(req);
      if (!username) return res.status(401).json({ error: "Login chahiye" });
      const account = await users().findOne({ username: username });
      if (!account || account.emailVerified !== true || !account.email) {
        return res.status(400).json({ error: "Pehle email verify karo." });
      }
      const recent = await Otp().findOne({
        username: username, purpose: "profile-confirm-rate",
        createdAt: { $gt: new Date(Date.now() - 5 * 60 * 1000) }
      });
      if (recent) return res.status(429).json({ error: "Confirmation email abhi bheja gaya hai. 5 minute baad dobara try karo." });
      const sent = await sendProfileVerifiedEmail(account.email, username);
      await Otp().deleteMany({ username: username, purpose: "profile-confirm-rate" });
      await Otp().create({
        username: username, email: account.email, purpose: "profile-confirm-rate",
        code: "sent", exp: new Date(Date.now() + 5 * 60 * 1000)
      });
      res.json({ ok: true, email: account.email, messageId: sent.messageId || "" });
    } catch (err) {
      console.error("SIDHI GYM confirmation resend failed:", err && err.message);
      res.status(err.status || 500).json({ error: err.message || "Confirmation email send failed" });
    }
  });

  app.post("/api/profile-email", async function (req, res) {
    const username = await userFrom(req);
    if (!username) return res.status(401).json({ error: "Login chahiye" });
    const account = await users().findOne({ username: username });
    if (account && account.emailVerified) return res.status(409).json({ error: "Verified email lock hai." });
    return res.status(403).json({ error: "Email ko OTP se verify karo." });
  });

  app.get("/api/profile-email", async function (req, res) {
    const username = await userFrom(req);
    if (!username) return res.status(401).json({ error: "Login chahiye" });
    const u = await users().findOne({ username: username });
    res.json({ ok: true, email: (u && u.email) || "", emailVerified: !!(u && u.emailVerified) });
  });
};
