self.addEventListener('push', (event) => {
  console.log('Service Worker: Push Event Diterima!');

  let pushData = 'Ada notifikasi baru!';
  if (event.data) {
    pushData = event.data.text();
  }

  const notificationTitle = 'Story App';
  const notificationOptions = {
    body: pushData,
    
    icon: '/images/logo.png', 
    badge: '/images/logo.png', 
    
    data: { url: '/' }, 
  };

  event.waitUntil(
    self.registration.showNotification(notificationTitle, notificationOptions)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});