import ApiSource from "../../../data/api";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

class RegisterPage {
  async render() {
    return `
      <div class="page-content page-transition">
        <h1 class="form-title">Registrasi Akun Baru</h1>
        
        <form id="registerForm" class="auth-form">

          <div class="form-group">
            <label for="registerName">Nama Lengkap</label>
            <input type="text" id="registerName" name="registerName" placeholder="Nama Anda" required>
          </div>

          <div class="form-group">
            <label for="registerEmail">Email</label>
            <input type="email" id="registerEmail" name="registerEmail" placeholder="email@gmail.com" required>
          </div>
          
          <div class="form-group">
            <label for="registerPassword">Password</label>
            <input type="password" id="registerPassword" name="registerPassword" placeholder="Minimal 8 karakter" minlength="8" required>
          </div>

          <div class="form-group">
            <label for="registerPasswordConfirm">Konfirmasi Password</label>
            <input type="password" id="registerPasswordConfirm" name="registerPasswordConfirm" placeholder="Ketik ulang password Anda" minlength="8" required>
          </div>

          <button type="submit" class="btn-cta">Daftar</button>
        </form>

        <p class="form-link">
          Sudah punya akun? <a href="#/login">Login di sini</a>
        </p>
      </div>
    `;
  }

  async afterRender() {
    const registerForm = document.querySelector("#registerForm");

    registerForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const name = document.querySelector("#registerName").value;
      const email = document.querySelector("#registerEmail").value;
      const password = document.querySelector("#registerPassword").value;
      const passwordConfirm = document.querySelector(
        "#registerPasswordConfirm"
      ).value;

      if (password.length < 8) {
        Swal.fire({
          icon: "error",
          title: "Registrasi Gagal",
          text: "Password minimal 8 karakter.",
        });
        return;
      }

      if (password !== passwordConfirm) {
        Swal.fire({
          icon: "error",
          title: "Registrasi Gagal",
          text: "Password dan Konfirmasi Password tidak cocok.",
        });
        return;
      }

      const userData = { name, email, password };

      Swal.fire({
        title: "Mendaftarkan...",
        text: "Mohon tunggu sebentar.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        const response = await ApiSource.register(userData);
        if (response.error) {
          throw new Error(response.message);
        }

        Swal.fire({
          icon: "success",
          title: "Registrasi Berhasil!",
          text: "Akun Anda telah dibuat. Silakan login.",
          timer: 2000,
          showConfirmButton: false,
        });

        setTimeout(() => {
          window.location.hash = "#/login";
        }, 2000);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Registrasi Gagal",
          text: error.message || "Terjadi kesalahan. Silakan coba lagi.",
        });
      }
    });
  }
}

export default RegisterPage;
