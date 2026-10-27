require("dotenv").config();
const path = require("path");
const PREM = require("./premium-config");
const crypto = require("crypto");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;
const SPLIT = {
  Monday: "Chest and triceps",
  Tuesday: "Back and biceps",
  Wednesday: "Shoulders and legs",
  Thursday: "Chest and triceps",
  Friday: "Back and biceps",
  Saturday: "Shoulders and triceps",
  Sunday: "Off"
};
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// --- Simple in-memory cache (per warm instance). TTL in ms. Good enough for viral spikes on Vercel. ---
const cache = new Map();
function cacheGet(key) {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() > hit.exp) { cache.delete(key); return null; }
  return hit.val;
}
function cacheSet(key, val, ttlMs) {
  cache.set(key, { val, exp: Date.now() + ttlMs });
  if (cache.size > 2000) { // soft limit
    const first = cache.keys().next().value;
    if (first) cache.delete(first);
  }
}
function cacheDel(prefix) {
  for (const k of cache.keys()) if (k.startsWith(prefix)) cache.delete(k);
}

function model(name, schema) {
  return mongoose.models[name] || mongoose.model(name, schema);
}

const User = model(
  "User",
  new mongoose.Schema(
    {
      username: { type: String, unique: true, required: true, lowercase: true, trim: true, index: true },
      salt: { type: String, required: true },
      passHash: { type: String, required: true },
      goalWeight: Number,
      displayName: { type: String, default: "" },
      gender: { type: String, default: "" },
      schedule: { type: Object, default: {} },
      age: Number,
      heightCm: Number,
      currentWeight: Number,
      fitnessGoal: { type: String, default: "" },
      trainingLevel: { type: String, default: "" },
      photoUrl: { type: String, default: "" },
      preferredDays: { type: Array, default: [] },
      premium: { type: Boolean, default: false },
      premiumUntil: { type: Date, default: null },
      premiumReminderDaysSent: { type: [Number], default: [] }
    },
    { timestamps: true }
  )
);

const Token = model(
  "Token",
  new mongoose.Schema(
    {
      token: { type: String, unique: true, required: true, index: true },
      username: { type: String, required: true, index: true },
      exp: { type: Date, required: true, index: true }
    },
    { timestamps: true }
  )
);

const PromoCode = model("PromoCode", new mongoose.Schema({
  code: { type: String, unique: true, required: true, uppercase: true, trim: true, index: true },
  days: { type: Number, required: true, min: 1, max: 365 },
  used: { type: Boolean, default: false, index: true },
  usedBy: { type: String, default: "" },
  usedAt: { type: Date, default: null },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}));

const gymSchema = new mongoose.Schema(
  {
    owner: { type: String, required: true, index: true },
    date: { type: String, required: true, index: true },
    day: String,
    workoutName: String,
    entryTime: String,
    entryWeight: Number,
    after1HourTime: String,
    after1HourWeight: Number,
    after1HourNote: String,
    lifts: { type: Array, default: [] },
    beforeTreadmillTime: String,
    beforeTreadmillType: String,
    beforeTreadmillWeight: Number,
    beforeTreadmillKm: Number,
    beforeTreadmillMins: Number,
    beforeTreadmillSpeed: Number,
    beforeTreadmillIncline: Number,
    beforeTreadmillNote: String,
    afterTreadmillTime: String,
    afterTreadmillType: String,
    afterTreadmillWeight: Number,
    afterTreadmillKm: Number,
    afterTreadmillMins: Number,
    afterTreadmillSpeed: Number,
    afterTreadmillIncline: Number,
    afterTreadmillNote: String,
    cardioType: String,
    runs: { type: Array, default: [] },
    finished: { type: Boolean, default: false }
  },
  { timestamps: true }
);
gymSchema.index({ owner: 1, date: 1 }, { unique: true });
gymSchema.index({ owner: 1, finished: 1, date: -1 });
gymSchema.index({ owner: 1, date: -1 }); // for history sort
const GymSession = model("GymSession", gymSchema);

