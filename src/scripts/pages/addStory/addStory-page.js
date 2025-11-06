import ApiSource from "../../data/api";
import Camera from "../../utils/camera";
import { initMapPicker } from "../../utils/maps";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

class AddStory {
  async render() {
    return `
      <div class="page-content page-transition">
        <h1 class="form-title">Tulis Story Baru Anda</h1>
        
        <form id="storyForm" class="story-form">
          
          <div class="form-group">
            <label for="storyPhotoInput">Upload Foto</label>
            
            <div class="file-input-container">
              <button type="button" id="galleryButton" class="btn-secondary" aria-controls="storyPhotoInput">Pilih dari Galeri</button>
              <button type="button" id="cameraToggleButton" class="btn-secondary" aria-pressed="false">Buka Kamera</button>
            </div>
            
            <input type="file" id="storyPhotoInput" name="storyPhoto" accept="image/*" style="display: none;">

            <div id="cameraViewContainer" class="camera-view-container" style="display: none;">
              <video id="cameraFeed" class="camera-feed" autoplay playsinline></video>
              <select id="cameraSelect" class="camera-select"></select>
              <button type="button" id="snapButton" class="btn-cta">Ambil Gambar</button>
            </div>

            <label style="margin-top: 1.5rem; display: block;">Preview Foto:</label>
            <div id="thumbnailPreview" class="thumbnail-preview-container">
              <span class="thumbnail-placeholder">Belum ada foto dipilih.</span>
            </div>
          </div>
          
          <div class="form-group">
            <label for="storyDescription">Story Anda (Deskripsi)</label>
            <textarea id="storyDescription" name="storyDescription" rows="10" placeholder="Tuliskan cerita Anda di sini..." required></textarea>
          </div>

          <fieldset class="coordinates-group">
            <legend id="map-field-legend">Pilih Lokasi Cerita</legend>
            
                <div class="map-picker-container">
                    <div id="map-picker" role="application" aria-label="Peta untuk memilih lokasi cerita"></div>
                      <div class="map-picker-marker"
                        style="--marker-image-url: url(${markerIcon})"
                        ></div>
                      </div>
                      <p id="map-help">Gunakan klik/tap pada peta untuk memilih koordinat. Gunakan tombol pan/zoom jika perlu.</p>
                      <div class="coordinate-inputs">
                <div class="form-group">
                <label for="latitude">Latitude</label>
                <input type="text" id="latitude" name="latitude" disabled>
              </div>
              <div class="form-group">
                <label for="longitude">Longitude</label>
                <input type="text" id="longitude" name="longitude" disabled >
              </div>
            </div>
          </fieldset>
          <button type="submit" class="btn-cta" id="submitButton">
            Publikasikan Story
          </button>
        </form> 
      </div> `;
  }

  #cameraManager = null;

  async afterRender() {
    let capturedFiles = [];

    const storyForm = document.querySelector("#storyForm");
    const submitButton = document.querySelector("#submitButton"); // Penting untuk submit
    const storyPhotoInput = document.querySelector("#storyPhotoInput");
    const galleryButton = document.querySelector("#galleryButton");
    const thumbnailPreview = document.querySelector("#thumbnailPreview");
    const thumbnailPlaceholder = document.querySelector(
      ".thumbnail-placeholder"
    );
    const latInput = document.querySelector("#latitude");
    const lonInput = document.querySelector("#longitude");

    const updateInputs = (latlng) => {
      latInput.value = latlng.lat.toFixed(6);
      lonInput.value = latlng.lng.toFixed(6);
    };
    initMapPicker("map-picker", updateInputs); 

    const updatePreview = () => {
      thumbnailPreview.innerHTML = "";
      if (capturedFiles.length === 0) {
        thumbnailPreview.appendChild(thumbnailPlaceholder); 
        return;
      }
      capturedFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const item = document.createElement("div");
          item.classList.add("thumbnail-item");
          const img = document.createElement("img");
          img.src = e.target.result;
          img.classList.add("thumbnail-image");
          const removeBtn = document.createElement("button");
          removeBtn.type = "button";
          removeBtn.classList.add("thumbnail-remove-button");
          removeBtn.innerHTML = "&times;";
          removeBtn.addEventListener("click", () => {
            capturedFiles.splice(index, 1);
            updatePreview();
          });
          item.appendChild(img);
          item.appendChild(removeBtn);
          thumbnailPreview.appendChild(item);
        };
        reader.readAsDataURL(file);
      });
    };

    galleryButton.addEventListener("click", () => {
      storyPhotoInput.click();
    });
    storyPhotoInput.addEventListener("change", () => {
      if (storyPhotoInput.files && storyPhotoInput.files[0]) {
        capturedFiles.push(storyPhotoInput.files[0]);
        updatePreview();
      }
    });

    const handleSnap = (file) => {
      capturedFiles.push(file);
      updatePreview();
    };

    this.#cameraManager = new Camera( 
      {
        container: document.querySelector("#cameraViewContainer"),
        feed: document.querySelector("#cameraFeed"),
        select: document.querySelector("#cameraSelect"),
        snap: document.querySelector("#snapButton"),
        toggle: document.querySelector("#cameraToggleButton"),
      },
      handleSnap
    );

    this.#cameraManager.init();
    window.myStoryCamera = this.#cameraManager;

    storyForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (capturedFiles.length === 0) {
        Swal.fire({
          icon: "warning",
          title: "Foto Kosong",
          text: "Anda harus mengupload setidaknya satu foto.",
        });
        return;
      }

      Swal.fire({
        title: "Mengunggah Cerita...",
        text: "Mohon tunggu sebentar.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        const description = document.querySelector("#storyDescription").value;
        const lat = latInput.value;
        const lon = lonInput.value;
        const photo = capturedFiles[0];

        const formData = new FormData();
        formData.append("description", description);
        formData.append("photo", photo);
        formData.append("lat", parseFloat(lat));
        formData.append("lon", parseFloat(lon));

        const response = await ApiSource.addNewStory(formData); 

        await this.#cameraManager.stop();

        sessionStorage.setItem(
          "storySuccessMessage",
          "Cerita Anda berhasil dipublikasikan!"
        );
        window.location.hash = "#/home";
        window.location.reload();
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Gagal Mengunggah",
          text: error.message || "Terjadi kesalahan. Coba lagi.",
        });
      }
    });

    updatePreview();
  }

  async cleanup() {
    if (this.#cameraManager) {
      await this.#cameraManager.stop();
      this.#cameraManager = null;
    }
  }
}

export default AddStory;
