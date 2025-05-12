/* eslint-disable @typescript-eslint/no-unused-vars */
import { create } from "zustand";
import api from "../api/axiosInstance";

interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  user: { name: string; email: string } | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  accessToken: null,
  user: null,
  login: async (email: string, password: string) => {
    try {
      const response = await api.post(
        "/auth/login",
        { email, password },
        { withCredentials: true }
      );
      const { accessToken } = response.data;
      set({ isAuthenticated: true, accessToken, user: { email, name: "" } });
    } catch (error) {
      throw new Error("Login failed");
    }
  },
  register: async (name: string, email: string, password: string) => {
    try {
      const response = await api.post(
        "/auth/register",
        {
          name,
          email,
          password,
        },
        { withCredentials: true }
      );
      const { accessToken } = response.data;
      set({ isAuthenticated: true, accessToken, user: { name, email } });
    } catch (error) {
      throw new Error("Registration failed");
    }
  },
  logout: async () => {
    try {
      await api.post("/auth/logout");
      set({ isAuthenticated: false, accessToken: null, user: null });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  },
  refreshAccessToken: async () => {
    try {
      const response = await api.post(
        "/auth/refresh",
        {},
        { withCredentials: true }
      );
      const { accessToken } = response.data;
      set({ isAuthenticated: true, accessToken });
    } catch (error) {
      set({ isAuthenticated: false, accessToken: null, user: null });
      throw new Error("Token refresh failed");
    }
  },
}));