function hashPass(pass, salt) {
  return crypto.scryptSync(String(pass), salt, 32).toString("hex");
}
function num(v) {
  if (v === "" || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function dayFromDate(dateStr) {
  return DAYS[new Date(dateStr + "T12:00:00").getDay()];
}
function isAdminUser(username) {
  return !!(PREM.adminUsers && PREM.adminUsers.map(function (x) { return String(x).toLowerCase(); }).includes(String(username || "").toLowerCase()));
}
function hasActivePremium(u) {
  if (!u) return false;
  if (isAdminUser(u.username)) return true;
  if (!u.premium) return false;
  return !u.premiumUntil || new Date(u.premiumUntil).getTime() > Date.now();
}
async function grantPremium(username, days) {
  const user = await User.findOne({ username }).lean();
  if (!user) throw new Error("User nahi mila");
  const now = Date.now();
  const currentUntil = user.premium && user.premiumUntil ? new Date(user.premiumUntil).getTime() : 0;
  const base = currentUntil > now ? currentUntil : now;
  const until = new Date(base + Math.max(1, Number(days) || 30) * 86400000);
  await User.updateOne({ username }, { $set: { premium: true, premiumUntil: until, premiumReminderDaysSent: [] } });
  cacheDel("me:" + username);
  return until;
}
function publicUser(u) {
  if (!u) {
    return {
      username: "", displayName: "", gender: "", goalWeight: null, schedule: {}, createdAt: null,
      age: null, heightCm: null, currentWeight: null, fitnessGoal: "", trainingLevel: "", photoUrl: "", preferredDays: []
    };
  }
  return {
    username: u.username,
    displayName: u.displayName || "",
    gender: u.gender || "",
    goalWeight: u.goalWeight != null ? u.goalWeight : null,
    schedule: u.schedule && typeof u.schedule === "object" ? u.schedule : {},
    createdAt: u.createdAt || null,
    age: u.age != null ? u.age : null,
    heightCm: u.heightCm != null ? u.heightCm : null,
    currentWeight: u.currentWeight != null ? u.currentWeight : null,
    fitnessGoal: u.fitnessGoal || "",
    trainingLevel: u.trainingLevel || "",
    photoUrl: u.photoUrl || "",
    preferredDays: Array.isArray(u.preferredDays) ? u.preferredDays : [],
    premium: hasActivePremium(u),
    premiumUntil: isAdminUser(u.username) ? null : (u.premiumUntil || null),
    isAdmin: isAdminUser(u.username),
    premiumDaysLeft: isAdminUser(u.username) || !u.premiumUntil ? null : Math.max(0, Math.ceil((new Date(u.premiumUntil).getTime() - Date.now()) / 86400000))
  };
}
function withDiff(rows) {
  const oldest = rows.slice().sort((a, b) => a.date.localeCompare(b.date));
  const extra = {};
  let prev = null;
  oldest.forEach((row) => {
    const curr = Number(row.entryWeight);
    let diff = null;
    let trend = "same";
    if (Number.isFinite(curr) && prev != null) {
      diff = Math.round((curr - prev) * 10) / 10;
      trend = diff > 0 ? "up" : diff < 0 ? "down" : "same";
    }
    extra[row.date] = { diff, trend, prevWeight: prev };
    if (Number.isFinite(curr)) prev = curr;
  });
  return rows
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((row) => Object.assign(row, extra[row.date] || {}));
}

async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  if (!MONGODB_URI) {
    const err = new Error("MONGODB_URI missing");
    err.status = 500;
    throw err;
  }
  await mongoose.connect(MONGODB_URI, {
    dbName: "sidhi_gym",
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000
  });
}

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(async (req, res, next) => {
  if (req.path === "/" || !req.path.startsWith("/api")) return next();
  try { await connectDB(); next(); }
  catch (err) { res.status(500).json({ error: "Mongo connect nahi hua. Vercel me MONGODB_URI check karo." }); }
});

// Auth: avoid write on every request. Only extend if < 7 days left.
async function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.replace(/^Bearer\s+/i, "").trim();
  if (!token) return res.status(401).json({ error: "Login chahiye" });

  const cacheKey = "tok:" + token;
  let row = cacheGet(cacheKey);
  if (!row) {
    row = await Token.findOne({ token, exp: { $gt: new Date() } }).lean();
    if (row) cacheSet(cacheKey, row, 60 * 1000); // 60s cache
  }
  if (!row) return res.status(401).json({ error: "Login expire. Phir se login karo." });

  // Extend only if close to expiry (async, non-blocking)
  const msLeft = new Date(row.exp).getTime() - Date.now();
  if (msLeft < 7 * 24 * 60 * 60 * 1000) {
    Token.updateOne({ token }, { $set: { exp: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } }).catch(() => {});
    cacheDel(cacheKey);
  }

  req.gymUser = row.username;
  next();
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, mongo: mongoose.connection.readyState === 1, cacheSize: cache.size });
});

