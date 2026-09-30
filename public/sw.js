self.addEventListener("install", function () {
  self.skipWaiting();
});
self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  var url = e.request.url;
  if (url.indexOf("/api/") >= 0) return;
  var dest = e.request.destination;
  if (e.request.mode === "navigate" || dest === "document" || /index\.html(\?|$)/.test(url) || /\/(\?|$)/.test(new URL(url).pathname)) {
    e.respondWith(fetch(e.request));
    return;
  }
  e.respondWith(
    fetch(e.request).catch(function () { return caches.match(e.request); })
  );
});
