// 앱 파일을 휴대폰에 저장해 두고, 인터넷이 없을 때도 열리게 합니다.
// 앱을 고친 뒤 다시 올릴 때는 아래 버전 숫자를 하나 올려 주세요.
const CACHE = "pingpong-v6";
const FILES = ["./", "index.html", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// 저장된 파일을 먼저 보여주고, 인터넷이 되면 뒤에서 새 버전으로 바꿔 둡니다
self.addEventListener("fetch", e => {
  // 앱 파일만 저장합니다 (실시간 공유 서버와 글꼴은 그대로 인터넷으로)
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== self.location.origin) return;
  e.respondWith(
    caches.open(CACHE).then(async cache => {
      const cached = await cache.match(e.request, { ignoreSearch: true });
      const fresh = fetch(e.request)
        .then(res => { if (res.ok) cache.put(e.request, res.clone()); return res; })
        .catch(() => cached);
      return cached || fresh;
    })
  );
});
