"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { AppShell } from "@/components/layout/AppShell";
import { accentLabelClass, bodyMutedClass } from "@/lib/ui/app-theme";
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
    return (<AppShell className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <p className={`mb-5 text-center font-display text-lg font-bold tracking-tight text-slate-100 sm:text-xl`}>
          Discover &amp; Decode
        </p>
        <p className={`-mt-3 mb-5 text-center ${accentLabelClass}`}>
          Internal puzzle challenge
        </p>
        <LoginForm />
        <p className={`mt-6 text-center text-xs ${bodyMutedClass}`}>
          One puzzle per week · Select your company domain
        </p>
      </div>
    </AppShell>);
}