app.post("/api/register", async (req, res) => {
  try {
    const username = String(req.body.username || req.body.user || "").trim().toLowerCase();
    const pass = String(req.body.password || req.body.pass || "");
    const displayName = String(req.body.displayName || req.body.name || "").trim().slice(0, 40);
    const gender = String(req.body.gender || "").toLowerCase();
    const email = String(req.body.email || "").trim().toLowerCase();
    const otp = String(req.body.otp || req.body.code || "").trim();
    if (!/^[a-z0-9_]{2,32}$/.test(username)) {
      return res.status(400).json({ error: "Username 2-32, sirf letters/numbers/_ " });
    }
    if (pass.length < 6) return res.status(400).json({ error: "Password kam se kam 6 character" });
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ error: "Email sahi likho" });
    if (!/^\d{6}$/.test(otp)) return res.status(400).json({ error: "6 digit OTP daalo" });
    const Otp = mongoose.models.Otp;
    const otpRow = Otp && await Otp.findOne({ email: email, code: otp, exp: { $gt: new Date() } });
    if (!otpRow) return res.status(401).json({ error: "OTP galat ya expire. Pehle email pe code lo." });
    const exists = await User.findOne({ username });
    if (exists) return res.status(409).json({ error: "Ye username pehle se hai. Login karo." });
    const mailTaken = await mongoose.connection.collection("users").findOne({ email: email });
    if (mailTaken) return res.status(409).json({ error: "Ye email pehle se kisi account pe hai." });
    const salt = crypto.randomBytes(16).toString("hex");
    await User.create({
      username,
      salt,
      passHash: hashPass(pass, salt),
      displayName,
      gender: gender === "female" ? "female" : gender === "male" ? "male" : ""
    });
    await mongoose.connection.collection("users").updateOne({ username }, { $set: { email: email } });
    if (Otp) await Otp.deleteMany({ email: email });
    const token = crypto.randomBytes(24).toString("hex");
    await Token.create({ token, username, exp: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) });
    res.json({ ok: true, username, token, displayName, gender: gender === "female" ? "female" : gender === "male" ? "male" : "" });
  } catch (err) {
    if (err && err.code === 11000) return res.status(409).json({ error: "Ye username pehle se hai." });
    res.status(500).json({ error: "Register fail" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const username = String(req.body.username || req.body.user || "").trim().toLowerCase();
    const pass = String(req.body.password || req.body.pass || "");
    if (pass.length < 6) return res.status(400).json({ error: "Password kam se kam 6 character" });
    const row = await User.findOne({ username });
    if (!row || row.passHash !== hashPass(pass, row.salt)) {
      return res.status(401).json({ error: "Galat username / password" });
    }
    const token = crypto.randomBytes(24).toString("hex");
    await Token.create({ token, username, exp: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) });
    res.json({ ok: true, username, token, displayName: row.displayName || "", gender: row.gender || "" });
  } catch (err) {
    res.status(500).json({ error: "Login fail" });
  }
});

app.get("/api/me", auth, async (req, res) => {
  const ck = "me:" + req.gymUser;
  let u = cacheGet(ck);
  if (!u) {
    u = await User.findOne({ username: req.gymUser }).lean();
    cacheSet(ck, u, 30 * 1000);
  }
  const pub = publicUser(u);
  if (isAdminUser(req.gymUser)) {
    pub.premium = true;
    pub.isAdmin = true;
    pub.premiumUntil = null;
    pub.premiumDaysLeft = null;
    pub.membershipType = "admin-lifetime";
  } else {
    pub.membershipType = pub.premium ? "premium" : "normal";
  }
  res.json(Object.assign({ ok: true }, pub));
});

