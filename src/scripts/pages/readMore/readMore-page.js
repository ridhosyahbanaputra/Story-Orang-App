import { parseActivePathname } from "../../routes/url-parser";
import ApiSource from "../../data/api";
import Leaflet from "leaflet";
import "leaflet/dist/leaflet.css";

import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = Leaflet.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
Leaflet.Marker.prototype.options.icon = DefaultIcon;

class ReadMorePage {
  async render() {
    return `
      <div class="read-more-container">
        <article class="story-detail">

          <h1 class="story-author" id="story-author" ></h1>
          <img id="story-image" class="story-detail-image" src="" alt="Memuat gambar cerita..." style="display: none;">
          <div class="story-content">
            <p id="story-body">...</p>
          </div>

          <div class="story-location">
            <h2>Lokasi Cerita</h2>
            <div id="map"></div>
            <p class="story-coordinates">
              <strong>Latitude:</strong> <span id="story-lat">...</span><br>
              <strong>Longitude:</strong> <span id="story-lon">...</span>
            </p>
          </div>
        </article>
      </div>
    `;
  }

  async afterRender() {
    const url = parseActivePathname();
    const storyId = url.id;

    const story = await ApiSource.getStoryDetail(storyId);

    document.getElementById("story-author").innerText = story.name;
    document.getElementById("story-body").innerText = story.description;
    document.getElementById("story-lat").innerText = story.lat;
    document.getElementById("story-lon").innerText = story.lon;

    const storyImage = document.getElementById("story-image");
    if (story.photoUrl) {
      storyImage.src = story.photoUrl;
      storyImage.alt = `Gambar untuk ${story.name}`;
      storyImage.style.display = "block"; 
    }

    try {
      const map = Leaflet.map("map", {
        center: [story.lat, story.lon],
        zoom: 15, 
        dragging: false,
        scrollWheelZoom: false,
        zoomControl: false, 
        doubleClickZoom: false,
        touchZoom: false,
        keyboard: false,
      }); 

      Leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      Leaflet.marker([story.lat, story.lon])
        .addTo(map)
        .bindPopup(`Lokasi untuk: ${story.name}`)
        .openPopup();
    } catch (error) {
      console.error("Error initializing map:", error);
      document.getElementById("map").innerHTML =
        "Gagal memuat peta. Pastikan koneksi internet stabil.";
    }
  }
}

export default ReadMorePage;
