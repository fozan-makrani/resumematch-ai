import axios from "axios";

const api = axios.create({
  baseURL: "/api", // proxied to localhost:5000 in dev, same-origin in prod
  timeout: 25000, //slightly above the backend's 20s LLM timeout, so axiosdoesn't cut the request off before the backend responds
});

// Attach the JWT to every outgoing request automatically — no component ever needs to remember to add the Authorization header itself.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("resumematch-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global 401 handling — if the token is invalid/expired, every request that hits this ends up in one place, not duplicated per-component.
api.interceptors.response.use(
  (response) => response,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("resumematch-token");
      localStorage.removeItem("resumematch-user");
      // Full reload (not client-side navigate) clears all in-memory app state cleanly, guaranteeing no stale user data lingers anywhere.
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

export default api;