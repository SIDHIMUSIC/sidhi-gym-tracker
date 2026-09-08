require("dotenv").config();
const path = require("path");
const crypto = require("crypto");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;
const LOGIN_USER = process.env.LOGIN_USER || "sidhi";
const LOGIN_PASS = process.env.LOGIN_PASS || "gym1234";

const SPLIT = {
  Monday: "Chest and triceps",
  Tuesday: "Back and biceps",
  Wednesday: "Shoulders and legs",
  Thursday: "Chest and triceps",
  Friday: "Back and biceps",
  Saturday: "Shoulders and triceps",
  Sunday: "Off"
};

const Session = mongoose.model(
  "Session",
  new mongoose.Schema(
    {
      date: { type: String, required: true, unique: true },
      day: String,
      workoutName: String,
      entryTime: String,
      entryWeight: Number,
      after1HourTime: String,
      after1HourNote: String,
      beforeTreadmillTime: String,
      beforeTreadmillNote: String,
      afterTreadmillTime: String,
      afterTreadmillNote: String,
      finished: { type: Boolean, default: false }
    },
    { timestamps: true }
  )
);

function tokenFor(user, pass) {
  return crypto.createHash("sha256").update(user + ":" + pass + ":sidhi-gym").digest("hex");
}

function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.replace("Bearer ", "");
  if (token && token === tokenFor(LOGIN_USER, LOGIN_PASS)) return next();
  return res.status(401).json({ error: "Login chahiye" });
}

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, mongo: mongoose.connection.readyState === 1 });
});

app.post("/api/login", (req, res) => {
  const user = String((req.body && req.body.user) || "").trim();
  const pass = String((req.body && req.body.pass) || "");
  if (user !== LOGIN_USER || pass !== LOGIN_PASS) {
    return res.status(401).json({ error: "Galat ID / password" });
  }
  res.json({ token: tokenFor(user, pass), user });
});

app.get("/api/sessions", auth, async (_req, res) => {
  const rows = await Session.find().sort({ date: -1 }).lean();
  res.json(withDiff(rows));
});

app.get("/api/sessions/:date", auth, async (req, res) => {
  const row = await Session.findOne({ date: req.params.date }).lean();
  res.json(row || null);
});

app.put("/api/sessions/:date", auth, async (req, res) => {
  const date = req.params.date;
  const day = dayName(date);
  const body = req.body || {};
  const payload = {
    date,
    day,
    workoutName: body.workoutName || SPLIT[day],
    entryTime: body.entryTime || "",
    entryWeight: num(body.entryWeight),
    after1HourTime: body.after1HourTime || "",
    after1HourNote: body.after1HourNote || "",
    beforeTreadmillTime: body.beforeTreadmillTime || "",
    beforeTreadmillNote: body.beforeTreadmillNote || "",
    afterTreadmillTime: body.afterTreadmillTime || "",
    afterTreadmillNote: body.afterTreadmillNote || "",
    finished: !!body.finished
  };
  const saved = await Session.findOneAndUpdate({ date }, payload, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true
  }).lean();
  const rows = await Session.find().sort({ date: -1 }).lean();
  res.json({ saved, sessions: withDiff(rows) });
});

app.delete("/api/sessions/:date", auth, async (req, res) => {
  await Session.deleteOne({ date: req.params.date });
  const rows = await Session.find().sort({ date: -1 }).lean();
  res.json(withDiff(rows));
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function dayName(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][d.getDay()];
}

function withDiff(rows) {
  const oldestFirst = [...rows].sort((a, b) => a.date.localeCompare(b.date));
  const map = {};
  let prev = null;
  oldestFirst.forEach((row) => {
    const curr = Number(row.entryWeight);
    let diff = null;
    let trend = "same";
    if (Number.isFinite(curr) && prev != null) {
      diff = Math.round((curr - prev) * 10) / 10;
      trend = diff > 0 ? "up" : diff < 0 ? "down" : "same";
    }
    map[row.date] = { diff, trend, prevWeight: prev };
    if (Number.isFinite(curr)) prev = curr;
  });
  return rows.map((row) => Object.assign({}, row, map[row.date] || {}));
}

async function start() {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI missing");
    process.exit(1);
  }
  await mongoose.connect(MONGODB_URI);
  console.log("Mongo connected");
  app.listen(PORT, () => console.log("Sidhi gym on " + PORT));
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
