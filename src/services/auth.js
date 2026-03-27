import api from "./api";

export const authService = {
  // =========================
  // LOGIN
  // =========================
  async login(credentials) {
    try {
      const response = await api.post("/auth/login", credentials);
      const { access_token, user } = response.data.data;

      localStorage.setItem("homesync_token", access_token);
      localStorage.setItem("homesync_user", JSON.stringify(user));

      return { token: access_token, user };
    } catch (error) {
      const res = error.response;

      // HANDLE UNVERIFIED USER
      if (res?.status === 403 && res.data?.requires_verification) {
        return {
          requiresVerification: true,
          email: res.data.email,
          message: res.data.message,
        };
      }

      throw error;
    }
  },

  // =========================
  // REGISTER (NO TOKEN YET)
  // =========================
  async register(userData) {
    const response = await api.post("/auth/register", userData);

    // Backend returns:
    // success, message, data { user_id, email, username }

    return response.data;
  },

  // =========================
  // VERIFY OTP (THIS RETURNS TOKEN)
  // =========================
  async verifyOtp({ email, otp }) {
    const response = await api.post("/auth/verify-otp", {
      email,
      otp,
    });

    const { token, user } = response.data.data;

    // Save once here (single source of truth)
    localStorage.setItem("homesync_token", token);
    localStorage.setItem("homesync_user", JSON.stringify(user));

    return { token, user };
  },

  // =========================
  // RESEND OTP
  // =========================
  async resendOtp(payload) {
    const response = await api.post("/auth/resend-otp", payload);
    return response.data;
  },

  // =========================
  // LOGOUT
  // =========================
  async logout() {
    try {
      await api.post("/auth/logout");
    } finally {
      localStorage.removeItem("homesync_token");
      localStorage.removeItem("homesync_user");
    }
  },

  // =========================
  // USER
  // =========================
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

  // =========================
  // STORAGE HELPERS
  // =========================
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
