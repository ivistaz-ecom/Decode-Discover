"use client";
import { create } from "zustand";
import { getAppUser } from "@/lib/firebase/auth";
export const useAuthStore = create((set, get) => ({
    user: null,
    appUser: null,
    loading: true,
    error: null,
    setUser: (user) => set({ user }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    loadAppUser: async () => {
        const { user } = get();
        if (!user) {
            set({ appUser: null });
            return;
        }
        try {
            const appUser = await getAppUser(user.uid);
            set({ appUser });
        }
        catch {
            set({ error: "Failed to load user profile." });
        }
    },
}));
