"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuthStore } from "@/stores/useAuthStore";
import { resetGameStore } from "@/stores/useGameStore";

export default function LoginPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);

  useEffect(() => {
    if (!loading && !user) {
      resetGameStore();
    }
  }, [loading, user]);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/game");
    }
  }, [loading, user, router]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(56,189,248,0.12),_transparent_50%),radial-gradient(ellipse_at_bottom,_rgba(99,102,241,0.1),_transparent_50%)]"
        aria-hidden
      />
      <div className="relative z-10 w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}
