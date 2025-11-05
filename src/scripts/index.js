import "../styles/styles.css";
import "leaflet/dist/leaflet.css";
import App from "./pages/app";
import serviceWorkerRegister from "./utils/service-worker-register";
import CONFIG from "./config.js";
import ApiSource from "./data/api.js";
import feather from "feather-icons"; 
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";


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

async function subscribeToPushNotification(swRegistration) {
  try {
    const permissionResult = await Notification.requestPermission();
    if (permissionResult !== "granted") {
      console.warn("Izin notifikasi ditolak.");
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Anda telah menolak izin notifikasi.",
      });
      return false;
    }

    const VAPID_PUBLIC_KEY = CONFIG.VAPID_public_keys;
    const subscription = await swRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    const keys = subscription.toJSON().keys;
    const subscriptionData = {
      endpoint: subscription.endpoint,
      keys: { p256dh: keys.p256dh, auth: keys.auth },
    };

    await ApiSource.sendSubscription(subscriptionData);
    console.log("Subscription berhasil dikirim ke server API.");
    Swal.fire({
      icon: "success",
      title: "Subscribe Berhasil!",
      text: "SIPP!! Subscribe Berhasil",
      timer: 5000,
      showConfirmButton: false,
    });
    return true;
  } catch (error) {
    console.error("Gagal melakukan subscribe:", error);
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Gagal subscribe. Coba lagi nanti.",
    });
    return false;
  }
}

async function unsubscribeFromPushNotification(swRegistration) {
  try {
    const existingSubscription =
      await swRegistration.pushManager.getSubscription();
    if (!existingSubscription) {
      console.log("Tidak ada subscription untuk di-unsubscribe.");
      return true; 
    }

    const endpoint = existingSubscription.endpoint;

    const apiSuccess = await ApiSource.removeSubscription(endpoint);

    if (apiSuccess) {
      await existingSubscription.unsubscribe();
      console.log("Unsubscribe berhasil!.");
      Swal.fire({
        icon: "success",
        title: "Unsubscribe Berhasil",
        text: "Kok di Unsubcribe??",
        timer: 5000,
        showConfirmButton: false,
      });
      return true;
    } else {
      console.error("Gagal unsubscribe dari server API.");
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Gagal unsubscribe. Coba lagi.",
      });
      return false;
    }
  } catch (error) {
    console.error("Gagal melakukan unsubscribe:", error);
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Gagal unsubscribe. Coba lagi.",
    });
    return false;
  }
}

async function updateSubscriptionButton(swRegistration, button) {
  if (!button) return;

  if (Notification.permission === "denied") {
    button.style.display = "none"; 
    return;
  }

  const subscription = await swRegistration.pushManager.getSubscription();

  if (subscription) {
    button.innerHTML = "<span>Unsubsrcibe</span>" + feather.icons.bell.toSvg();
    button.dataset.state = "subscribed";
  } else {
    button.innerHTML =
      "<span>Subsrcibe</span>" + feather.icons["bell-off"].toSvg();
    button.dataset.state = "unsubscribed";
  }
  button.classList.add("ready"); 
}

let app;
document.addEventListener("DOMContentLoaded", async () => {
  app = new App({
    content: document.querySelector("#main-content"),
    drawerButton: document.querySelector("#drawer-button"),
    navigationDrawer: document.querySelector("#navigation-drawer"),
  });

  await app.renderPage();

  const swRegistration = await serviceWorkerRegister();
  if (!swRegistration) {
    console.error("Service Worker Gagal Didaftarkan.");
    return;
  }

  const subscribeButton = document.querySelector("#subscribe-button");
  if (!("PushManager" in window)) {
    subscribeButton.style.display = "none"; 
  } else {
    await updateSubscriptionButton(swRegistration, subscribeButton);

    subscribeButton.addEventListener("click", async () => {
      subscribeButton.disabled = true; 

      const currentState = subscribeButton.dataset.state;
      if (currentState === "unsubscribed") {
        await subscribeToPushNotification(swRegistration);
      } else {
        await unsubscribeFromPushNotification(swRegistration);
      }

      await updateSubscriptionButton(swRegistration, subscribeButton);
      subscribeButton.disabled = false; 
    });
  }
});

window.addEventListener("hashchange", async () => {
  if (app) {
    await app.renderPage();
  }
});
