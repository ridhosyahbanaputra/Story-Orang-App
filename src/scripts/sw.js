import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { NetworkFirst, StaleWhileRevalidate } from "workbox-strategies";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { ExpirationPlugin } from "workbox-expiration";

const API_BASE_URL = "https://story-api.dicoding.dev/v1";
const CACHE_NAME_API = "story-api-cache-v2";
const CACHE_NAME_ASSETS = "story-assets-cache-v2";
const CACHE_NAME_STORY_DETAIL = "story-detail-cache-v2";

precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter(
            (name) =>
              name !== CACHE_NAME_API &&
              name !== CACHE_NAME_ASSETS &&
              name !== CACHE_NAME_STORY_DETAIL &&
              !name.startsWith("workbox-precache")
          )
          .map((name) => caches.delete(name))
      );
    })
  );
});


registerRoute(
  ({ url, request }) =>
    url.origin === new URL(API_BASE_URL).origin &&
    url.pathname.startsWith("/stories/") &&
    request.method === "GET",
  new NetworkFirst({
    cacheName: CACHE_NAME_STORY_DETAIL,
    networkTimeoutSeconds: 5,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 24 * 60 * 60 }),
    ],
  })
);

registerRoute(
  ({ url, request }) =>
    url.origin === new URL(API_BASE_URL).origin &&
    url.pathname === "/stories" && 
    request.method === "GET",
  new NetworkFirst({
    cacheName: CACHE_NAME_API,
    networkTimeoutSeconds: 5,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 24 * 60 * 60 }),
    ],
  })
);

registerRoute(
  ({ request }) =>
    request.destination === "style" ||
    request.destination === "script" ||
    request.destination === "image" ||
    request.destination === "font",
  new StaleWhileRevalidate({
    cacheName: CACHE_NAME_ASSETS,
  })
);


self.addEventListener("push", (event) => {
  let notificationTitle = "Story App";
  let notificationOptions = {
    body: "Ada notifikasi baru dari Story App!",
    icon: "/images/logo.png",
    badge: "/images/logo.png",
    data: { url: "/" },
    actions: [],
  };

  if (event.data) {
    try {
      const pushData = event.data.json();
      if (pushData.title && pushData.title === "Story berhasil dibuat") {
        return;
      }

      notificationTitle = pushData.title || notificationTitle;
      notificationOptions = { ...notificationOptions, ...pushData.options };

      if (notificationOptions.body && notificationOptions.body.length > 100) {
        notificationOptions.body =
          notificationOptions.body.substring(0, 97) + "...";
      }
    } catch (error) {
      notificationOptions.body = event.data.text();
    }
  }

  const targetUrl = notificationOptions.data.url || "/";
  const hasReadActionButton = notificationOptions.actions.some(
    (action) => action.title === "Baca Cerita"
  );

  if (!hasReadActionButton && targetUrl !== "/") {
    notificationOptions.actions.push({
      action: targetUrl,
      title: "Baca Cerita",
    });
  }

  event.waitUntil(
    self.registration.showNotification(notificationTitle, notificationOptions)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.action || event.notification.data.url || "/";

  event.waitUntil(clients.openWindow(targetUrl));
});
