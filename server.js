require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

let dbPromise = null;
async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  if (dbPromise) return dbPromise;
  if (!MONGODB_URI) throw new Error("MONGODB_URI missing");
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
  catch (err) { res.status(500).json({ error: "Mongo connect nahi hua" }); }
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, mongo: mongoose.connection.readyState === 1, status: "minimal-restore" });
});

// Serve static from public
app.use(express.static(path.join(__dirname, "public"), { maxAge: "1h", index: false }));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

module.exports = app;

if (require.main === module) {
  connectDB()
    .then(() => { app.listen(PORT, () => console.log("Sidhi Gym minimal http://localhost:" + PORT)); })
    .catch((err) => { console.error("Mongo fail:", err.message); process.exit(1); });
}