app.patch("/api/me", auth, async (req, res) => {
  const set = {};
  ["goalWeight", "age", "heightCm", "currentWeight"].forEach(function (k) {
    if (Object.prototype.hasOwnProperty.call(req.body, k)) set[k] = num(req.body[k]);
  });
  if (Object.prototype.hasOwnProperty.call(req.body, "displayName")) set.displayName = String(req.body.displayName || "").trim().slice(0, 40);
  if (Object.prototype.hasOwnProperty.call(req.body, "gender")) {
    const g = String(req.body.gender || "").toLowerCase();
    set.gender = g === "female" ? "female" : g === "male" ? "male" : "";
  }
  if (Object.prototype.hasOwnProperty.call(req.body, "fitnessGoal")) set.fitnessGoal = String(req.body.fitnessGoal || "").slice(0, 40);
  if (Object.prototype.hasOwnProperty.call(req.body, "trainingLevel")) set.trainingLevel = String(req.body.trainingLevel || "").slice(0, 24);
  if (Object.prototype.hasOwnProperty.call(req.body, "photoUrl")) set.photoUrl = String(req.body.photoUrl || "").slice(0, 400000);
  if (Array.isArray(req.body.preferredDays)) set.preferredDays = req.body.preferredDays.slice(0, 7);
  if (req.body.schedule && typeof req.body.schedule === "object") set.schedule = req.body.schedule;
  const u = await User.findOneAndUpdate({ username: req.gymUser }, { $set: set }, { new: true }).lean();
  cacheDel("me:" + req.gymUser);
  res.json(Object.assign({ ok: true }, publicUser(u)));
});

app.delete("/api/me", auth, async (req, res) => {
  const pass = String((req.body && (req.body.password || req.body.pass)) || "");
  const u = await User.findOne({ username: req.gymUser });
  if (!u) return res.status(404).json({ error: "User nahi mila" });
  if (pass.length < 6 || u.passHash !== hashPass(pass, u.salt)) {
    return res.status(401).json({ error: "Galat password" });
  }
  await GymSession.deleteMany({ owner: req.gymUser });
  await Token.deleteMany({ username: req.gymUser });
  await User.deleteOne({ username: req.gymUser });
  cacheDel("me:" + req.gymUser);
  cacheDel("sess:" + req.gymUser);
  res.json({ ok: true });
});

app.get("/api/export", auth, async (req, res) => {
  const rows = await GymSession.find({ owner: req.gymUser }).sort({ date: -1 }).lean();
  const u = await User.findOne({ username: req.gymUser }).lean();
  res.json({ ok: true, user: publicUser(u), sessions: withDiff(rows) });
});

app.get("/api/sessions", auth, async (req, res) => {
  const ck = "sess:" + req.gymUser;
  let withD = cacheGet(ck);
  if (!withD) {
    const rows = await GymSession.find({ owner: req.gymUser })
      .sort({ date: -1 })
      .lean();
    withD = withDiff(rows);
    cacheSet(ck, withD, 15 * 1000); // 15s — short so finish workout feels fresh
  }
  res.json({ sessions: withD });
});

