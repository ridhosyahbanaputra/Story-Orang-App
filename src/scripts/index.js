// CSS imports
import "../styles/styles.css";
import "leaflet/dist/leaflet.css";
import App from "./pages/app";

import CONFIG from "./config.js";
import serviceWorkerRegister from "./utils/service-worker-register";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function subscribeToPushNotification() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.warn("Push messaging tidak didukung.");
    return;
  }

  try {
    const permissionResult = await Notification.requestPermission();
    if (permissionResult !== "granted") {
      console.warn("Izin notifikasi ditolak.");
      return;
    }

    const swRegistration = await navigator.serviceWorker.ready;

    const VAPID_PUBLIC_KEY = CONFIG.VAPID_public_keys;

    const subscription = await swRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    console.log("Berhasil subscribe:", JSON.stringify(subscription));

    const keys = subscription.toJSON().keys;
    const subscriptionData = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
    };
    // await ApiSource.sendSubscription(subscriptionData);
    // console.log('Subscription telah dikirim ke server API.');
  } catch (error) {
    console.error("Gagal melakukan subscribe:", error);
  }
}
let app;
document.addEventListener("DOMContentLoaded", async () => {
  app = new App({
    content: document.querySelector("#main-content"),
    drawerButton: document.querySelector("#drawer-button"),
    navigationDrawer: document.querySelector("#navigation-drawer"),
  });

  await app.renderPage();

  await serviceWorkerRegister();
  subscribeToPushNotification(); 
});

window.addEventListener("hashchange", async () => {
  if (app) {
    await app.renderPage();
  }
});
