require("dotenv").config();
const mongoose = require("mongoose");

const URI = process.env.MONGODB_URI;
const TARGET = "sidhi_gym";

if (!URI) {
  console.error("MONGODB_URI missing. Atlas connection string .env me daalo.");
  process.exit(1);
}

function looksUser(doc) {
  return doc && doc.username && doc.passHash && doc.salt;
}
function looksSession(doc) {
  return doc && doc.owner && /^\d{4}-\d{2}-\d{2}$/.test(String(doc.date || ""));
}
function looksToken(doc) {
  return doc && doc.token && doc.username && doc.exp;
}

async function copyCol(srcDb, srcName, destCol, testFn) {
  const col = srcDb.collection(srcName);
  const docs = await col.find({}).toArray();
  let n = 0;
  for (const doc of docs) {
    if (!testFn(doc)) continue;
    const copy = Object.assign({}, doc);
    delete copy._id;
    const filter = testFn === looksSession
      ? { owner: copy.owner, date: copy.date }
      : testFn === looksUser
        ? { username: copy.username }
        : { token: copy.token };
    await destCol.updateOne(filter, { $setOnInsert: copy }, { upsert: true });
    n++;
  }
  return n;
}

(async function () {
  const conn = await mongoose.createConnection(URI).asPromise();
  const admin = conn.db.admin();
  const { databases } = await admin.listDatabases();
  const dest = conn.useDb(TARGET);
  const users = dest.collection("users");
  const sessions = dest.collection("gymsessions");
  const tokens = dest.collection("tokens");
  await users.createIndex({ username: 1 }, { unique: true });
  await sessions.createIndex({ owner: 1, date: 1 }, { unique: true });
  await tokens.createIndex({ token: 1 }, { unique: true });

  console.log("Target DB:", TARGET);
  let u = 0, s = 0, t = 0;
  for (const d of databases) {
    const name = d.name;
    if (["admin", "local", "config"].indexOf(name) >= 0) continue;
    const db = conn.useDb(name);
    const cols = await db.db.listCollections().toArray();
    const names = cols.map(function (c) { return c.name; });
    console.log("Scan", name, names.join(", ") || "(empty)");
    for (const c of names) {
      const low = c.toLowerCase();
      if (low === "users" || low === "user") u += await copyCol(db.db, c, users, looksUser);
      if (low === "gymsessions" || low === "sessions" || low === "gymsession") {
        s += await copyCol(db.db, c, sessions, looksSession);
      }
      if (low === "tokens" || low === "token") t += await copyCol(db.db, c, tokens, looksToken);
    }
  }
  console.log("Copied users:", u, "sessions:", s, "tokens:", t);
  console.log("Open Atlas → database sidhi_gym → gymsessions");
  await conn.close();
  process.exit(0);
})().catch(function (err) {
  console.error(err);
  process.exit(1);
});
