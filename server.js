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
      username: { type: String, unique: true, required: true, lowercase: true, trim: true },
      salt: { type: String, required: true },
      passHash: { type: String, required: true }
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
      after1HourNote: String,
      beforeTreadmillTime: String,
      beforeTreadmillWeight: Number,
      beforeTreadmillNote: String,
      afterTreadmillTime: String,
      afterTreadmillWeight: Number,
      afterTreadmillNote: String,
      finished: { type: Boolean, default: false }
    },
    { timestamps: true }
);
gymSchema.index({ owner: 1, date: 1 }, { unique: true });
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
app.use(express.json({ limit: "1mb" }));

app.use(async (req, res, next) => {
  if (req.path === "/" || !req.path.startsWith("/api")) return next();
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ error: "Mongo connect nahi hua. Vercel me MONGODB_URI check karo." });
  }
});

async function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.replace(/^Bearer\s+/i, "").trim();
  if (!token) return res.status(401).json({ error: "Login chahiye" });
  const row = await Token.findOne({ token, exp: { $gt: new Date() } });
  if (!row) return res.status(401).json({ error: "Login expire. Phir se login karo." });
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
    if (!/^[a-z0-9_]{2,32}$/.test(username)) {
      return res.status(400).json({ error: "Username 2-32, sirf letters/numbers/_ " });
    }
    if (pass.length < 4) return res.status(400).json({ error: "Password kam se kam 4 character" });
    const exists = await User.findOne({ username });
    if (exists) return res.status(409).json({ error: "Ye username pehle se hai. Login karo." });
    const salt = crypto.randomBytes(16).toString("hex");
    await User.create({ username, salt, passHash: hashPass(pass, salt) });
    const token = crypto.randomBytes(24).toString("hex");
    await Token.create({
      token,
      username,
      exp: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    res.json({ ok: true, username, token });
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
    await Token.create({
      token,
      username,
      exp: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    res.json({ ok: true, username, token });
  } catch (err) {
    res.status(500).json({ error: "Login fail" });
  }
});

app.get("/api/me", auth, (req, res) => {
  res.json({ ok: true, username: req.gymUser });
});

app.get("/api/sessions", auth, async (req, res) => {
  const rows = await GymSession.find({ owner: req.gymUser }).lean();
  res.json({ sessions: withDiff(rows) });
});

app.put("/api/session", auth, async (req, res) => {
  const date = String(req.body.date || "").slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return res.status(400).json({ error: "Date galat" });
  const day = dayFromDate(date);
  const doc = {
    owner: req.gymUser,
    date,
    day,
    workoutName: SPLIT[day],
    entryTime: req.body.entryTime || "",
    entryWeight: num(req.body.entryWeight),
    after1HourTime: req.body.after1HourTime || "",
    after1HourNote: req.body.after1HourNote || "",
    beforeTreadmillTime: req.body.beforeTreadmillTime || "",
    beforeTreadmillWeight: num(req.body.beforeTreadmillWeight),
    beforeTreadmillNote: req.body.beforeTreadmillNote || "",
    afterTreadmillTime: req.body.afterTreadmillTime || "",
    afterTreadmillWeight: num(req.body.afterTreadmillWeight),
    afterTreadmillNote: req.body.afterTreadmillNote || "",
    finished: !!req.body.finished
  };
  const saved = await GymSession.findOneAndUpdate(
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

app.use(express.static(path.join(__dirname, "public")));
app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) return res.status(404).json({ error: "not found" });
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

module.exports = app;

if (!process.env.VERCEL) {
  connectDB()
    .then(() => {
      app.listen(PORT, () => console.log("Sidhi Gym http://localhost:" + PORT));
    })
    .catch((err) => {
      console.error("Mongo fail:", err.message);
      process.exit(1);
    });
}
