class AboutPage {
  async render() {
    return `
      <div class="page-content">
        <h1 class="page-title">About Me</h1>
        
        <div class="about-container">
          <div class="about-content">

            <div class="about-text">
              <h2>Story Orang</h2>
              
              <h3>Description</h3>
              <p>
                Story Orang adalah platform berbagi cerita mutakhir yang dirancang sebagai Progressive Web App (PWA), 
                menggabungkan pengalaman native aplikasi seluler dengan aksesibilitas web yang universal. 
                Aplikasi ini adalah ruang yang andal, cepat, dan menarik bagi setiap pengguna untuk berbagi narasi kehidupan mereka yang 
                terikat dengan lokasi geografis.
              </p>

              <h3>Resource</h3>
              <p>API: 
                    <a href="https://story-api.dicoding.dev/v1" target="_blank" rel="noopener noreferrer">
                  story-api.dicoding.dev/v1
                </a></p>


              <h3>Font:</h3>
              <p class="font-display">Quick Sand</p>

              <h3>Color:</h3>
              <div class="color-palette">
               <div class="color-swatch">
                  <div class="swatch-box" style="background-color: #ffffffff;"></div>
                  <span class="hex-code">#ffffffff</span>
                </div>
                <div class="color-swatch">
                  <div class="swatch-box" style="background-color: #000000;"></div>
                  <span class="hex-code">#000000</span>
                </div>
                <div class="color-swatch">
                  <div class="swatch-box" style="background-color: #0391CE;"></div>
                  <span class="hex-code">#0391CE</span>
                </div>
                <div class="color-swatch">
                  <div class="swatch-box" style="background-color: #DB712A;"></div>
                  <span class="hex-code">#DB712A</span>
                </div>
                <div class="color-swatch">
                  <div class="swatch-box" style="background-color: #E9C264;"></div>
                  <span class="hex-code">#E9C264</span>
                </div>
                <div class="color-swatch">
                  <div class="swatch-box" style="background-color: #F8D08A;"></div>
                  <span class="hex-code">#F8D08A</span>
                </div>
              </div>
            </div>

            <div class="about-visuals">
              <div class="logo-item">
                <img src="../../../public/images/logo.png" alt="Website Logo">
                <p>Website Logo</p>
              </div>
              <div class="logo-item">
                <img src="../../../public/images/AppLogo.png" alt="Application Logo">
                <p>Application Logo</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    `;
  }
  async afterRender() {
    return null;
  }
}
export default AboutPage;
