const serviceWorkerRegister = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.bundle.js');

      if (registration.installing) {
        console.log('Service worker: Menginstall');
      } else if (registration.waiting) {
        console.log('Service worker: Terinstall (menunggu)');
      } else if (registration.active) {
        console.log('Service worker: Aktif');
      }
      return registration;
    } catch (error) {
      console.error(`Registrasi Service Worker gagal: ${error}`);
    }
  } else {
    console.log('Service Worker tidak didukung di browser ini.');
  }
};

export default serviceWorkerRegister;