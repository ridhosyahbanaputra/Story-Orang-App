import routes from "../routes/routes";
import { getActiveRoute } from "../routes/url-parser";
import Auth from "../utils/auth";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  #loginLink = null;
  #logoutButton = null;

  #currentPage = null;

  constructor({ content, drawerButton, navigationDrawer }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this.#loginLink = document.querySelector("#login-link");
    this.#logoutButton = document.querySelector("#logout-button");

    this._setupDrawer();
    this._initialAppShell();
  }

  _setupDrawer() {
    this.#drawerButton.addEventListener("click", (event) => {
      event.stopPropagation();
      this.#navigationDrawer.classList.toggle("open");
    });

    document.body.addEventListener("click", (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove("open");
      }

      this.#navigationDrawer.querySelectorAll("a").forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove("open");
        }
      });
    });
  }

  _initialAppShell() {
    this.#logoutButton.addEventListener("click", (event) => {
      event.preventDefault();
      Swal.fire({
        title: "Beneran ingin logout?",
        text: "Anda akan diarahkan ke halaman login.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#227cd0ff",
        cancelButtonColor: "rgba(205, 46, 46, 1)",
        confirmButtonText: "Ya, keluar!",
        cancelButtonText: "Gak",
      }).then((result) => {
        if (result.isConfirmed) {
          Auth.removeToken();

          sessionStorage.setItem(
            "logoutMessage",
            "Anda telah berhasil logout."
          );
          window.location.hash = "#/login";
        }
      });
    });
  }

  _updateNavbar() {
    const isLoggedIn = Auth.isLoggedIn();
    if (isLoggedIn) {
      this.#loginLink.style.display = "none";
      this.#logoutButton.style.display = "block";
    } else {
      this.#loginLink.style.display = "block";
      this.#logoutButton.style.display = "none";
    }
  }

  async renderPage() {
    this._updateNavbar();

    if (this.#currentPage && typeof this.#currentPage.cleanup === "function") {
      await this.#currentPage.cleanup();
    }

    const url = getActiveRoute();
    const pageInstance = routes[url]; 

    const protectedRoutes = ["/addStory"];
    const guestRoutes = ["/login", "/register"];
    const isLoggedIn = Auth.isLoggedIn();

    if (protectedRoutes.includes(url) && !isLoggedIn) {
      alert("Anda harus login untuk mengakses halaman ini.");
      window.location.hash = "#/login";
      return;
    }
    if (guestRoutes.includes(url) && isLoggedIn) {
      window.location.hash = "#/home";
      return;
    }

    const justLoggedOut = !!sessionStorage.getItem("logoutMessage");
    const justPostedStory = !!sessionStorage.getItem("storySuccessMessage");
    if (!justLoggedOut && !justPostedStory) {
      Swal.fire({
        title: "Memuat Halaman...",
        text: "Mohon tunggu sebentar",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
    }

    try {
      if (!document.startViewTransition) {
        this.#content.innerHTML = await pageInstance.render();
        await pageInstance.afterRender();
      } else {
        const transition = document.startViewTransition(async () => {
          this.#content.innerHTML = await pageInstance.render();
        });
        await transition.updateCallbackDone;
        await pageInstance.afterRender();
      }

      this.#currentPage = pageInstance;
    } catch (error) {
      console.error("Error selama render halaman:", error);
      if (!justLoggedOut && !justPostedStory) {
        Swal.fire({
          icon: "error",
          title: "Oops... Gagal!",
          text: "Halaman tidak berhasil dimuat.",
        });
      }
    } finally {
      if (!justLoggedOut && !justPostedStory) {
        Swal.close();
      }
    }
  }
}

export default App;
