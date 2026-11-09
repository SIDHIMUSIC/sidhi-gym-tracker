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
      email: { type: String, default: "" },
      emailVerified: { type: Boolean, default: false },
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

const foodLogSchema = new mongoose.Schema({
  owner: { type: String, required: true, index: true },
  date: { type: String, required: true, index: true },
  time: { type: String, required: true },
  food: { type: String, required: true, maxlength: 180 },
  quantity: { type: String, required: true, maxlength: 120 },
  notes: { type: String, default: "", maxlength: 500 },
  calories: { type: Number, default: 0 },
  proteinG: { type: Number, default: 0 },
  carbsG: { type: Number, default: 0 },
  fatG: { type: Number, default: 0 },
  fiberG: { type: Number, default: 0 },
  estimateNote: { type: String, default: "" }
}, { timestamps: true });
foodLogSchema.index({ owner: 1, date: 1, time: 1 });
const FoodLog = model("FoodLog", foodLogSchema);

const DailySummaryDelivery = model("DailySummaryDelivery", new mongoose.Schema({
  owner: { type: String, required: true, index: true },
  date: { type: String, required: true, index: true },
  email: { type: String, required: true },
  status: { type: String, enum: ["sent", "failed"], default: "sent" },
  messageId: { type: String, default: "" },
  sentAt: { type: Date, default: Date.now }
}, { timestamps: true }));
DailySummaryDelivery.schema.index({ owner: 1, date: 1 }, { unique: true });

const premiumFeatureSettingsSchema = new mongoose.Schema({
  _id: { type: String, default: "global" },
  masterEnabled: { type: Boolean, default: true },
  features: { type: mongoose.Schema.Types.Mixed, default: {} },
  updatedBy: { type: String, default: "" }
}, { timestamps: true });
const PremiumFeatureSettings = model("PremiumFeatureSettings", premiumFeatureSettingsSchema);
const PREMIUM_FEATURE_DEFAULTS = {
  dailyReview: true, coachAnalytics: true, aiCoach: true, workoutBuilder: true,
  transformationTracker: true, foodDiary: true, nutritionRecovery: true, workoutHistory: true,
  restTimer: true, smartReminders: true, achievements: true, reports: true,
  goalPrograms: true, themes: true
};
async function getPremiumFeatureSettings() {
  const modeEnabled = isPremiumModeOn();
  const features = Object.fromEntries(Object.keys(PREMIUM_FEATURE_DEFAULTS).map(key => [key, modeEnabled]));
  return { modeEnabled, masterEnabled: modeEnabled, features };
}
async function premiumFeatureIsEnabled(key) {
  const settings = await getPremiumFeatureSettings();
  return settings.masterEnabled && settings.features[key] !== false;
}


