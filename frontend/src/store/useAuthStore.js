import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

// ✅ Dynamic backend base URL
const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:5000" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isRegistering: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,

  // ✅ Check authentication (for persistent login)
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data.user });
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  // ✅ Register new user
  register: async (data) => {
    set({ isRegistering: true });
    try {
      const res = await axiosInstance.post("/auth/register", data);
      toast.success(res.data.message || "Registration successful! Please log in.");
      return true;
    } catch (error) {
      const message =
        error.response?.data?.message || "Registration failed. Try again.";
      toast.error(message);
      return false;
    } finally {
      set({ isRegistering: false });
    }
  },

  // ✅ Login user
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Welcome back!");
      return true;
    } catch (error) {
      const message =
        error.response?.data?.message || "Invalid credentials. Try again.";
      toast.error(message);
      return false;
    } finally {
      set({ isLoggingIn: false });
    }
  },

  // ✅ Logout user
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully!");
    } catch (error) {
      const message = error.response?.data?.message || "Logout failed!";
      toast.error(message);
    }
  },

  // ✅ Update profile
  updateProfile: async (profileData) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/profile", profileData);
      set({ authUser: res.data.user });
      toast.success("Profile updated successfully!");
      return true;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to update profile.";
      toast.error(message);
      return false;
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  // ✅ Change password (optional future use)
  changePassword: async (passwordData) => {
    try {
      await axiosInstance.put("/auth/change-password", passwordData);
      toast.success("Password changed successfully!");
      return true;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to change password.";
      toast.error(message);
      return false;
    }
  },
}));
