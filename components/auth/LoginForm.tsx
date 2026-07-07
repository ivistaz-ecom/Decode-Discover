"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { signInWithNameAndEmail } from "@/lib/firebase/auth";
import { isFirebaseConfigured } from "@/lib/firebase/client";
import { AUTH_NOT_CONFIGURED_MESSAGE } from "@/lib/firebase/errors";
import {
  ALLOWED_EMAIL_DOMAINS,
  buildEmailFromNameAndDomain,
  type EmailDomain,
} from "@/lib/config/auth";
import {
  accentLabelClass,
  bodyMutedClass,
  glassPrimaryButtonClass,
  inputClass,
} from "@/lib/ui/app-theme";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const FIREBASE_AUTH_SETUP_URL =
  "https://console.firebase.google.com/project/decode-discover/authentication";

const GAME_LOGO_PATH = "/game-logo.png";

export function LoginForm() {
  const [name, setName] = useState("");
  const [domain, setDomain] = useState<EmailDomain | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<
    "checking" | "ok" | "firebase-auth-off" | "server-env-missing"
  >("checking");

  useEffect(() => {
    if (!isFirebaseConfigured()) return;

    let cancelled = false;

    fetch("/api/auth/status")
      .then(async (res) => {
        const raw = await res.text();
        try {
          return JSON.parse(raw) as {
            configured?: boolean;
            reason?: string;
          };
        } catch {
          return { configured: false, reason: "invalid-response" };
        }
      })
      .then((data) => {
        if (cancelled) return;

        if (data.configured) {
          setServerStatus("ok");
          return;
        }
        if (data.reason === "missing-server-env") {
          setServerStatus("server-env-missing");
          return;
        }
        if (data.reason === "firebase-auth-not-enabled") {
          setServerStatus("firebase-auth-off");
          return;
        }
        setServerStatus("ok");
      })
      .catch(() => {
        if (!cancelled) {
          setServerStatus("ok");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!isFirebaseConfigured()) {
    return (
      <div className="rounded-lg border border-amber-700/40 bg-amber-950/40 p-4 text-sm text-amber-100">
        Firebase is not configured. Copy <code>.env.example</code> to{" "}
        <code>.env.local</code> and add your Firebase credentials.
      </div>
    );
  }

  const previewEmail =
    domain && name.trim().length > 0
      ? buildEmailFromNameAndDomain(name, domain)
      : domain
        ? `your.name@${domain}`
        : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!name.trim()) {
      setError("Please enter your name.");
      setLoading(false);
      return;
    }

    if (!domain) {
      setError("Please select your company email.");
      setLoading(false);
      return;
    }

    try {
      await signInWithNameAndEmail(name, domain);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative overflow-hidden rounded-xl border border-[#4a4238] bg-[#2a2621] shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <div className="relative w-full overflow-hidden border-b border-[#4a4238] bg-[#252019]">
          <Image
            src={GAME_LOGO_PATH}
            alt="Decode & Discover"
            width={640}
            height={360}
            priority
            className="relative z-10 h-auto w-full object-contain"
            sizes="(max-width: 448px) 100vw, 448px"
          />
        </div>

        <div className="px-6 py-7 sm:px-8">
          <div className="mb-6 text-center">
            <p className={accentLabelClass}>Internal challenge</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#f4efe6]">
              Sign in to play
            </h1>
            <p className={`mt-2 ${bodyMutedClass}`}>
              Enter your name and select your company
            </p>
          </div>

          {serverStatus === "firebase-auth-off" && (
            <div className="mb-5 rounded-lg border border-amber-700/40 bg-amber-950/30 px-4 py-3 text-sm text-amber-100">
              <p className="font-medium">Firebase Authentication needs to be enabled</p>
              <ol className="mt-2 list-decimal space-y-1 pl-4 text-amber-200/90">
                <li>
                  Open{" "}
                  <a
                    href={FIREBASE_AUTH_SETUP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-pointer underline"
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

          {serverStatus === "server-env-missing" && (
            <div className="mb-5 rounded-lg border border-amber-700/40 bg-amber-950/30 px-4 py-3 text-sm text-amber-100">
              <p className="font-medium">Server configuration required</p>
              <p className="mt-1 text-amber-200/90">
                Add <code className="rounded bg-black/20 px-1">FIREBASE_CLIENT_EMAIL</code>{" "}
                and <code className="rounded bg-black/20 px-1">FIREBASE_PRIVATE_KEY</code>{" "}
                in Vercel Environment Variables, then redeploy.
              </p>
            </div>
          )}

          {error && (
            <div className="mb-5 rounded-lg border border-red-800/50 bg-red-950/30 px-4 py-3 text-sm text-red-200">
              <p>{error}</p>
              {error === AUTH_NOT_CONFIGURED_MESSAGE && (
                <a
                  href={FIREBASE_AUTH_SETUP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block cursor-pointer underline"
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
                className="block text-xs font-medium uppercase tracking-wide text-[#9c9185]"
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
                className={inputClass}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="login-domain"
                className="block text-xs font-medium uppercase tracking-wide text-[#9c9185]"
              >
                Company email
              </label>
              <select
                id="login-domain"
                value={domain}
                onChange={(e) =>
                  setDomain(e.target.value as EmailDomain | "")
                }
                required
                className={inputClass}
              >
                <option value="" disabled>
                  Select your email
                </option>
                {ALLOWED_EMAIL_DOMAINS.map((d) => (
                  <option key={d} value={d}>
                    @{d}
                  </option>
                ))}
              </select>
              {previewEmail && (
                <p className="text-xs text-[#6b6358]">
                  You will sign in as{" "}
                  <span className="font-mono text-[#a89f94]">{previewEmail}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`mt-2 w-full rounded-lg px-4 py-3.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${glassPrimaryButtonClass}`}
            >
              {loading ? "Please wait..." : "Continue to game →"}
            </button>
          </form>

          {loading && (
            <div className="mt-5">
              <LoadingSpinner label="Signing in..." />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
