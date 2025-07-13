import { create } from "zustand";
import axiosInstance from "../services/axiosInstance";
import toast from "react-hot-toast";

export const useAuthStore = create((set, get) => ({

    user: null,
    loading: true,

    loginWithGoogle: () => {
        window.location.href = import.meta.env.VITE_BACKEND_URL + '/auth/google';
    },

    checkAuth: async () => {
        set({ loading: true });
        try {
            const { data } = await axiosInstance.get('auth/profile', {
            withCredentials: true,
            });
            set({ user: data.user });
        } catch {
            set({ user: null });
        } finally {
            set({ loading: false });
        }
    },

    logout: async () => {
        try {
            await axiosInstance.get('auth/logout'); 
            set({ user: null });
            toast.success('Logged out successfully');
        } catch (err) {
            console.error('Logout failed:', err);
            toast.error('Logout failed');
        }
    },

}));

