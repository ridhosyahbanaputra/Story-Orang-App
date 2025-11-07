import DbHelper from "../../utils/db-helper";
import getPlaceName from "../../data/placeName-api";
import { showFormattedDate } from "../../utils/index.js";
import feather from "feather-icons";

class StoryMarkPage {
  async render() {
    return `
     
       <div class="story-content-wrapper">
        <div class="story-list-panel">
          <h1>Story Tersimpan</h1>
          <div class="search-container">
            <input type="search" id="search-bar" placeholder="Cari berdasarkan judul atau deskripsi...">
          </div>
         <div id="saved-stories-list" class="story-list-content">
            </div>
        </div>
      </div>
    `;
  }

  async afterRender() {

    const listContainer = document.querySelector("#saved-stories-list");
    const searchBar = document.querySelector("#search-bar");
    listContainer.innerHTML = "<p>Memuat cerita yang Anda tandai...</p>";

    const allStories = await DbHelper.getAllStories();

    const renderStories = async (storiesToRender) => {
      listContainer.innerHTML = "";

      if (storiesToRender.length === 0) {
        listContainer.innerHTML =
          "<p>Tidak ada cerita yang cocok dengan pencarian Anda.</p>";
        return;
      }

      for (const story of storiesToRender) {
        const placeName = await getPlaceName.getCityName(story.lat, story.lon);
        const formattedDate = showFormattedDate(story.createdAt, "id-ID");

        const storyCard = document.createElement("article");
        storyCard.classList.add("story-card");

        storyCard.innerHTML = `
          <h3>${story.name || "Tanpa Nama"}</h3>
          <img src="${
            story.photoUrl
          }" class="story-card-image" alt="Gambar untuk ${
          story.name || "cerita"
        }" loading="lazy">
          <p class="story-date">
            ${feather.icons.calendar.toSvg({ width: 16, height: 16 })}
            ${formattedDate}
          </p>
          <p class="story-location">
            ${feather.icons["map-pin"].toSvg({ width: 16, height: 16 })}
            ${placeName}
          </p> 
          <p class="story-snippet">${
            story.description?.substring(0, 80) || "Tidak ada deskripsi"
          }...</p>
          <a href="#/readMore/${
            story.id
          }" class="story-link">Baca Selengkapnya &rarr;</a>
        `;
        listContainer.appendChild(storyCard);
      }
    };

    if (allStories.length === 0) {
      listContainer.innerHTML = "<p>Anda belum menandai cerita apapun.</p>";
    } else {
      await renderStories(allStories);
    }

    searchBar.addEventListener("keyup", async () => {
      const searchTerm = searchBar.value.toLowerCase();

      const filteredStories = allStories.filter(
        (story) =>
          story.name.toLowerCase().includes(searchTerm) ||
          story.description.toLowerCase().includes(searchTerm)
      );

      await renderStories(filteredStories);
    });
  }
}

export default StoryMarkPage;
