// Karma Kode - service worker
// Bump CACHE_VERSION every time index.html (or this file) changes.
// On activation, all caches from previous versions are deleted automatically.
//
// Strategy: network-first. Always try to fetch the latest version from the
// network first, so updates take effect immediately on the next reload.
// Only fall back to the cached version if the network request fails
// (i.e. when offline). This avoids the "old cached version stays until you
// reopen twice" problem, while still allowing offline use.

const CACHE_VERSION = "v15";
const CACHE_NAME = "karma-kode-" + CACHE_VERSION;

const ASSETS = [
  "./",
  "./index.html"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith("karma-kode") && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
