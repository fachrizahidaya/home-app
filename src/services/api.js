import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("homesync_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle auth errors and auto-refresh token
api.interceptors.response.use(
  (response) => {
    // Check for new token in response headers (auto-refreshed)
    const newToken = response.headers["x-new-token"];
    if (newToken) {
      localStorage.setItem("homesync_token", newToken);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("homesync_token");
      localStorage.removeItem("homesync_user");
    }
    return Promise.reject(error);
  },
);

export default api;