app.put("/api/session", auth, async (req, res) => {
  const date = String(req.body.date || "").slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return res.status(400).json({ error: "Date galat" });
  const day = dayFromDate(date);
  const u = await User.findOne({ username: req.gymUser }).lean();
  const custom = u && u.schedule && u.schedule[day];
  const prev = await GymSession.findOne({ owner: req.gymUser, date }).lean();
  function keep(key, incoming) {
    if (incoming !== undefined && incoming !== null && incoming !== "") return incoming;
    if (prev && prev[key] != null && prev[key] !== "") return prev[key];
    return incoming;
  }
  const doc = {
    owner: req.gymUser,
    date,
    day,
    workoutName: custom || (prev && prev.workoutName) || SPLIT[day],
    entryTime: keep("entryTime", req.body.entryTime || ""),
    entryWeight: num(req.body.entryWeight) != null ? num(req.body.entryWeight) : (prev && prev.entryWeight),
    after1HourTime: keep("after1HourTime", req.body.after1HourTime || ""),
    after1HourWeight: num(req.body.after1HourWeight) != null ? num(req.body.after1HourWeight) : (prev && prev.after1HourWeight),
    after1HourNote: Object.prototype.hasOwnProperty.call(req.body, "after1HourNote") ? (req.body.after1HourNote || "") : (prev && prev.after1HourNote) || "",
    lifts: Array.isArray(req.body.lifts) ? req.body.lifts : ((prev && prev.lifts) || []),
    beforeTreadmillTime: keep("beforeTreadmillTime", req.body.beforeTreadmillTime || ""),
    beforeTreadmillType: req.body.beforeTreadmillType || req.body.cardioType || (prev && prev.beforeTreadmillType) || "walk",
    beforeTreadmillWeight: num(req.body.beforeTreadmillWeight) != null ? num(req.body.beforeTreadmillWeight) : (prev && prev.beforeTreadmillWeight),
    beforeTreadmillKm: num(req.body.beforeTreadmillKm) != null ? num(req.body.beforeTreadmillKm) : (prev && prev.beforeTreadmillKm),
    beforeTreadmillMins: num(req.body.beforeTreadmillMins) != null ? num(req.body.beforeTreadmillMins) : (prev && prev.beforeTreadmillMins),
    beforeTreadmillSpeed: num(req.body.beforeTreadmillSpeed) != null ? num(req.body.beforeTreadmillSpeed) : (prev && prev.beforeTreadmillSpeed),
    beforeTreadmillIncline: num(req.body.beforeTreadmillIncline) != null ? num(req.body.beforeTreadmillIncline) : (prev && prev.beforeTreadmillIncline),
    beforeTreadmillNote: Object.prototype.hasOwnProperty.call(req.body, "beforeTreadmillNote") ? (req.body.beforeTreadmillNote || "") : (prev && prev.beforeTreadmillNote) || "",
    afterTreadmillTime: keep("afterTreadmillTime", req.body.afterTreadmillTime || ""),
    afterTreadmillType: req.body.afterTreadmillType || (prev && prev.afterTreadmillType) || "",
    afterTreadmillWeight: num(req.body.afterTreadmillWeight) != null ? num(req.body.afterTreadmillWeight) : (prev && prev.afterTreadmillWeight),
    afterTreadmillKm: num(req.body.afterTreadmillKm) != null ? num(req.body.afterTreadmillKm) : (prev && prev.afterTreadmillKm),
    afterTreadmillMins: num(req.body.afterTreadmillMins) != null ? num(req.body.afterTreadmillMins) : (prev && prev.afterTreadmillMins),
    afterTreadmillSpeed: num(req.body.afterTreadmillSpeed) != null ? num(req.body.afterTreadmillSpeed) : (prev && prev.afterTreadmillSpeed),
    afterTreadmillIncline: num(req.body.afterTreadmillIncline) != null ? num(req.body.afterTreadmillIncline) : (prev && prev.afterTreadmillIncline),
    afterTreadmillNote: Object.prototype.hasOwnProperty.call(req.body, "afterTreadmillNote") ? (req.body.afterTreadmillNote || "") : (prev && prev.afterTreadmillNote) || "",
    cardioType: req.body.cardioType || (prev && prev.cardioType) || "",
    runs: Array.isArray(req.body.runs) ? req.body.runs : ((prev && prev.runs) || []),
    finished: req.body.finished != null ? !!req.body.finished : !!(prev && prev.finished)
  };
  await GymSession.findOneAndUpdate(
    { owner: req.gymUser, date },
    { $set: doc },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();
  cacheDel("sess:" + req.gymUser); // invalidate
  const rows = await GymSession.find({ owner: req.gymUser }).sort({ date: -1 }).lean();
  const withD = withDiff(rows);
  cacheSet("sess:" + req.gymUser, withD, 15 * 1000);
  res.json({ ok: true, session: withD.find((s) => s.date === date), sessions: withD });
});

app.delete("/api/session/:date", auth, async (req, res) => {
  await GymSession.deleteOne({ owner: req.gymUser, date: req.params.date });
  cacheDel("sess:" + req.gymUser);
  const rows = await GymSession.find({ owner: req.gymUser }).sort({ date: -1 }).lean();
  const withD = withDiff(rows);
  cacheSet("sess:" + req.gymUser, withD, 15 * 1000);
  res.json({ ok: true, sessions: withD });
});


// Premium: CSV export
app.get("/api/export.csv", auth, async (req, res) => {
  const u = await User.findOne({ username: req.gymUser }).lean();
  if (!hasActivePremium(u)) return res.status(402).json({ error: "Premium chahiye export ke liye" });
  const rows = await GymSession.find({ owner: req.gymUser }).sort({ date: -1 }).lean();
  let csv = "date,day,workout,entryWeight,finished,note\n";
  rows.forEach(r => {
    csv += [r.date, r.day||"", (r.workoutName||"").replace(/,/g," "), r.entryWeight||"", r.finished?"yes":"no", (r.after1HourNote||"").replace(/,/g," ")].join(",") + "\n";
  });
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=sidhi-gym-export.csv");
  res.send(csv);
});

// Razorpay premium
const RAZOR_KEY = process.env.RAZORPAY_KEY_ID || "rzp_live_Tt4gpscQgtM9j0";
const RAZOR_SECRET = process.env.RAZORPAY_KEY_SECRET || "";

app.get("/api/premium/price", (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.json({ ok: true, price: Number(PREM.price || 49), label: String(PREM.label || "month"), offer: String(PREM.offer || ""), durationDays: Math.max(1, Number(PREM.durationDays || 30)) });
});

app.post("/api/premium/order", auth, async (req, res) => {
  if (!RAZOR_SECRET) return res.status(500).json({ error: "Razorpay secret missing on server" });
  const amount = Math.max(100, Math.round(Number(PREM.price || 49) * 100)); // configured price in paise
  const orderId = "order_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
  // Simple order create via Razorpay API
  const authHeader = Buffer.from(RAZOR_KEY + ":" + RAZOR_SECRET).toString("base64");
  try {
    const r = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Basic " + authHeader },
      body: JSON.stringify({ amount, currency: "INR", receipt: orderId, notes: { user: req.gymUser } })
    });
    const data = await r.json();
    if (!r.ok) return res.status(400).json({ error: data.error?.description || "Order fail" });
    res.json({ ok: true, orderId: data.id, amount, key: RAZOR_KEY, username: req.gymUser });
  } catch (e) {
    res.status(500).json({ error: "Razorpay unreachable" });
  }
});

