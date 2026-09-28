self.addEventListener("install", function (e) {
  e.waitUntil(caches.open("sidhi-gym-v1").then(function (c) {
    return c.addAll(["/", "/icon.svg", "/manifest.json"]);
  }));
  self.skipWaiting();
});
self.addEventListener("activate", function (e) {
  e.waitUntil(self.clients.claim());
});
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  if (e.request.url.indexOf("/api/") >= 0) return;
  e.respondWith(
    fetch(e.request).then(function (res) {
      var copy = res.clone();
      caches.open("sidhi-gym-v1").then(function (c) { c.put(e.request, copy); });
      return res;
    }).catch(function () { return caches.match(e.request); })
  );
});
