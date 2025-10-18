import axios from "axios";

// ✅ Automatically detect environment
const baseURL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000/api" // Local backend
    : "/api"; // Production (served from same domain)

export const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Request Interceptor (optional logging)
axiosInstance.interceptors.request.use(
  (config) => {
    // console.log("🔹 Request:", config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response Interceptor (auto redirect on 401)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