app.post("/api/premium/verify", auth, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: "Missing payment data" });
  }
  const expected = crypto.createHmac("sha256", RAZOR_SECRET).update(razorpay_order_id + "|" + razorpay_payment_id).digest("hex");
  if (expected !== razorpay_signature) return res.status(400).json({ error: "Invalid signature" });
  const durationDays = Math.max(1, Number(PREM.durationDays || 30));
  const until = await grantPremium(req.gymUser, durationDays);
  res.json({ ok: true, premium: true, until, daysLeft: durationDays });
});


// Promo codes are stored in MongoDB and atomically claimed so each code works once.
app.post("/api/admin/promo", auth, async (req, res) => {
  if (!isAdminUser(req.gymUser)) return res.status(403).json({ error: "Admin only" });
  const days = Math.max(1, Math.min(365, Math.floor(Number(req.body.days || 30))));
  let code = String(req.body.code || "").trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 32);
  try {
    if (code) {
      const existing = await PromoCode.findOne({ code }).lean();
      if (existing) return res.status(409).json({ error: "Ye code pehle se hai. Naya code banao." });
    } else {
      for (let i = 0; i < 5; i++) {
        const candidate = "GIFT" + crypto.randomBytes(4).toString("hex").toUpperCase();
        if (!(await PromoCode.exists({ code: candidate }))) { code = candidate; break; }
      }
      if (!code) return res.status(500).json({ error: "Code generate nahi hua, retry karo." });
    }
    const doc = await PromoCode.create({ code, days, used: false, createdBy: req.gymUser });
    res.json({ ok: true, code: doc.code, days: doc.days, used: false });
  } catch (err) {
    if (err && err.code === 11000) return res.status(409).json({ error: "Ye code pehle se hai. Naya code banao." });
    res.status(500).json({ error: "Gift code save nahi hua." });
  }
});

app.get("/api/admin/promos", auth, async (req, res) => {
  if (!isAdminUser(req.gymUser)) return res.status(403).json({ error: "Admin only" });
  const promos = await PromoCode.find({}).sort({ createdAt: -1 }).limit(200).lean();
  res.json({ ok: true, promos: promos.map(p => ({ code: p.code, days: p.days, used: !!p.used, usedBy: p.usedBy || "", usedAt: p.usedAt || null })) });
});

app.post("/api/premium/redeem", auth, async (req, res) => {
  const code = String(req.body.code || "").trim().toUpperCase();
  if (!code || code.length > 32) return res.status(400).json({ error: "Invalid or used code" });
  // Atomic claim prevents two users from redeeming the same code concurrently.
  const p = await PromoCode.findOneAndUpdate(
    { code, used: false },
    { $set: { used: true, usedBy: req.gymUser, usedAt: new Date() } },
    { new: true }
  ).lean();
  if (!p) return res.status(400).json({ error: "Invalid or used code" });
  try {
    const until = await grantPremium(req.gymUser, p.days);
    res.json({ ok: true, days: p.days, until });
  } catch (err) {
    // Do not silently leave a claimed code unusable if activation fails.
    await PromoCode.updateOne({ code, usedBy: req.gymUser }, { $set: { used: false, usedBy: "", usedAt: null } });
    res.status(500).json({ error: "Premium activate nahi hua. Dobara try karo." });
  }
});


