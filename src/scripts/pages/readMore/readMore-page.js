import { parseActivePathname } from "../../routes/url-parser";
import { initDetailPageMap } from "../../utils/maps";
import getPlaceName from "../../data/placeName-api";
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
          <p class="story-date-detail" id="story-date"></p>
          <img id="story-image" class="story-detail-image" src="" alt="Memuat gambar cerita..." style="display: none;">
          <div class="story-content">
            <p id="story-body">...</p>
          </div>
          <div class="story-location">
            <h2>Lokasi Cerita</h2>
            <div id="map"></div>
            <p class="story-coordinates">
              <strong>Lokasi:</strong> <span id="story-location-name">Memuat...</span><br>
              <strong>Latitude:</strong> <span id="story-lat">...</span><br>
              <strong>Longitude:</strong> <span id="story-lon">...</span>
            </p>
          </div>
        </article>
      </div>
    `;
  }
  async afterRender() {
    try {
      const dateEl = document.getElementById("story-date");

      const url = parseActivePathname();
      const storyId = url.id;
      const story = await ApiSource.getStoryDetail(storyId);

      const authorEl = document.getElementById("story-author");
      if (authorEl) {
        authorEl.innerText = story.name;
      } else {
        console.warn('Elemen ID "story-author" tidak ditemukan');
      }

      const bodyEl = document.getElementById("story-body");
      if (bodyEl) {
        bodyEl.innerText = story.description;
      } else {
        console.warn('Elemen ID "story-body" tidak ditemukan');
      }

      const storyImage = document.getElementById("story-image");
      if (story.photoUrl && storyImage) {
        storyImage.src = story.photoUrl;
        storyImage.alt = `Gambar untuk ${story.name}`;
        storyImage.style.display = "block";
      } else if (!storyImage) {
        console.warn('Elemen ID "story-image" tidak ditemukan');
      }

      if (dateEl) {
        const storyDate = story.createdAt;

        const formattedDate = new Date(storyDate).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });

        dateEl.innerText = formattedDate;
      } else {
        console.warn('Elemen ID "story-date" tidak ditemukan');
      }

      const placeName = await getPlaceName.getCityName(story.lat, story.lon);

      const locationNameEl = document.getElementById("story-location-name");
      if (locationNameEl) {
        locationNameEl.innerText = placeName;
      } else {
        console.warn('Elemen ID "story-location-name" tidak ditemukan');
      }

      const latEl = document.getElementById("story-lat");
      if (latEl) {
        latEl.innerText = story.lat;
      } else {
        console.warn('Elemen ID "story-lat" tidak ditemukan');
      }

      const lonEl = document.getElementById("story-lon");
      if (lonEl) {
        lonEl.innerText = story.lon;
      } else {
        console.warn('Elemen ID "story-lon" tidak ditemukan');
      }

      try {
        initDetailPageMap("map", story.lat, story.lon, story.name);
      } catch (error) {
        console.error("Error initializing map:", error);

        const mapEl = document.getElementById("map");
        if (mapEl) {
          mapEl.innerHTML =
            "Gagal memuat peta. Pastikan koneksi internet stabil.";
        } else {
          console.warn('Elemen ID "map" tidak ditemukan');
        }
      }
    } catch (apiError) {
      console.error("Gagal mengambil detail story:", apiError);
      document.body.innerHTML =
        "<h1>Gagal memuat data.</h1> <p>Silakan coba lagi nanti.</p>";
    }
  }
}

export default ReadMorePage;
