const fs = require("fs");
const path = require("path");
const parts = 5;
let code = "";
for (let i = 0; i < parts; i++) {
  code += fs.readFileSync(path.join(__dirname, "server_part_" + i + ".js"), "utf8");
}
const Module = require("module");
const m = new Module(path.join(__dirname, "server_assembled.js"));
m.filename = path.join(__dirname, "server_assembled.js");
m.paths = Module._nodeModulePaths(__dirname);
m._compile(code, m.filename);
module.exports = m.exports;
