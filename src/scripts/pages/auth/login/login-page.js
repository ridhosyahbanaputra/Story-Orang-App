import ApiSource from "../../../data/api";
import Auth from "../../../utils/auth";
import DbHelper from "../../../utils/db-helper"; 
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

class LoginPage {
  async render() {
    return `
      <div class="page-content page-transition">
        <h1 class="form-title">Login</h1>
        
        <form id="loginForm" class="auth-form">
          
          <div class="form-group">
            <label for="loginEmail">Email</label>
            <input type="email" id="loginEmail" name="loginEmail" placeholder="email@gmail.com" required>
          </div>
          
          <div class="form-group">
            <label for="loginPassword">Password</label>
            <input type="password" id="loginPassword" name="loginPassword" placeholder="Password Anda" required>
          </div>

          <button type="submit" class="btn-cta">Login</button>
        </form>

        <p class="form-link">
          Belum punya akun? <a href="#/register">Daftar di sini</a>
        </p>
      </div>
    `;
  }

  async afterRender() {
    const logoutMessage = sessionStorage.getItem("logoutMessage");
    if (logoutMessage) {
      Swal.fire({
        icon: "success",
        title: "Logout Berhasil!",
        text: logoutMessage,
        timer: 2000,
        showConfirmButton: false,
      });
      sessionStorage.removeItem("logoutMessage");
    }

    const loginForm = document.querySelector("#loginForm");

    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const email = document.querySelector("#loginEmail").value;
      const password = document.querySelector("#loginPassword").value;

      if (password.length < 8) {
        Swal.fire({
          icon: "error",
          title: "Login Gagal",
          text: "Password minimal 8 karakter.",
        });
        return;
      }
      const userData = { email, password };

      Swal.fire({
        title: "Logging in...",
        text: "Mohon tunggu sebentar.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        const response = await ApiSource.login(userData);
        if (response.error) {
          throw new Error(response.message);
        }

        const token = response.loginResult.token;
        Auth.saveToken(token); 

        await DbHelper.putToken(token); 

        Swal.fire({
          icon: "success",
          title: "Login Berhasil!",
          text: "Anda akan diarahkan ke Halaman Utama.",
          timer: 2000,
          showConfirmButton: false,
        });

        setTimeout(() => {
          window.location.hash = "#/home";
          window.location.reload();
        }, 2000);
      } catch (error) {
        let pesanError = "Terjadi kesalahan. Silakan coba lagi.";

        if (error.message.toLowerCase().includes("invalid password")) {
          pesanError = "Password salah, silakan periksa kembali.";
        } else if (error.message.toLowerCase().includes("user not found")) {
          pesanError = "Email tidak terdaftar.";
        }
        Swal.fire({
          icon: "error",
          title: "Login Gagal",
          text: pesanError,
        });
      }
    });
  }
}

export default LoginPage;
