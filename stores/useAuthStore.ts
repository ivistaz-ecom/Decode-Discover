"use client";

import { create } from "zustand";
import type { User } from "firebase/auth";
import { getAppUser } from "@/lib/firebase/auth";
import type { AppUser } from "@/types/user";

interface AuthState {
  user: User | null;
  appUser: AppUser | null;
  loading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  loadAppUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
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
    } catch {
      set({ error: "Failed to load user profile." });
    }
  },
}));
