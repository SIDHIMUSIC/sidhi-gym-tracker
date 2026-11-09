require("dotenv").config();
const https = require("https");
const fs = require("fs");
const url = "https://raw.githubusercontent.com/SIDHIMUSIC/sidhi-gym-tracker/2a8eb00bb59280f2eb8f96242b5c859647ae6657/server.js";
https.get(url, function (res) {
  let data = "";
  res.on("data", function (c) { data += c; });
  res.on("end", function () {
    const old = "  const date = previousIndiaDate();\n  try {\n    const recipients = await User.find({ emailVerified: true, email: { $regex: /@/ } })\n      .select(\"username email displayName\").lean();\n    const owners = recipients.map(function (u) { return u.username; });";
    const neu = "  const date = previousIndiaDate();\n  try {\n    const dParts = date.split(\"-\").map(Number);\n    const activeFrom = new Date(Date.UTC(dParts[0], dParts[1] - 1, dParts[2]) - 6 * 86400000).toISOString().slice(0, 10);\n    const activeOwners = await GymSession.distinct(\"owner\", { date: { $gte: activeFrom, $lte: date } });\n    const recipients = activeOwners.length\n      ? await User.find({ emailVerified: true, email: { $regex: /@/ }, username: { $in: activeOwners } }).select(\"username email displayName\").lean()\n      : [];\n    const owners = recipients.map(function (u) { return u.username; });";
    if (data.indexOf(old) !== -1) data = data.replace(old, neu);
    const out = "/tmp/sidhi-server-boot.js";
    fs.writeFileSync(out, data);
    require(out);
  });
}).on("error", function (err) {
  console.error(err);
  process.exit(1);
});