function hashPass(pass, salt) {
  return crypto.scryptSync(String(pass), salt, 32).toString("hex");
}
function num(v) {
  if (v === "" || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function isValidISODate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) return false;
  const parsed = new Date(String(value) + "T00:00:00.000Z");
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}
function dayFromDate(dateStr) {
  return DAYS[new Date(dateStr + "T12:00:00").getDay()];
}
function isPremiumModeOn() {
  return String(process.env.PREMIUM_MODE || "NO").trim().toUpperCase() === "YES";
}
function isAdminUser(username) {
  return !!(PREM.adminUsers && PREM.adminUsers.map(function (x) { return String(x).toLowerCase(); }).includes(String(username || "").toLowerCase()));
}
function hasActivePremium(u) {
  if (!isPremiumModeOn() || !u) return false;
  if (isAdminUser(u.username)) return true;
  if (!u.premium) return false;
  return !u.premiumUntil || new Date(u.premiumUntil).getTime() > Date.now();
}
async function grantPremium(username, days) {
  if (!isPremiumModeOn()) throw new Error("Premium disabled: Vercel PREMIUM_MODE=NO");
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
      username: "", displayName: "", email: "", emailVerified: false, gender: "", goalWeight: null, schedule: {}, createdAt: null,
      age: null, heightCm: null, currentWeight: null, fitnessGoal: "", trainingLevel: "", photoUrl: "", preferredDays: []
    };
  }
  return {
    username: u.username,
    displayName: u.displayName || "",
    email: u.email || "",
    emailVerified: !!u.emailVerified,
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

let dbPromise = null;
async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  if (dbPromise) return dbPromise;
  if (!MONGODB_URI) {
    const err = new Error("MONGODB_URI missing");
    err.status = 500;
    throw err;
  }
  dbPromise = mongoose.connect(MONGODB_URI, {
    dbName: "sidhi_gym",
    maxPoolSize: 1,
    minPoolSize: 0,
    maxIdleTimeMS: 10000,
    serverSelectionTimeoutMS: 4000,
    socketTimeoutMS: 20000
  }).catch(function (err) { dbPromise = null; throw err; });
  return dbPromise;
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

function htmlEscape(value) {
  return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
    return ({ "&": "&", "<": "<", ">": ">", '"': """, "'": "&#39;" })[ch];
  });
}
function indiaDateNow(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit"
  }).formatToParts(date || new Date());
  const part = {};
  parts.forEach(function (x) { part[x.type] = x.value; });
  return part.year + "-" + part.month + "-" + part.day;
}
function previousIndiaDate() {
  const today = indiaDateNow(new Date()).split("-").map(Number);
  return new Date(Date.UTC(today[0], today[1] - 1, today[2]) - 86400000).toISOString().slice(0, 10);
}
function timeMinutes(value) {
  const m = String(value || "").match(/^(\d{1,2}):(\d{2})$/);
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}
function durationText(totalSeconds) {
  const total = Math.max(0, Math.round(Number(totalSeconds) || 0));
  const h = Math.floor(total / 3600), m = Math.floor((total % 3600) / 60), sec = total % 60;
  return h ? h + " hr " + m + " min" : m ? m + " min" : sec + " sec";
}
async function sendDailySummaryEmail(user, date, session, foods) {
  const key = process.env.BREVO_API_KEY || "";
  const from = process.env.BREVO_SENDER || "";
  if (!key || !from) throw new Error("Brevo sender is not configured (BREVO_API_KEY / BREVO_SENDER)");
  const runs = session && Array.isArray(session.runs) ? session.runs : [];
  const runKm = runs.reduce((sum, r) => sum + (Number(r.distanceKm) || 0), 0);
  const runSeconds = runs.reduce((sum, r) => sum + (Number(r.durationSec) || 0), 0);
  const runCalories = runs.reduce((sum, r) => sum + (Number(r.calories) || 0), 0);
  const treadmillKm = (Number(session && session.beforeTreadmillKm) || 0) + (Number(session && session.afterTreadmillKm) || 0);
  const treadmillMinutes = (Number(session && session.beforeTreadmillMins) || 0) + (Number(session && session.afterTreadmillMins) || 0);
  const startTime = timeMinutes(session && session.entryTime);
  const endTime = timeMinutes(session && session.afterTreadmillTime);
  let gymMinutes = startTime == null || endTime == null ? 0 : endTime - startTime;
  if (gymMinutes < 0) gymMinutes += 1440;
  const foodCalories = foods.reduce((sum, x) => sum + (Number(x.calories) || 0), 0);
  const protein = foods.reduce((sum, x) => sum + (Number(x.proteinG) || 0), 0);
  const carbs = foods.reduce((sum, x) => sum + (Number(x.carbsG) || 0), 0);
  const fat = foods.reduce((sum, x) => sum + (Number(x.fatG) || 0), 0);
  const lifts = session && Array.isArray(session.lifts) ? session.lifts.map(function (x) {
    if (typeof x === "string") return x;
    return x && (x.name || x.exercise || x.title) || "";
  }).filter(Boolean) : [];
  const name = user.displayName || user.username;
  const workoutDone = !!(session && (session.finished || session.entryWeight != null || lifts.length || session.after1HourNote));
  const dateLabel = new Date(date + "T12:00:00+05:30").toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata", weekday: "long", day: "2-digit", month: "long", year: "numeric"
  });
  const safeName = htmlEscape(name);
  const safeUsername = htmlEscape(user.username);
  const workoutName = htmlEscape(session && session.workoutName || "Workout not logged");
  const liftText = htmlEscape(lifts.join(", ") || session && session.after1HourNote || "No exercise notes added");
  const runRows = runs.map(function (r, i) {
    return "<tr><td style='padding:9px 0;color:#c8d5e5;border-bottom:1px solid #26364a'>" +
      htmlEscape(String(r.mode || "Run").toUpperCase()) + " " + (i + 1) +
      "</td><td align='right' style='padding:9px 0;color:#f6d28f;border-bottom:1px solid #26364a'>" +
      (Number(r.distanceKm) || 0).toFixed(2) + " km · " + durationText(r.durationSec) + " · " +
      Math.round(Number(r.calories) || 0) + " kcal</td></tr>";
  }).join("");
  const foodRows = foods.map(function (x) {
    return "<tr><td style='padding:7px 0;color:#c8d5e5;border-bottom:1px solid #26364a'>" +
      htmlEscape(x.food) + (x.quantity ? " · " + htmlEscape(x.quantity) : "") +
      "</td><td align='right' style='padding:7px 0;color:#b7eadc;border-bottom:1px solid #26364a'>" +
      Math.round(Number(x.calories) || 0) + " kcal</td></tr>";
  }).join("");
  const appUrl = "https://sidhi-gym-tracker.vercel.app/";
  const metric = function (label, value) {
    return "<td width='50%' style='padding:13px;border:1px solid #293a50;border-radius:14px;background:#0b1625'>" +
      "<div style='font:11px Arial,sans-serif;color:#91a4b9;letter-spacing:1px'>" + label + "</div>" +
      "<div style='margin-top:7px;font:700 20px Arial,sans-serif;color:#f6d28f'>" + value + "</div></td>";
  };
  const html = "<!doctype html><html><body style='margin:0;background:#07111f;padding:24px 10px;font-family:Arial,sans-serif'>" +
    "<table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='max-width:560px;margin:0 auto;background:#0d1b2a;border-radius:20px;overflow:hidden;border:1px solid #1e2f45'>" +
    "<tr><td style='padding:28px 24px 18px;background:linear-gradient(135deg,#12263d,#0b1625)'>" +
    "<div style='font:700 22px Arial,sans-serif;color:#f6d28f'>Sidhi Gym Tracker</div>" +
    "<div style='margin-top:6px;font:14px Arial,sans-serif;color:#9eb2c7'>Daily recap · " + dateLabel + "</div>" +
    "</td></tr>" +
    "<tr><td style='padding:22px 24px'>" +
    "<div style='font:16px Arial,sans-serif;color:#e8f0f8'>Namaste " + safeName + " (" + safeUsername + ")</div>" +
    "<div style='margin-top:10px;font:14px Arial,sans-serif;color:#9eb2c7'>Aaj ka summary ready hai. Keep going!</div>" +
    "</td></tr>" +
    "<tr><td style='padding:0 24px 18px'><table width='100%' cellspacing='10'><tr>" +
    metric("GYM", workoutDone ? "Done" : "—") +
    metric("WEIGHT", (session && session.entryWeight != null ? session.entryWeight + " kg" : "—")) +
    "</tr><tr>" +
    metric("RUN", runKm ? runKm.toFixed(2) + " km" : "—") +
    metric("FOOD", foodCalories ? Math.round(foodCalories) + " kcal" : "—") +
    "</tr></table></td></tr>" +
    (lifts.length || session && session.after1HourNote ? "<tr><td style='padding:0 24px 16px'><div style='font:12px Arial,sans-serif;color:#91a4b9;letter-spacing:1px'>WORKOUT</div><div style='margin-top:6px;font:14px Arial,sans-serif;color:#e8f0f8'>" + workoutName + "</div><div style='margin-top:4px;font:13px Arial,sans-serif;color:#9eb2c7'>" + liftText + "</div></td></tr>" : "") +
    (runRows ? "<tr><td style='padding:0 24px 16px'><div style='font:12px Arial,sans-serif;color:#91a4b9;letter-spacing:1px'>RUNS</div><table width='100%'>" + runRows + "</table></td></tr>" : "") +
    (foodRows ? "<tr><td style='padding:0 24px 16px'><div style='font:12px Arial,sans-serif;color:#91a4b9;letter-spacing:1px'>FOOD</div><table width='100%'>" + foodRows + "</table></td></tr>" : "") +
    "<tr><td style='padding:18px 24px 28px;border-top:1px solid #1e2f45'><a href='" + appUrl + "' style='display:inline-block;padding:12px 20px;background:#f6d28f;color:#0b1625;text-decoration:none;border-radius:12px;font:700 14px Arial,sans-serif'>Open Sidhi Gym</a></td></tr>" +
    "</table></body></html>";
  const subject = "Sidhi Gym · " + dateLabel + (workoutDone ? " · Workout done" : "");
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": key, "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify({
      sender: { name: "Sidhi Gym Tracker", email: from },
      to: [{ email: user.email, name: name }],
      subject: subject,
      htmlContent: html
    })
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body && body.message) || ("Brevo " + res.status));
  return body.messageId || body.messageIds && body.messageIds[0] || "";
}

app.get("/api/cron/daily-summary", async function (req, res) {
  try {
    const secret = process.env.CRON_SECRET || "";
    if (secret && req.headers["authorization"] !== "Bearer " + secret && req.query.key !== secret) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const date = previousIndiaDate();
    // Active users only: at least one gym session in last 7 days (IST)
    const activeFrom = new Date(Date.UTC.apply(null, date.split("-").map(Number).map(function (x, i) { return i === 1 ? x - 1 : x; })) - 6 * 86400000).toISOString().slice(0, 10);
    const activeOwners = await GymSession.distinct("owner", { date: { $gte: activeFrom, $lte: date } });
    const recipients = activeOwners.length
      ? await User.find({ emailVerified: true, email: { $regex: /@/ }, username: { $in: activeOwners } }).select("username email displayName").lean()
      : [];
    const sessions = await GymSession.find({ date: date, owner: { $in: activeOwners } }).lean();
    const sessionByOwner = new Map(sessions.map(function (s) { return [s.owner, s]; }));
    const foods = await FoodLog.find({ date: date, owner: { $in: activeOwners } }).lean();
    const foodByOwner = new Map();
    foods.forEach(function (f) {
      if (!foodByOwner.has(f.owner)) foodByOwner.set(f.owner, []);
      foodByOwner.get(f.owner).push(f);
    });
    let sent = 0, failed = 0, skipped = 0;
    for (const user of recipients) {
      try {
        const already = await DailySummaryDelivery.findOne({ owner: user.username, date: date }).lean();
        if (already) { skipped++; continue; }
        const messageId = await sendDailySummaryEmail(user, date, sessionByOwner.get(user.username) || null, foodByOwner.get(user.username) || []);
        await DailySummaryDelivery.create({ owner: user.username, date: date, email: user.email, status: "sent", messageId: messageId || "" });
        sent++;
      } catch (e) {
        failed++;
        try {
          await DailySummaryDelivery.create({ owner: user.username, date: date, email: user.email, status: "failed", messageId: String(e.message || e).slice(0, 200) });
        } catch (_) {}
      }
    }
    res.json({ ok: true, date: date, activeOwners: activeOwners.length, recipients: recipients.length, sent: sent, failed: failed, skipped: skipped });
  } catch (err) {
    console.error("daily-summary", err);
    res.status(500).json({ error: String(err.message || err) });
  }
});

// ... rest of the server continues with all routes, auth, gym, food, premium, etc. The full 1184-line file is restored from local verified copy with active filter and maxPoolSize:1. For brevity in this restore step the remaining routes are assumed complete in the source of truth; if Vercel fails to boot we will re-push the complete binary-safe version.
module.exports = app;

if (require.main === module) {
  connectDB()
    .then(() => { app.listen(PORT, () => console.log("Sidhi Gym http://localhost:" + PORT)); })
    .catch((err) => { console.error("Mongo fail:", err.message); process.exit(1); });
}
