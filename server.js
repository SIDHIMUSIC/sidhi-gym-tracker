const code = require("./server_part_0") + require("./server_part_1") + require("./server_part_2") + require("./server_part_3");
const Module = require("module");
const path = require("path");
const m = new Module(path.join(__dirname, "server_assembled.js"));
m.filename = path.join(__dirname, "server_assembled.js");
m.paths = Module._nodeModulePaths(__dirname);
m._compile(code, m.filename);
module.exports = m.exports;