app.get("/api/premium/insights", auth, async (req, res) => {
  const user = await User.findOne({ username: req.gymUser }).lean();
  if (!hasActivePremium(user)) return res.status(402).json({ error: "Premium chahiye workout insights ke liye" });
  const rows = await GymSession.find({ owner: req.gymUser }).sort({ date: -1 }).lean();
  const weights = rows.map(r => Number(r.entryWeight)).filter(n => Number.isFinite(n) && n > 0);
  const cardioKm = rows.reduce((sum, r) => sum + (Number(r.beforeTreadmillKm) || 0) + (Number(r.afterTreadmillKm) || 0), 0);
  res.setHeader("Cache-Control", "no-store");
  res.json({
    ok: true,
    totalWorkouts: rows.length,
    completedWorkouts: rows.filter(r => !!r.finished).length,
    cardioKm: Math.round(cardioKm * 100) / 100,
    bestRecordedWeight: weights.length ? Math.max.apply(null, weights) : null,
    latestWeight: rows.length && Number.isFinite(Number(rows[0].entryWeight)) ? Number(rows[0].entryWeight) : null
  });
});


 // Gemini-powered Premium Gym Coach. The API key is read only on the server.
const aiCoachUsage = new Map();
app.post("/api/premium/ai-coach", auth, async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: "AI Coach abhi setup nahi hai. Admin ko Vercel mein GEMINI_API_KEY set karni hogi." });
  const user = await User.findOne({ username: req.gymUser }).lean();
  if (!hasActivePremium(user)) return res.status(402).json({ error: "Gemini AI Coach ke liye Premium chahiye." });
  const question = String((req.body && req.body.question) || "").trim().slice(0, 1200);
  if (question.length < 2) return res.status(400).json({ error: "Apna fitness sawaal likho." });
  const day = new Date().toISOString().slice(0, 10);
  const usageKey = req.gymUser + ":" + day;
  const used = aiCoachUsage.get(usageKey) || 0;
  if (used >= 5) return res.status(429).json({ error: "Aaj ke 5 AI Coach questions use ho gaye. Kal dobara try karna." });
  aiCoachUsage.set(usageKey, used + 1);
  if (aiCoachUsage.size > 5000) {
    for (const key of aiCoachUsage.keys()) if (!key.endsWith(":" + day)) aiCoachUsage.delete(key);
  }
  try {
    const rows = await GymSession.find({ owner: req.gymUser }).sort({ date: -1 }).limit(10).lean();
    const workoutContext = rows.map(r => ({
      date: r.date,
      workout: String(r.workoutName || r.day || "Workout").slice(0, 80),
      completed: !!r.finished,
      bodyWeightKg: Number.isFinite(Number(r.entryWeight)) ? Number(r.entryWeight) : null,
      cardioKm: Math.round(((Number(r.beforeTreadmillKm) || 0) + (Number(r.afterTreadmillKm) || 0)) * 100) / 100,
      lifts: (Array.isArray(r.lifts) ? r.lifts : []).slice(0, 12).map(l => ({
        exercise: String(l.name || l.exercise || "").slice(0, 60),
        weightKg: Number(l.weight || l.kg) || null,
        reps: Number(l.reps) || null,
        sets: Number(l.sets) || null
      }))
    }));
    const profile = {
      age: Number(user.age) || null,
      heightCm: Number(user.heightCm) || null,
      currentWeightKg: Number(user.currentWeight) || null,
      goalWeightKg: Number(user.goalWeight) || null,
      goal: String(user.fitnessGoal || "").slice(0, 80),
      trainingLevel: String(user.trainingLevel || "").slice(0, 40)
    };
    const prompt = [
      "You are SIDHI GYM's practical fitness coach. Reply in the user's language; default to clear Hindi/Hinglish.",
      "Use the supplied profile and workout logs when relevant. Give concise, specific, beginner-safe advice, including sets/reps or a simple next step where useful.",
      "Never diagnose disease, prescribe medicine, recommend steroids, extreme dieting, dehydration, or dangerous max attempts. Ask the user to stop for chest pain, faintness, or severe pain and seek urgent medical care. For medical conditions/injuries, recommend a qualified clinician.",
      "If the data is missing, say so instead of inventing progress. State that calorie/protein estimates are approximate. Avoid repeating personal information unless needed.",
      "Profile JSON: " + JSON.stringify(profile),
      "Recent workout logs JSON (up to 10): " + JSON.stringify(workoutContext),
      "User question: " + question
    ].join("\n\n");
    const modelName = String(process.env.GEMINI_MODEL || "gemini-3.5-flash-lite").trim();
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(modelName) + ":generateContent?key=" + encodeURIComponent(apiKey), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: "You are a responsible fitness coach for the SIDHI GYM app. Do not claim to be a doctor." }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.45, maxOutputTokens: 700 }
      }),
      signal: AbortSignal.timeout(25000)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 429) return res.status(429).json({ error: "Gemini free quota abhi limit par hai. Kuch der baad try karo." });
      if (response.status === 401 || response.status === 403) return res.status(503).json({ error: "Gemini API key ya API access check karna hoga." });
      return res.status(502).json({ error: "Gemini response nahi de paya. Thodi der baad retry karo." });
    }
    const answer = (data.candidates || []).flatMap(c => (c.content && c.content.parts) || []).map(p => p.text || "").join("\n").trim();
    if (!answer) return res.status(502).json({ error: "AI ka jawab khaali aaya. Dobara try karo." });
    res.json({ ok: true, answer, remainingToday: Math.max(0, 4 - used) });
  } catch (err) {
    const message = err && err.name === "TimeoutError" ? "Gemini response mein der ho rahi hai. Dobara try karo." : "AI Coach abhi unavailable hai. Thodi der baad try karo.";
    res.status(502).json({ error: message });
  }
});

