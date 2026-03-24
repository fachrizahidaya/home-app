import { reactive, readonly } from "vue";
import authService from "@/services/auth";

const state = reactive({
  user: authService.getStoredUser(),
  token: authService.getToken(),
  isAuthenticated: authService.isAuthenticated(),
  loading: false,
  error: null,
});

const actions = {
  async login(credentials) {
    state.loading = true;
    state.error = null;

    try {
      const result = await authService.login(credentials);

      // 👇 HANDLE VERIFY FLOW
      if (result.requiresVerification) {
        return {
          success: false,
          requiresVerification: true,
          email: result.email,
          message: result.message,
        };
      }

      const { token, user } = result;

      state.token = token;
      state.user = user;
      state.isAuthenticated = true;

      return { success: true };
    } catch (error) {
      state.error = error.response?.data?.message || "Login failed. Please try again.";
      return { success: false };
    } finally {
      state.loading = false;
    }
  },

  // 🔥 FIXED REGISTER (NO TOKEN HERE)
  async register(userData) {
    state.loading = true;
    state.error = null;

    try {
      await authService.register(userData);

      // DO NOT set token or user yet
      return { success: true };
    } catch (error) {
      state.error =
        error.response?.data?.message || "Registration failed. Please try again.";
      return { success: false };
    } finally {
      state.loading = false;
    }
  },

  // 🔥 NEW: VERIFY OTP
  async verifyOtp(payload) {
    state.loading = true;
    state.error = null;

    try {
      const { token, user } = await authService.verifyOtp(payload);

      state.token = token;
      state.user = user;
      state.isAuthenticated = true;

      localStorage.setItem("homesync_token", token);
      localStorage.setItem("homesync_user", JSON.stringify(user));

      return { success: true };
    } catch (error) {
      state.error = error.response?.data?.message || "OTP verification failed.";
      return { success: false };
    } finally {
      state.loading = false;
    }
  },

  async resendOtp(email) {
    state.loading = true;
    state.error = null;

    try {
      await authService.resendOtp({ email });
      return { success: true };
    } catch (error) {
      state.error = error.response?.data?.message || "Failed to resend OTP.";
      return { success: false };
    } finally {
      state.loading = false;
    }
  },

  async logout() {
    state.loading = true;

    try {
      await authService.logout();
    } finally {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;

      localStorage.removeItem("homesync_token");
      localStorage.removeItem("homesync_user");
    }
  },

  async fetchUser() {
    if (!state.token) return;

    try {
      const user = await authService.getUser();
      state.user = user;
      localStorage.setItem("homesync_user", JSON.stringify(user));
    } catch (error) {
      console.error("Failed to fetch user:", error);
    }
  },

  clearError() {
    state.error = null;
  },
};

export const useAuthStore = () => ({
  state: readonly(state),
  ...actions,
});
