import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { ExpirationPlugin } from "workbox-expiration";
import {
  NetworkFirst,
  CacheFirst,
  StaleWhileRevalidate,
} from "workbox-strategies";

import DbHelper from "./utils/db-helper";

const API_BASE_URL = "https://story-api.dicoding.dev/v1";

const API_ENDPOINT = {
  ADD_NEW_STORY: `${API_BASE_URL}/stories`,
};

precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener("sync", (event) => {
  console.log("[SW] Menerima event Sync:", event.tag);
  if (event.tag === "sync-pending-stories") {
    event.waitUntil(syncPendingStories());
  }
});

const syncPendingStories = async () => {
  console.log("[SW] Memulai sinkronisasi cerita tertunda...");

  const token = await DbHelper.getToken();
  if (!token) {
    console.error(
      "[SW] Gagal sync: Token tidak ditemukan di IndexedDB. Silakan login kembali."
    );
    return;
  }

  const pendingStories = await DbHelper.getAllPendingStories();
  if (pendingStories.length === 0) {
    console.log("[SW] Tidak ada cerita tertunda untuk di-sync.");
    return;
  }

  for (const story of pendingStories) {
    try {
      const formData = new FormData();
      formData.append("description", story.description);

      const blobPhoto = base64ToBlob(story.photo);
      formData.append("photo", blobPhoto, `photo-${story.id}.jpg`);

      formData.append("lat", story.lat);
      formData.append("lon", story.lon);

      const response = await fetch(API_ENDPOINT.ADD_NEW_STORY, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(
          `API error: ${response.status} - ${response.statusText}`
        );
      }

      console.log(`[SW] Cerita (ID: ${story.id}) berhasil dikirim ke API.`);
      await DbHelper.deletePendingStory(story.id);
    } catch (error) {
      console.error(
        `[SW] Gagal mengirim cerita (ID: ${story.id}). Error:`,
        error
      );
    }
  }

  console.log("[SW] Sinkronisasi selesai.");

  self.registration.showNotification("Sync Selesai", {
    body: `Semua cerita offline Anda berhasil di-upload!`,
    icon: "/images/logo.png",
  });
};

function base64ToBlob(base64) {
  try {
    const byteString = atob(base64.split(",")[1]);
    const mimeString = base64.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  } catch (e) {
    console.error("[SW] Gagal konversi base64 → Blob:", e);
    return null;
  }
}

registerRoute(
  ({ url }) =>
    url.origin === "https://fonts.googleapis.com" ||
    url.origin === "https://fonts.gstatic.com",
  new CacheFirst({
    cacheName: "google-fonts",
  })
);

registerRoute(
  ({ url }) =>
    url.origin.includes("fontawesome") ||
    url.origin === "https://cdnjs.cloudflare.com",
  new CacheFirst({
    cacheName: "fontawesome",
  })
);

registerRoute(
  ({ url }) => url.origin === "https://ui-avatars.com",
  new CacheFirst({
    cacheName: "avatars-api",
    plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
  })
);

registerRoute(
  ({ url, request }) => {
    return (
      url.origin === new URL(API_BASE_URL).origin && request.method === "GET"
    );
  },
  new NetworkFirst({
    cacheName: "story-api-cache",
    networkTimeoutSeconds: 5,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 24 * 60 * 60,
      }),
    ],
    matchOptions: {
      ignoreSearch: true,
      ignoreVary: true,
    },
  })
);

registerRoute(
  ({ url, request }) =>
    url.origin === new URL(API_BASE_URL).origin &&
    request.destination === "image",
  new StaleWhileRevalidate({
    cacheName: "story-api-images",
    plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
  })
);

registerRoute(
  ({ url }) => url.origin.includes("maptiler"),
  new CacheFirst({
    cacheName: "maptiler-api",
  })
);

self.addEventListener("push", (event) => {
  console.log("Service Worker: Push Event Diterima!");

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
      notificationOptions = {
        ...notificationOptions,
        ...pushData.options,
      };

      if (notificationOptions.body && notificationOptions.body.length > 100) {
        notificationOptions.body =
          notificationOptions.body.substring(0, 97) + "...";
      }
    } catch (error) {
      console.warn("Data push bukan JSON, menampilkan sebagai teks biasa.");
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
