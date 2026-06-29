"use client";

import { useEffect, useRef } from "react";
import { subscribeToAuth } from "@/lib/firebase/auth";
import { resetGameStore } from "@/stores/useGameStore";
import { useAuthStore } from "@/stores/useAuthStore";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);
  const loadAppUser = useAuthStore((s) => s.loadAppUser);
  const previousUidRef = useRef<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => {
      const nextUid = user?.uid ?? null;
      if (
        previousUidRef.current !== null &&
        previousUidRef.current !== nextUid
      ) {
        resetGameStore();
      }
      previousUidRef.current = nextUid;

      setUser(user);
      setLoading(false);

      if (user) {
        void loadAppUser();
      } else {
        useAuthStore.setState({ appUser: null });
      }
    });

    return unsubscribe;
  }, [setUser, setLoading, loadAppUser]);

  return <>{children}</>;
}
