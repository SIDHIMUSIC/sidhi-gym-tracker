var CACHE = "sidhi-v4";
var SHELL = ["/", "/index.html", "/manifest.json", "/icon-192.png", "/icon-512.png"];
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k.indexOf("sidhi-") === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  var url = new URL(e.request.url);
  if (url.origin !== self.location.origin || url.pathname.indexOf("/api/") === 0) return;
  var refresh = e.request.mode === "navigate" ||
    /\\.(js|css|html|json)$/.test(url.pathname) ||
    url.pathname === "/sw.js";
  e.respondWith(
    fetch(refresh ? new Request(e.request, { cache: "no-store" }) : e.request).then(function (res) {
      if (res && res.ok) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copy); }).catch(function () {});
      }
      return res;
    }).catch(function () {
      return caches.match(e.request).then(function (hit) {
        if (hit) return hit;
        if (e.request.mode === "navigate") return caches.match("/");
        return Response.error();
      });
    })
  );
});
