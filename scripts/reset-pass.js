require("dotenv").config();
const crypto = require("crypto");
const mongoose = require("mongoose");

const URI = process.env.MONGODB_URI;
const user = String(process.argv[2] || "").trim().toLowerCase();
const pass = String(process.argv[3] || "");

if (!URI) {
  console.error("MONGODB_URI missing in .env");
  process.exit(1);
}
if (!user || pass.length < 4) {
  console.error("Use: node scripts/reset-pass.js USERNAME NEWPASS");
  process.exit(1);
}

(async function () {
  const conn = await mongoose.createConnection(URI).asPromise();
  const db = conn.useDb("sidhi_gym");
  const users = db.collection("users");
  const row = await users.findOne({ username: user });
  if (!row) {
    console.error("User nahi mila:", user);
    await conn.close();
    process.exit(1);
  }
  const salt = crypto.randomBytes(16).toString("hex");
  const passHash = crypto.scryptSync(pass, salt, 32).toString("hex");
  await users.updateOne({ username: user }, { $set: { salt, passHash } });
  await db.collection("tokens").deleteMany({ username: user });
  console.log("Password reset ok:", user);
  await conn.close();
  process.exit(0);
})().catch(function (err) {
  console.error(err.message || err);
  process.exit(1);
});
