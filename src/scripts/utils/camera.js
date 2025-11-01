
class Camera {
  constructor(elements, onSnapCallback) {
    this.elements = elements; 
    
    this.onSnap = onSnapCallback;
    
    this.currentStream = null;
    this.cameraCanvas = document.createElement("canvas");
  }

  init() {
    this.elements.toggle.addEventListener("click", () => this._toggleCamera());
    this.elements.select.addEventListener("change", () => this._startCamera(this.elements.select.value));
    this.elements.snap.addEventListener("click", () => this._takePicture());
  }

  stop() {
    return new Promise((resolve) => {
      
      if (this.currentStream) {
        this.currentStream.getTracks().forEach((track) => {
          track.stop();
        });
        
        this.currentStream = null;
        this.elements.feed.srcObject = null;
      }

      resolve(); 
    });
  }

  _toggleCamera() {
    const isHidden = this.elements.container.style.display === "none";
    if (isHidden) {
      this.elements.container.style.display = "flex";
      this.elements.toggle.innerText = "Tutup Kamera";
      this._populateCameraList();
    } else {
      this.elements.container.style.display = "none";
      this.elements.toggle.innerText = "Buka Kamera";
      this.stop();
    }
  }

  async _startCamera(deviceId) {
    await this.stop();
    const constraints = {
      video: { 
        deviceId: deviceId ? { exact: deviceId } : undefined,
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    };
    try {
      this.currentStream = await navigator.mediaDevices.getUserMedia(constraints);
      this.elements.feed.srcObject = this.currentStream;
    } catch (err) {
      console.error("Error memulai kamera:", err);
      alert("Gagal mengakses kamera.");
    }
  }

  async _populateCameraList() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((device) => device.kind === 'videoinput');
      this.elements.select.innerHTML = '';
      videoDevices.forEach((device) => {
        const option = document.createElement('option');
        option.value = device.deviceId;
        option.text = device.label || `Kamera ${this.elements.select.options.length + 1}`;
        this.elements.select.appendChild(option);
      });
      if (videoDevices.length > 0) {
        this._startCamera(videoDevices[0].deviceId);
      }
    } catch (err) {
      console.error("Error mendapatkan daftar kamera:", err);
    }
  }

  _takePicture() {
    if (!this.currentStream) return;
    
    this.cameraCanvas.width = this.elements.feed.videoWidth;
    this.cameraCanvas.height = this.elements.feed.videoHeight;
    const context = this.cameraCanvas.getContext("2d");
    context.drawImage(this.elements.feed, 0, 0, this.cameraCanvas.width, this.cameraCanvas.height);
    
    this.cameraCanvas.toBlob((blob) => {
      const fileName = `camera-shot-${Date.now()}.jpg`;
      const file = new File([blob], fileName, { type: "image/jpeg" });
      
      this.onSnap(file); 
    }, "image/jpeg", 0.9);
  }
}

export default Camera;