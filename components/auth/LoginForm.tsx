"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { signInWithNameAndEmail } from "@/lib/firebase/auth";
import { isFirebaseConfigured } from "@/lib/firebase/client";
import { AUTH_NOT_CONFIGURED_MESSAGE } from "@/lib/firebase/errors";
import {
  allowedDomainsLabel,
  DISALLOWED_EMAIL_MESSAGE,
  isAllowedEmail,
} from "@/lib/config/auth";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const FIREBASE_AUTH_SETUP_URL =
  "https://console.firebase.google.com/project/decode-discover/authentication";

const GAME_LOGO_PATH = "/game-logo.png";

export function LoginForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authConfigured, setAuthConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured()) return;

    fetch("/api/auth/status")
      .then(async (res) => {
        const raw = await res.text();
        try {
          return JSON.parse(raw) as {
            configured?: boolean;
            reason?: string;
            message?: string;
          };
        } catch {
          return { configured: false, reason: "invalid-response" };
        }
      })
      .then((data) => {
        if (data.configured) {
          setAuthConfigured(true);
          return;
        }
        if (data.reason === "missing-server-env") {
          setAuthConfigured(null);
          setError(
            data.message ??
              "Server is missing Firebase Admin credentials on Vercel."
          );
          return;
        }
        setAuthConfigured(data.configured ?? false);
      })
      .catch(() => setAuthConfigured(null));
  }, []);

  if (!isFirebaseConfigured()) {
    return (
      <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        Firebase is not configured. Copy <code>.env.example</code> to{" "}
        <code>.env.local</code> and add your Firebase credentials.
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!name.trim()) {
      setError("Please enter your name.");
      setLoading(false);
      return;
    }

    if (!isAllowedEmail(email)) {
      setError(DISALLOWED_EMAIL_MESSAGE);
      setLoading(false);
      return;
    }

    try {
      await signInWithNameAndEmail(name, email);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-slate-900/90 shadow-2xl shadow-blue-950/40 backdrop-blur-sm">
      <div className="relative w-full bg-slate-950">
        <Image
          src={GAME_LOGO_PATH}
          alt="Decode & Discover"
          width={640}
          height={360}
          priority
          className="h-auto w-full object-contain"
          sizes="(max-width: 448px) 100vw, 448px"
        />
      </div>

      <div className="border-t border-white/5 px-6 py-7 sm:px-8">
        <div className="mb-6 text-center">
          <h1 className="text-lg font-semibold tracking-tight text-white">
            Sign in to play
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
            Use your name and company email
            <span className="mt-1 block text-xs text-slate-500">
              ({allowedDomainsLabel()})
            </span>
          </p>
        </div>

      {authConfigured === false && (
        <div className="mb-5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          <p className="font-medium">Firebase Authentication needs to be enabled</p>
          <ol className="mt-2 list-decimal space-y-1 pl-4 text-amber-200/90">
            <li>
              Open{" "}
              <a
                href={FIREBASE_AUTH_SETUP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Firebase Authentication
              </a>
            </li>
            <li>
              Click <strong>Get started</strong>
            </li>
            <li>
              Under Sign-in method, enable <strong>Email/Password</strong>
            </li>
            <li>Refresh this page and try again</li>
          </ol>
        </div>
      )}

      {authConfigured === null && (
        <div className="mb-5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          <p className="font-medium">Could not verify server configuration</p>
          <p className="mt-1 text-amber-200/90">
            The login API may be misconfigured on Vercel. Ensure{" "}
            <code className="rounded bg-black/20 px-1">FIREBASE_CLIENT_EMAIL</code>{" "}
            and <code className="rounded bg-black/20 px-1">FIREBASE_PRIVATE_KEY</code>{" "}
            are set in Vercel Environment Variables, then redeploy.
          </p>
        </div>
      )}

        {error && (
          <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            <p>{error}</p>
            {error === AUTH_NOT_CONFIGURED_MESSAGE && (
              <a
                href={FIREBASE_AUTH_SETUP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block underline"
              >
                Open Firebase Authentication setup
              </a>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="login-name"
              className="block text-xs font-medium uppercase tracking-wide text-slate-400"
            >
              Name
            </label>
            <input
              id="login-name"
              type="text"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              className="w-full rounded-xl border border-slate-700/80 bg-slate-800/80 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 transition focus:border-cyan-500/60 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="login-email"
              className="block text-xs font-medium uppercase tracking-wide text-slate-400"
            >
              Company email
            </label>
            <input
              id="login-email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-xl border border-slate-700/80 bg-slate-800/80 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 transition focus:border-cyan-500/60 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-900/30 transition hover:from-cyan-500 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Please wait..." : "Continue to game"}
          </button>
        </form>

        {loading && (
          <div className="mt-5 [&_div]:border-slate-600 [&_div]:border-t-cyan-400 [&_p]:text-slate-400">
            <LoadingSpinner label="Signing in..." />
          </div>
        )}
      </div>
    </div>
  );
}
