import { create } from "zustand";
import toast from "react-hot-toast";
import axiosInstance from "../services/axiosInstance";

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,
  token: localStorage.getItem('jwt') || null,

  loginWithGoogle: () => {
    window.location.href = import.meta.env.VITE_BACKEND_URL + '/auth/google';
  },

  setToken: (token) => {
    localStorage.setItem('jwt', token);
    set({ token });
    // Set axios default header
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },

  checkAuth: async () => {
    set({ loading: true });
    const token = localStorage.getItem('jwt');
    
    if (!token) {
      set({ user: null, loading: false });
      return;
    }

    try {
      // Set authorization header
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const { data } = await axiosInstance.get('auth/profile');
      set({ user: data.user });
    } catch {
      localStorage.removeItem('jwt');
      set({ user: null, token: null });
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.get('auth/logout');
      localStorage.removeItem('jwt');
      delete axiosInstance.defaults.headers.common['Authorization'];
      set({ user: null, token: null });
      toast.success('Logged out successfully');
    } catch (err) {
      console.error('Logout failed:', err);
      toast.error('Logout failed');
    }
  },
}));