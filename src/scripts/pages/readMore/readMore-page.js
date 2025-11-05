// Di dalam: src/scripts/pages/readMore/readMore-page.js (LENGKAP & BERSIH)

import { parseActivePathname } from "../../routes/url-parser";
import { initDetailPageMap } from "../../utils/maps";
import { showFormattedDate } from "../../utils/index";
import getPlaceName from "../../data/placeName-api";
import ApiSource from "../../data/api";

import Leaflet from "leaflet";
import "leaflet/dist/leaflet.css";

import feather from "feather-icons";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

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

        
        <div class="story-header">
            
            <div class="author-info">
              <h1 class="story-author" id="story-author"></h1>
              <p class="story-date-detail" id="story-date"></p>
            </div>
            
            <button id="story-mark-button" class="btn-story-mark">
              </button>
          </div>
          <img id="story-image" class="story-detail-image" src="" alt="Memuat gambar cerita..." style="display: none;">
          
          <div class="story-content">
            <p id="story-body">...</p>
          </div>

          <div class="story-location">
            <h2>Lokasi Cerita</h2>
            <div id="map"></div>
            <p class="story-coordinates">
              <strong>Lokasi:</strong> <span id="story-location-name">Memuat...</span><br>
              <strong>Coordinate:</strong> <span id="story-lat"></span> <span id="story-lon">...</span>
            </p>
          </div>
        </article>
      </div>
    `;
  }

  async afterRender() {
    try {
      const url = parseActivePathname();
      const storyId = url.id;
      const story = await ApiSource.getStoryDetail(storyId);

      const authorEl = document.getElementById("story-author");
      if (authorEl) authorEl.innerText = story.name;

      const bodyEl = document.getElementById("story-body");
      if (bodyEl) bodyEl.innerText = story.description;

      const storyImage = document.getElementById("story-image");
      if (story.photoUrl && storyImage) {
        storyImage.src = story.photoUrl;
        storyImage.alt = `Gambar untuk ${story.name}`;
        storyImage.style.display = "block";
      }

      const dateEl = document.getElementById("story-date");
      if (dateEl) {
        dateEl.innerText = showFormattedDate(story.createdAt, "id-ID");
      } else {
        console.warn('Elemen ID "story-date" tidak ditemukan');
      }

      const placeName = await getPlaceName.getCityName(story.lat, story.lon);
      const locationNameEl = document.getElementById("story-location-name");
      if (locationNameEl) locationNameEl.innerText = placeName;

      const latEl = document.getElementById("story-lat");
      if (latEl) latEl.innerText = story.lat;

      const lonEl = document.getElementById("story-lon");
      if (lonEl) lonEl.innerText = story.lon;

      try {
        initDetailPageMap("map", story.lat, story.lon, story.name);
      } catch (error) {
        console.error("Error initializing map:", error);
      }

      const storyMarkButton = document.getElementById("story-mark-button");

      const isStoryMarked = () => {
        const marks = JSON.parse(localStorage.getItem("storyMarks")) || [];
        return marks.includes(storyId);
      };

      const updateButtonUI = () => {
        if (isStoryMarked()) {
          storyMarkButton.innerHTML = `${feather.icons["bookmark"].toSvg({
            fill: "currentColor",
          })}`;
          storyMarkButton.classList.add("marked");
        } else {
          storyMarkButton.innerHTML = `${feather.icons["bookmark"].toSvg()}`;
          storyMarkButton.classList.remove("marked");
        }
      };

      const toggleStoryMark = () => {
        let marks = JSON.parse(localStorage.getItem("storyMarks")) || [];
        if (isStoryMarked()) {
          marks = marks.filter((id) => id !== storyId);
          Swal.fire({
            icon: "success",
            title: "Story Dihapus",
            timer: 1500,
            showConfirmButton: false,
          });
        } else {
          marks.push(storyId);
          Swal.fire({
            icon: "success",
            title: "Story Disimpan!",
            timer: 1500,
            showConfirmButton: false,
          });
        }
        localStorage.setItem("storyMarks", JSON.stringify(marks));
        updateButtonUI();
      };

      updateButtonUI();
      storyMarkButton.addEventListener("click", toggleStoryMark);
      window.scrollTo(0, 0);
    } catch (apiError) {
      console.error("Gagal mengambil detail story:", apiError);
      document.body.innerHTML =
        "<h1>Gagal memuat data.</h1> <p>Silakan coba lagi nanti.</p>";
    }
  }
}

export default ReadMorePage;
