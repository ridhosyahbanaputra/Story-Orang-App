class StoryMarkPage {
  async render() {
    return `
      <div class="page-content">
        <section class="story-list-panel">

          <h1>Story Tersimpan</h1>
          <h2>Cerita yang Anda Tandai</h2>
          
          <div id="saved-stories-list" class="story-list-content">
            <p>Coming soon </p>
          </div>
        </section>
      </div>
    `;
  }

  async afterRender() {
  }
}

export default StoryMarkPage;