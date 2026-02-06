import api from "./api";

export const authService = {
  async login(credentials) {
    const response = await api.post("/auth/login", credentials);
    const { access_token, user } = response.data.data;

    localStorage.setItem("homesync_token", access_token);
    localStorage.setItem("homesync_user", JSON.stringify(user));

    return { token: access_token, user };
  },

  async logout() {
    try {
      await api.post("/auth/logout");
    } finally {
      localStorage.removeItem("homesync_token");
      localStorage.removeItem("homesync_user");
    }
  },

  async getUser() {
    const response = await api.get("/auth/user");
    return response.data.data.user;
  },

  async refreshToken() {
    const response = await api.post("/auth/refresh-token");
    const { access_token } = response.data.data;
    localStorage.setItem("homesync_token", access_token);
    return access_token;
  },

  getStoredUser() {
    const user = localStorage.getItem("homesync_user");
    return user ? JSON.parse(user) : null;
  },

  getToken() {
    return localStorage.getItem("homesync_token");
  },

  isAuthenticated() {
    return !!this.getToken();
  },
};

export default authService;
