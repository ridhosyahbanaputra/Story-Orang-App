const serviceWorkerRegister = async () => {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(
        "./sw.bundle.js"
      );

      if (registration.installing) {
        console.log("Service worker: Menginstall");
      } else if (registration.waiting) {
        console.log("Service worker: Terinstall (menunggu)");

        registration.waiting.postMessage({ type: "SKIP_WAITING" });
      } else if (registration.active) {
        console.log("Service worker: Aktif");
      }

      await navigator.serviceWorker.ready;
      console.log("Service Worker sudah siap digunakan.");

      registration.addEventListener("updatefound", () => {
        const newSW = registration.installing;
        if (newSW) {
          newSW.addEventListener("statechange", () => {
            if (
              newSW.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              console.log("SW baru terpasang, mengirim skipWaiting...");
              newSW.postMessage({ type: "SKIP_WAITING" });
            }
          });
        }
      });

      window.addEventListener("online", async () => {
        console.log("Status: Online");
        if ("SyncManager" in window) {
          try {
            const swReg = await navigator.serviceWorker.ready;
            await swReg.sync.register("sync-pending-stories");
            console.log("SyncManager: Registrasi ulang berhasil saat online");
          } catch (e) {
            console.error("Gagal register sync:", e);
          }
        }
      });

      window.addEventListener("offline", () => {
        console.log("Status: Offline");
      });

      return registration;
    } catch (error) {
      console.error(`Registrasi Service Worker gagal: ${error}`);
    }
  } else {
    console.log("Service Worker tidak didukung di browser ini.");
  }
};

export default serviceWorkerRegister;
