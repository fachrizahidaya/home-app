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
      const { token, user } = await authService.login(credentials);
      state.token = token;
      state.user = user;
      state.isAuthenticated = true;
      return { success: true };
    } catch (error) {
      state.error = error.response?.data?.message || "Login failed. Please try again.";
      return { success: false, error: state.error };
    } finally {
      state.loading = false;
    }
  },

  async register(userData) {
    state.loading = true;
    state.error = null;

    try {
      const { token, user } = await authService.register(userData);
      state.token = token;
      state.user = user;
      state.isAuthenticated = true;
      return { success: true };
    } catch (error) {
      state.error =
        error.response?.data?.message || "Registration failed. Please try again.";
      return { success: false, error: state.error };
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

export default useAuthStore;
