"use client";

// ============================================================================
// ShopSphere Better Auth Sign-In, OAuth & Local Dev Workflow View
// Experiment 7: Better Auth with Google & GitHub OAuth + Honest Setup Diagnostics
// Experiment 8: Role-Based Access Control Personas (Guest, Customer, Admin)
// ============================================================================
import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Mail,
  Lock,
  User,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ExternalLink,
  LogOut,
} from "lucide-react";
import { authClient } from "@/lib/auth/auth-client";
import {
  authenticateWithEmailAction,
  signOutAction,
  switchDemoPersonaAction,
} from "@/actions/auth-actions";
import { useToast } from "@/components/ui/toast-provider";
import type { AppUser } from "@/types";

interface LoginViewProps {
  currentUser: AppUser | null;
  googleConfigured: boolean;
  githubConfigured: boolean;
  enableDevSwitcher: boolean;
  callbackUrl: string;
}

export function LoginView({
  currentUser,
  googleConfigured,
  githubConfigured,
  enableDevSwitcher,
  callbackUrl,
}: LoginViewProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("priya.nair@shopsphere.in");
  const [password, setPassword] = useState("shopsphere123");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleOAuthSignIn = async (provider: "google" | "github") => {
    setErrorMessage(null);
    const isConfigured =
      provider === "google" ? googleConfigured : githubConfigured;

    if (!isConfigured) {
      setErrorMessage(
        `${
          provider === "google" ? "Google" : "GitHub"
        } OAuth client credentials (${
          provider === "google"
            ? "GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET"
            : "GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET"
        }) are not configured in your .env file. Follow the setup guide below or use Email/Password / Local Dev Personas for the practical demo.`
      );
      showToast(
        `${provider === "google" ? "Google" : "GitHub"} OAuth credentials not set in .env`,
        "info"
      );
      return;
    }

    try {
      await authClient.signIn.social({
        provider,
        callbackURL: callbackUrl || "/",
      });
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : `Failed to initiate ${provider} OAuth flow. Ensure MySQL is running and OAuth credentials are valid.`
      );
    }
  };

  const handleEmailAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    startTransition(async () => {
      const res = await authenticateWithEmailAction({
        email,
        password,
        name: mode === "signup" ? name : undefined,
        mode,
      });

      if (!res.ok || !res.user) {
        setErrorMessage(res.error || "Authentication failed.");
        showToast(res.error || "Authentication failed", "error");
        return;
      }

      showToast(
        `Signed in as ${res.user.name} (${res.user.role})`,
        "success"
      );
      router.push(
        res.user.role === "ADMIN" && callbackUrl === "/"
          ? "/dashboard"
          : callbackUrl || "/"
      );
      router.refresh();
    });
  };

  const handleQuickPersona = (
    personaEmail:
      | "admin@shopsphere.in"
      | "priya.nair@shopsphere.in"
      | "rohan.deshmukh@shopsphere.in",
    label: string,
    targetRedirect: string
  ) => {
    setErrorMessage(null);
    startTransition(async () => {
      const res = await switchDemoPersonaAction(personaEmail);
      if (res.ok) {
        showToast(`Authenticated as ${label}`, "success");
        router.push(targetRedirect);
        router.refresh();
      } else {
        setErrorMessage(res.error || "Could not switch persona.");
      }
    });
  };

  const handleSignOut = () => {
    startTransition(async () => {
      await signOutAction();
      showToast("Signed out of session.", "info");
      router.refresh();
    });
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
      {/* Left: Better Auth Sign-In & OAuth Card */}
      <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Experiment 7: Better Auth + OAuth 2.0
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900">
            {mode === "signin"
              ? "Sign In to ShopSphere"
              : "Create a Customer Account"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Authenticate via Google/GitHub OAuth, Email &amp; Password, or select
            a seeded persona on the right for college practical demonstration.
          </p>
        </div>

        {/* Active Session Banner if already logged in */}
        {currentUser && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-emerald-950">
                  Active Session: {currentUser.name} ({currentUser.role})
                </p>
                <p className="text-emerald-800">{currentUser.email}</p>
              </div>
            </div>
            <button
              type="button"
              disabled={isPending}
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-emerald-300 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs sm:text-sm text-rose-800">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {/* OAuth 2.0 Providers */}
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            OAuth 2.0 Social Providers (Better Auth)
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleOAuthSignIn("google")}
              className={`flex items-center justify-center gap-2.5 rounded-xl border px-4 py-2.5 text-xs font-semibold transition ${
                googleConfigured
                  ? "border-slate-300 bg-white text-slate-800 hover:bg-slate-50 shadow-sm"
                  : "border-dashed border-slate-300 bg-slate-50 text-slate-500 hover:bg-slate-100"
              }`}
            >
              <span className="font-extrabold text-sm text-indigo-600">G</span>
              <span>Continue with Google</span>
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                  googleConfigured
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {googleConfigured ? "READY" : "NEEDS .ENV"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleOAuthSignIn("github")}
              className={`flex items-center justify-center gap-2.5 rounded-xl border px-4 py-2.5 text-xs font-semibold transition ${
                githubConfigured
                  ? "border-slate-800 bg-slate-900 text-white hover:bg-slate-800 shadow-sm"
                  : "border-dashed border-slate-300 bg-slate-50 text-slate-500 hover:bg-slate-100"
              }`}
            >
              <span className="font-mono font-bold text-xs">GH</span>
              <span>Continue with GitHub</span>
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                  githubConfigured
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {githubConfigured ? "READY" : "NEEDS .ENV"}
              </span>
            </button>
          </div>

          {(!googleConfigured || !githubConfigured) && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-[11px] text-amber-900 space-y-1">
              <p className="font-bold">
                OAuth Configuration Notice (Experiment 7 Transparency):
              </p>
              <p>
                {!googleConfigured && !githubConfigured
                  ? "Neither Google nor GitHub OAuth credentials are set in .env."
                  : !googleConfigured
                  ? "Google OAuth credentials are not set in .env."
                  : "GitHub OAuth credentials are not set in .env."}{" "}
                To enable live OAuth redirects, add{" "}
                <code className="font-mono">GOOGLE_CLIENT_ID</code> /{" "}
                <code className="font-mono">GITHUB_CLIENT_ID</code> in{" "}
                <code className="font-mono">.env</code> with callback URLs{" "}
                <code className="font-mono">
                  http://localhost:3000/api/auth/callback/google
                </code>{" "}
                and{" "}
                <code className="font-mono">
                  http://localhost:3000/api/auth/callback/github
                </code>
                .
              </p>
            </div>
          )}
        </div>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-200" />
          <span className="flex-shrink mx-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Or Email &amp; Password
          </span>
          <div className="flex-grow border-t border-slate-200" />
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          {mode === "signup" && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ananya Sharma"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm text-slate-900"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="priya.nair@shopsphere.in"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Password *
            </label>
            <div className="relative">
              <Lock className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm text-slate-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60 transition"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Authenticating...
              </>
            ) : mode === "signin" ? (
              "Sign In with Email"
            ) : (
              "Create Customer Account"
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-600 pt-1">
          {mode === "signin" ? (
            <p>
              New to ShopSphere?{" "}
              <button
                type="button"
                onClick={() => setMode("signup")}
                className="font-bold text-indigo-600 hover:underline"
              >
                Create a Customer Account
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("signin")}
                className="font-bold text-indigo-600 hover:underline"
              >
                Sign In Here
              </button>
            </p>
          )}
        </div>
      </div>

      {/* Right: Local Development Workflow & RBAC Viva Demonstration Panel */}
      <div className="lg:col-span-5 space-y-5">
        {enableDevSwitcher && (
          <div className="rounded-2xl border border-indigo-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600">
              <Sparkles className="h-4 w-4" />
              Local Development Workflow (Exp 7 &amp; 8)
            </div>

            <h2 className="text-lg font-bold text-slate-900">
              1-Click Practical &amp; Viva Demo Accounts
            </h2>

            <p className="text-xs text-slate-600 leading-relaxed">
              During a college lab practical when external OAuth keys are not
              configured, select any seeded persona below. This issues a{" "}
              <strong className="text-slate-800">
                server-signed HTTP-only HMAC session cookie
              </strong>{" "}
              (never stored in <code className="font-mono">localStorage</code>).
            </p>

            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  handleQuickPersona(
                    "priya.nair@shopsphere.in",
                    "Priya Nair (Customer)",
                    callbackUrl || "/products"
                  )
                }
                className="w-full flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-left hover:bg-emerald-100/70 transition"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    Priya Nair — Customer Account #1
                  </p>
                  <p className="text-[11px] text-slate-600">
                    priya.nair@shopsphere.in • Has order SPH-2026-1001
                  </p>
                </div>
                <span className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[10px] font-bold text-white">
                  CUSTOMER
                </span>
              </button>

              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  handleQuickPersona(
                    "rohan.deshmukh@shopsphere.in",
                    "Rohan Deshmukh (Customer)",
                    callbackUrl || "/orders"
                  )
                }
                className="w-full flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-left hover:bg-emerald-100/70 transition"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    Rohan Deshmukh — Customer Account #2
                  </p>
                  <p className="text-[11px] text-slate-600">
                    rohan.deshmukh@shopsphere.in • Has order SPH-2026-1002
                  </p>
                </div>
                <span className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[10px] font-bold text-white">
                  CUSTOMER
                </span>
              </button>

              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  handleQuickPersona(
                    "admin@shopsphere.in",
                    "Aarav Mehta (Admin)",
                    "/dashboard"
                  )
                }
                className="w-full flex items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50/80 p-3.5 text-left hover:bg-indigo-100/80 transition"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    Aarav Mehta — Platform Administrator
                  </p>
                  <p className="text-[11px] text-slate-600">
                    admin@shopsphere.in • Full CRUD &amp; Dashboard Access
                  </p>
                </div>
                <span className="rounded-lg bg-indigo-600 px-2.5 py-1 text-[10px] font-bold text-white">
                  ADMIN
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Security & Cookie Architecture Note */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2.5 text-xs text-slate-600">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <ShieldCheck className="h-4 w-4 text-indigo-600" />
            Session &amp; RBAC Security Guarantees (Exp 7, 8 &amp; 10)
          </div>
          <ul className="list-disc list-inside space-y-1 leading-relaxed">
            <li>
              Session tokens are stored exclusively in{" "}
              <code className="font-mono text-indigo-700">HttpOnly</code>,{" "}
              <code className="font-mono text-indigo-700">SameSite=Lax</code>{" "}
              cookies — never in <code className="font-mono">localStorage</code>.
            </li>
            <li>
              User roles (<code className="font-mono">GUEST</code>,{" "}
              <code className="font-mono">CUSTOMER</code>,{" "}
              <code className="font-mono">ADMIN</code>) are resolved on the
              server from MySQL / server store.
            </li>
            <li>
              Better Auth API handler is mounted at{" "}
              <a
                href="/api/auth/ok"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-0.5 text-indigo-600 font-semibold hover:underline"
              >
                /api/auth/[...all] <ExternalLink className="h-3 w-3" />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