app.get("/api/premium/reminders", auth, async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  const user = await User.findOne({ username: req.gymUser }).lean();
  if (!user || isAdminUser(req.gymUser) || !hasActivePremium(user) || !user.premiumUntil) {
    return res.json({ ok: true, reminders: [] });
  }
  const daysLeft = Math.max(0, Math.ceil((new Date(user.premiumUntil).getTime() - Date.now()) / 86400000));
  if (![1, 2].includes(daysLeft) || (user.premiumReminderDaysSent || []).includes(daysLeft)) {
    return res.json({ ok: true, reminders: [] });
  }
  const claimed = await User.updateOne(
    { username: req.gymUser, premiumReminderDaysSent: { $ne: daysLeft } },
    { $addToSet: { premiumReminderDaysSent: daysLeft } }
  );
  if (!claimed.modifiedCount) return res.json({ ok: true, reminders: [] });
  res.setHeader("Cache-Control", "no-store");
  res.json({ ok: true, reminders: [{ daysLeft, message: daysLeft === 1 ? "Your SIDHI GYM Premium expires tomorrow. Renew now to keep premium features." : "Your SIDHI GYM Premium expires in 2 days. Renew now to keep premium features." }] });
});

app.get("/api/admin/premium-users", auth, async (req, res) => {
  if (!isAdminUser(req.gymUser)) return res.status(403).json({ error: "Admin only" });
  const users = await User.find({ $or: [{ premium: true }, { username: { $in: PREM.adminUsers.map(x => String(x).toLowerCase()) } }] }, { username: 1, displayName: 1, premium: 1, premiumUntil: 1, createdAt: 1 }).lean();
  const list = users.map(u => ({
    username: u.username,
    name: u.displayName || u.username,
    isAdmin: isAdminUser(u.username),
    until: isAdminUser(u.username) ? null : u.premiumUntil,
    daysLeft: isAdminUser(u.username) || !u.premiumUntil ? null : Math.max(0, Math.ceil((new Date(u.premiumUntil) - Date.now()) / 86400000)),
    active: hasActivePremium(u)
  }));
  res.json({ ok: true, users: list });
});

require("./admin-routes")(app, { User: User, Token: Token, hashPass: hashPass });
require("./otp-routes")(app);

app.use(express.static(path.join(__dirname, "public")));
app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) return res.status(404).json({ error: "not found" });
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

module.exports = app;

if (!process.env.VERCEL) {
  connectDB()
    .then(() => { app.listen(PORT, () => console.log("Sidhi Gym http://localhost:" + PORT)); })
    .catch((err) => { console.error("Mongo fail:", err.message); process.exit(1); });
}
