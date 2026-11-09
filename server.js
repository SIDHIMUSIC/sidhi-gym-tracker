const zlib = require("zlib");
const code = zlib.gunzipSync(Buffer.from(require("./server_blob"), "base64")).toString("utf8");
const Module = require("module");
const path = require("path");
const m = new Module(path.join(__dirname, "server_assembled.js"));
m.filename = path.join(__dirname, "server_assembled.js");
m.paths = Module._nodeModulePaths(__dirname);
m._compile(code, m.filename);
module.exports = m.exports;
