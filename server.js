require("dotenv").config();
const path = require("path");
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
      preferredDays: { type: Array, default: [] }
    },
    { timestamps: true }
  )
);

const Token = model(
  "Token",
  new mongoose.Schema(
    {
      token: { type: String, unique: true, required: true },
      username: { type: String, required: true, index: true },
      exp: { type: Date, required: true }
    },
    { timestamps: true }
  )
);

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
    preferredDays: Array.isArray(u.preferredDays) ? u.preferredDays : []
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
  await mongoose.connect(MONGODB_URI, { dbName: "sidhi_gym" });
}

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(async (req, res, next) => {
  if (req.path === "/" || !req.path.startsWith("/api")) return next();
  try { await connectDB(); next(); }
  catch (err) { res.status(500).json({ error: "Mongo connect nahi hua. Vercel me MONGODB_URI check karo." }); }
});
async function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.replace(/^Bearer\s+/i, "").trim();
  if (!token) return res.status(401).json({ error: "Login chahiye" });
  const row = await Token.findOne({ token, exp: { $gt: new Date() } });
  if (!row) return res.status(401).json({ error: "Login expire. Phir se login karo." });
  row.exp = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await row.save();
  req.gymUser = row.username;
  next();
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, mongo: mongoose.connection.readyState === 1 });
});

app.post("/api/register", async (req, res) => {
  try {
    const username = String(req.body.username || req.body.user || "").trim().toLowerCase();
    const pass = String(req.body.password || req.body.pass || "");
    const displayName = String(req.body.displayName || req.body.name || "").trim().slice(0, 40);
    const gender = String(req.body.gender || "").toLowerCase();
    if (!/^[a-z0-9_]{2,32}$/.test(username)) {
      return res.status(400).json({ error: "Username 2-32, sirf letters/numbers/_ " });
    }
    if (pass.length < 4) return res.status(400).json({ error: "Password kam se kam 4 character" });
    const exists = await User.findOne({ username });
    if (exists) return res.status(409).json({ error: "Ye username pehle se hai. Login karo." });
    const salt = crypto.randomBytes(16).toString("hex");
    await User.create({
      username,
      salt,
      passHash: hashPass(pass, salt),
      displayName,
      gender: gender === "female" ? "female" : gender === "male" ? "male" : ""
    });
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
    if (pass.length < 4) return res.status(400).json({ error: "Password kam se kam 4 character" });
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
  const u = await User.findOne({ username: req.gymUser }).lean();
  res.json(Object.assign({ ok: true }, publicUser(u)));
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
  res.json(Object.assign({ ok: true }, publicUser(u)));
});

app.delete("/api/me", auth, async (req, res) => {
  const pass = String((req.body && (req.body.password || req.body.pass)) || "");
  const u = await User.findOne({ username: req.gymUser });
  if (!u) return res.status(404).json({ error: "User nahi mila" });
  if (pass.length < 4 || u.passHash !== hashPass(pass, u.salt)) {
    return res.status(401).json({ error: "Galat password" });
  }
  await GymSession.deleteMany({ owner: req.gymUser });
  await Token.deleteMany({ username: req.gymUser });
  await User.deleteOne({ username: req.gymUser });
  res.json({ ok: true });
});

app.get("/api/export", auth, async (req, res) => {
  const rows = await GymSession.find({ owner: req.gymUser }).lean();
  const u = await User.findOne({ username: req.gymUser }).lean();
  res.json({ ok: true, user: publicUser(u), sessions: withDiff(rows) });
});

app.get("/api/sessions", auth, async (req, res) => {
  const rows = await GymSession.find({ owner: req.gymUser }).lean();
  res.json({ sessions: withDiff(rows) });
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
  const rows = await GymSession.find({ owner: req.gymUser }).lean();
  const withD = withDiff(rows);
  res.json({ ok: true, session: withD.find((s) => s.date === date), sessions: withD });
});

app.delete("/api/session/:date", auth, async (req, res) => {
  await GymSession.deleteOne({ owner: req.gymUser, date: req.params.date });
  const rows = await GymSession.find({ owner: req.gymUser }).lean();
  res.json({ ok: true, sessions: withDiff(rows) });
});

require("./admin-routes")(app, { User: User, Token: Token, hashPass: hashPass });

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
