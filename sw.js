// 오프라인 캐시: 한 번 열면 인터넷 없이도 앱이 떠요. 새 버전을 배포하면 이름(ver)이 바뀌어 자동으로 갱신돼요.
const CACHE = "iolite-b94c078030";
const FILES = ["./", "index.html", "practice.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "icon-180.png", "logo-96.png"];
self.addEventListener("install", e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.hostname === "api.github.com") return; // 동기화는 항상 네트워크로
  if (u.origin === location.origin) {
    // 내 파일: 네트워크 먼저(새 버전), 안 되면 캐시
    e.respondWith(fetch(e.request).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); return r; }).catch(() => caches.match(e.request)));
  } else {
    // 글꼴·CDN: 캐시 먼저
    e.respondWith(caches.match(e.request).then(m => m || fetch(e.request).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); return r; })));
  }
});
