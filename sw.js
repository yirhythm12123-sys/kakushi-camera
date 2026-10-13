// 更新したら VERSION を1つ上げる（利用者の端末の古い版を入れ替えるため）
const VERSION = 4;
const CACHE = "kakushi-camera-v" + VERSION;
const FILES = ["./", "index.html"];
// 物体認識の部品とフォントも、一度読み込んだら保存してオフラインで使えるようにする
const EXTERNAL = ["cdn.jsdelivr.net", "storage.googleapis.com", "tfhub.dev", "www.kaggle.com", "fonts.googleapis.com", "fonts.gstatic.com"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  const cacheable = url.origin === location.origin || EXTERNAL.includes(url.hostname);
  if (!cacheable) return;
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => url.origin === location.origin ? caches.match("index.html") : Response.error()))
  );
});
