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
        console.log(
          "Notifikasi sukses default diabaikan (karena dari post sendiri)."
        );
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
      console.warn(
        "Data push bukan JSON atau parsing gagal, menampilkan data mentah."
      );
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
