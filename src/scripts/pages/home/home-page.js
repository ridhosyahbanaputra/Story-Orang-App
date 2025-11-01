import ApiSource from "../../data/api";
import { initHomePageMap, addMarkersToMap } from "../../utils/maps";

import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

class HomePage {
  async render() {
    return `
      <section class="hero">
        <div class="hero-inner">
          <h1>Selamat Datang di STORY ORANG</h1>
          <p>Tempat di mana setiap orang bisa berbagi story .</p>
          <a href="#/addStory" class="btn-cta">Tulis Story Anda</a>
        </div>
      </section>

      <div class="map-container page-transition">
        <div id="story-map"></div>
        <div class="story-list-panel">
          <h2>Cerita Saat Ini</h2>
          <div class="story-list-content" id="story-list-content">
          </div>
        </div>
      </div>
    `;
  }

  async afterRender() {
    const successMessage = sessionStorage.getItem("storySuccessMessage");
    if (successMessage) {
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: successMessage,
        timer: 2000, 
        showConfirmButton: false,
      });
      sessionStorage.removeItem("storySuccessMessage");
    }

    const storyListContent = document.querySelector("#story-list-content");

    try {
      const map = initHomePageMap('story-map');

      const result = await ApiSource.getAllStories();
      const stories = result.data; 

      if (result.isMock) {
        storyListContent.innerHTML = "<h3>Login Dulu untuk melihat cerita.</h3>";
        return; 
      }
      
      if (!stories || stories.length === 0) {
        storyListContent.innerHTML = "<h3>Belum ada cerita tersedia.</h3>";
        return;
      }

      const markers = addMarkersToMap(map, stories, (marker) => {
        map.flyTo(marker.getLatLng(), 13);
      });

      stories.forEach((story) => {
        if (story.lat && story.lon) {
          const storyCard = document.createElement("article");
          storyCard.classList.add("story-card");
          storyCard.setAttribute("data-story-id", story.id);

          storyCard.innerHTML = `
            <h3>${story.name || "Tanpa Nama"}</h3>
            <img src="${
              story.photoUrl
            }" class="story-card-image" alt="Gambar untuk ${
            story.name || "cerita"
          }">
            <p class="story-location">📍 Lat: ${story.lat.toFixed(
              4
            )}, Lon: ${story.lon.toFixed(4)}</p>
            <p class="story-snippet">${
              story.description?.substring(0, 80) || "Tidak ada deskripsi"
            }...</p>
            <a href="#/readMore/${
              story.id
            }" class="story-link">Baca Selengkapnya &rarr;</a>
          `;
          storyListContent.appendChild(storyCard);
        }
      });

      storyListContent.addEventListener("click", (event) => {
        const storyCard = event.target.closest(".story-card");
        if (storyCard) {
          const storyId = storyCard.dataset.storyId;
          const marker = markers[storyId];

          if (marker) {
            map.flyTo(marker.getLatLng(), 13);
            marker.openPopup();
          }
        }
      });

    } catch (error) {
      console.error("Error rendering home page:", error);
      storyListContent.innerHTML = "<p>Terjadi kesalahan saat memuat data.</p>";
    }
  }
}

export default HomePage;
