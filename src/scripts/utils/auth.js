
const Auth = {
  saveToken(token) {
    localStorage.setItem('authToken', token);
  },

  getToken() {
    return localStorage.getItem('authToken');
  },

  removeToken() {
    localStorage.removeItem('authToken');
  },

  isLoggedIn() {
    return !!this.getToken();
  },
};

export default Auth;